'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { createKeepsakePoster } from '@/components/KeepsakePoster';

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', flexDirection: 'column', gap: '1rem', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #eadfd2', borderTopColor: '#9d382f', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ color: '#78695f', fontSize: '0.9rem', fontWeight: 600 }}>Unlocking your experience...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [downloadingKeepsake, setDownloadingKeepsake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const purchaseTracked = useRef('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, 'notes', id), (snap) => {
      if (snap.exists()) {
        const raw = snap.data();
        setNote({
          id: snap.id,
          recipient_name: raw.recipient_name || '',
          custom_message: raw.custom_message || '',
          image_urls: Array.isArray(raw.image_urls) ? raw.image_urls : [],
          custom_details: raw.custom_details || null,
          template: raw.template || 'proposal',
          custom_slug: raw.custom_slug || null,
          is_paid: raw.is_paid || false,
          view_count: raw.view_count || 0,
          last_viewed_at: raw.last_viewed_at || null,
          recipient_reaction: raw.recipient_reaction || null,
          voice_note_url: raw.voice_note_url || null,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const getShareUrl = useCallback((n = note) => {
    if (!n) return '';
    const slug = n?.custom_slug || n?.id;
    if (typeof window !== 'undefined') return `${window.location.origin}/p/${slug}`;
    return `/p/${slug}`;
  }, [note]);

  useEffect(() => {
    if (!note) return;
    QRCode.toDataURL(getShareUrl(note), {
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#3f3029', light: '#fffdf9' }
    })
      .then(setQrCodeUrl)
      .catch(() => setQrCodeUrl(''));
  }, [note, getShareUrl]);

  useEffect(() => {
    if (!note?.is_paid || purchaseTracked.current === note.id) return;
    purchaseTracked.current = note.id;
    const storageKey = `lc_purchase_tracked_${note.id}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
      window.localStorage.setItem(storageKey, '1');
    } catch {
      // Keep tracking available if browser storage is disabled.
    }
    // Do not pass the recipient, note id, custom slug, or current URL to GA4.
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    window.gtag('event', 'purchase', {
      currency: 'INR',
      items: [{ item_id: note.template || 'digital-gift', item_name: 'LovelyCrafts digital gift', quantity: 1 }],
    });
  }, [note]);

  const getShareText = () => {
    const link = getShareUrl();
    const name = note?.recipient_name || 'you';
    return `Hey ${name}! 🎁 Someone crafted a beautiful private interactive experience just for you...\n\nTap here to unwrap your moment: ${link}\n\n✨ Made with love on LovelyCrafts`;
  };

  const getWhatsAppUrl = () => {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`;
  };

  const shareNative = async () => {
    const link = getShareUrl();
    const name = note?.recipient_name || 'Someone Special';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${name}'s Special Surprise`,
          text: getShareText(),
          url: link,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    window.open(getWhatsAppUrl(), '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const getEmailShareUrl = () => {
    const name = note?.recipient_name || 'Someone Special';
    const subject = `A private surprise for ${name} 🎁`;
    const body = getShareText();
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getSmsShareUrl = () => {
    const body = getShareText();
    return `sms:?&body=${encodeURIComponent(body)}`;
  };

  const downloadFileFromDataUrl = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  };

  const downloadQrCode = async () => {
    if (!qrCodeUrl) return;
    setDownloadingQr(true);
    setDownloadError('');
    try {
      const branded = await createBrandedQrImage(qrCodeUrl);
      const filename = `lovelycrafts-qr-${(note?.recipient_name || 'moment').toLowerCase().replace(/\s+/g, '-')}.png`;
      downloadFileFromDataUrl(branded, filename);
    } catch (e) {
      console.error('QR download error:', e);
      setDownloadError('Failed to download QR code. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  const downloadKeepsake = async () => {
    setDownloadingKeepsake(true);
    setDownloadError('');
    try {
      const posterUrl = await createKeepsakePoster(note, qrCodeUrl);
      const filename = `lovelycrafts-keepsake-${(note?.recipient_name || 'moment').toLowerCase().replace(/\s+/g, '-')}.png`;
      downloadFileFromDataUrl(posterUrl, filename);
    } catch (e) {
      console.error('Keepsake error:', e);
      setDownloadError('Failed to render keepsake poster. Please try again.');
    } finally {
      setDownloadingKeepsake(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', flexDirection: 'column', gap: '1rem', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #eadfd2', borderTopColor: '#9d382f', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#78695f', fontSize: '0.9rem', fontWeight: 600 }}>Loading your moment...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', flexDirection: 'column', gap: '1.5rem', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: '3rem' }}>💔</div>
        <h1 style={{ color: '#3f3029', fontSize: '1.5rem', textAlign: 'center', margin: 0, fontWeight: 800 }}>Experience Not Found</h1>
        <p style={{ color: '#78695f', textAlign: 'center', margin: 0 }}>We could not find the experience details.</p>
        <Link href="/profile" style={{ background: '#9d382f', color: '#fff', padding: '12px 28px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700 }}>
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const recipient = note.recipient_name || 'Someone Special';

  return (
    <div className="lc-page-shell" style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8f3eb 0%, #faf6f0 50%, #f4ede4 100%)',
      color: '#3f3029',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '5rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
        @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.8} 50%{transform:scale(1.05);opacity:0.4} 100%{transform:scale(0.95);opacity:0.8} }
      `}</style>

      {/* Top Brand Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255, 252, 246, 0.92)',
        borderBottom: '1px solid #eadfd2',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 2px 10px rgba(63, 48, 41, 0.04)',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9d382f', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 800 }}>
            <span>←</span> Profile &amp; Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>💖</span>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#3f3029' }}>LovelyCrafts</span>
          </div>
          <span style={{ background: '#eaf5eb', border: '1px solid #c7e8cc', color: '#276738', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '50px' }}>
            ✓ Unlocked
          </span>
        </div>
      </header>

      <main style={{ maxWidth: '520px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>

        {/* Celebration Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          style={{
            background: 'linear-gradient(145deg, #fffdf9 0%, #fbf6ef 100%)',
            border: '1.5px solid #eadfd2',
            borderRadius: '28px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(63, 48, 41, 0.08)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '3.2rem', marginBottom: '0.5rem', animation: 'float-slow 3s ease-in-out infinite' }}>
            🎉 💌
          </div>

          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#9d382f',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.4rem',
          }}>
            Payment Successful • Moment Live
          </span>

          <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: '#3f3029', margin: '0 0 0.4rem', lineHeight: 1.15 }}>
            {recipient}&apos;s Moment is Ready!
          </h1>

          <p style={{ color: '#78695f', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 auto 1.25rem', maxWidth: '380px' }}>
            Your custom private experience is live and unlocked permanently. Share the surprise using the options below!
          </p>

          {/* Shareable Link Box */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #eadfd2',
            borderRadius: '16px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(63, 48, 41, 0.04)',
          }}>
            <span style={{
              fontSize: '0.82rem',
              color: '#9d382f',
              fontFamily: 'monospace',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              textAlign: 'left',
            }}>
              {getShareUrl()}
            </span>
            <button
              onClick={copyLink}
              style={{
                background: copied ? '#ecfdf5' : '#f8f3eb',
                border: copied ? '1px solid #a7f3d0' : '1px solid #eadfd2',
                color: copied ? '#059669' : '#9d382f',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </motion.div>

        {/* ── REAL-TIME REACTION TRACKER & PROFILE PROMPT ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'linear-gradient(135deg, #f2f9f3 0%, #ebf5ee 100%)',
            border: '1.5px solid #c7e8cc',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(39, 103, 56, 0.08)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: '#daf0df', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', flexShrink: 0,
            }}>
              👀
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1f6634', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Live Response &amp; Reaction Tracker
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#164e27', margin: '2px 0 4px' }}>
                See {recipient}&apos;s Reaction on Your Profile
              </h2>
              <p style={{ color: '#276738', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
                When {recipient} completes their experience and reacts, their emotions, rating, and secret reply will appear live in your dashboard.
              </p>
            </div>
          </div>

          {/* Current Status Pill */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #c7e8cc',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: note.recipient_reaction ? '#9d382f' : (note.view_count > 0 ? '#16a34a' : '#a89d95'),
                boxShadow: note.recipient_reaction || note.view_count > 0 ? '0 0 8px currentColor' : 'none',
              }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3f3029' }}>
                {note.recipient_reaction
                  ? `💌 ${recipient} reacted with ${note.recipient_reaction.emoji} (${note.recipient_reaction.label})`
                  : (note.view_count > 0 ? `👀 Opened ${note.view_count} time${note.view_count > 1 ? 's' : ''} · Waiting for reaction` : 'Waiting for recipient to open link')}
              </span>
            </div>
          </div>

          <Link
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #276738 0%, #1f6634 100%)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(39, 103, 56, 0.25)',
              boxSizing: 'border-box',
            }}
          >
            <span>Go to Your Profile Dashboard</span>
            <span>➔</span>
          </Link>
        </motion.div>

        {/* ── INSTANT SHARING OPTIONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: '#ffffff',
            border: '1.5px solid #eadfd2',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(63, 48, 41, 0.04)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9d382f', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.85rem' }}>
            🚀 Instant Sharing Options
          </div>

          {/* Primary Native Share / WhatsApp Button */}
          <button
            onClick={shareNative}
            type="button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
              color: '#ffffff',
              padding: '15px 20px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
              marginBottom: '0.75rem',
              transition: 'transform 0.2s',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Share Surprise with {recipient}</span>
          </button>

          {/* Secondary Action Buttons (Copy Link + View Live) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '0.75rem' }}>
            <button
              onClick={copyLink}
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: copied ? '#ecfdf5' : '#fffdf9',
                border: copied ? '1px solid #a7f3d0' : '1px solid #eadfd2',
                color: copied ? '#059669' : '#3f3029',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
            </button>

            <Link
              href={`/p/${note.custom_slug || note.id}`}
              target="_blank"
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: '#f8f3eb',
                border: '1px solid #eadfd2',
                color: '#9d382f',
                fontSize: '0.85rem',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>👁️ View Live</span>
            </Link>
          </div>

          {/* Tertiary Share Options (Email + SMS) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <a
              href={getEmailShareUrl()}
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: '#fffdf9',
                border: '1px solid #eadfd2',
                color: '#78695f',
                fontSize: '0.82rem',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>✉️ Share via Email</span>
            </a>

            <a
              href={getSmsShareUrl()}
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: '#fffdf9',
                border: '1px solid #eadfd2',
                color: '#78695f',
                fontSize: '0.82rem',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>💬 Share via SMS</span>
            </a>
          </div>
        </motion.div>

        {/* ── HD DOWNLOADS STATION (QR & KEEPSAKE) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            background: '#ffffff',
            border: '1.5px solid #eadfd2',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(63, 48, 41, 0.04)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9d382f', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
            🎁 Physical Gifts &amp; Downloads
          </div>

          {downloadError && (
            <div style={{
              background: '#fff1f0',
              border: '1px solid #fed7d7',
              color: '#9d382f',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1rem',
              textAlign: 'center',
            }}>
              {downloadError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* QR Card */}
            <div style={{
              background: '#fffdf9',
              border: '1px solid #eadfd2',
              borderRadius: '16px',
              padding: '1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{ width: '90px', height: '90px', borderRadius: '10px', border: '1px solid #eadfd2', marginBottom: '0.75rem' }}
                />
              ) : (
                <div style={{ width: '90px', height: '90px', background: '#f8f3eb', borderRadius: '10px', marginBottom: '0.75rem' }} />
              )}
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3f3029', marginBottom: '0.5rem' }}>
                HD QR Card
              </div>
              <button
                onClick={downloadQrCode}
                disabled={downloadingQr || !qrCodeUrl}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#f8f3eb',
                  border: '1px solid #eadfd2',
                  color: '#9d382f',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: downloadingQr ? 'not-allowed' : 'pointer',
                }}
              >
                {downloadingQr ? 'Generating…' : 'Download QR'}
              </button>
            </div>

            {/* Keepsake Poster */}
            <div style={{
              background: '#fffbf5',
              border: '1px solid #eadfd2',
              borderRadius: '16px',
              padding: '1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '2.4rem', margin: '10px 0' }}>🖼️ ✨</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3f3029', marginBottom: '0.5rem' }}>
                Keepsake Poster
              </div>
              <button
                onClick={downloadKeepsake}
                disabled={downloadingKeepsake}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#f8f3eb',
                  border: '1px solid #eadfd2',
                  color: '#9d382f',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: downloadingKeepsake ? 'not-allowed' : 'pointer',
                }}
              >
                {downloadingKeepsake ? 'Rendering…' : 'Download Poster'}
              </button>
            </div>

            {/* Direct Invoice View & Download Card */}
            {note?.is_paid && (
              <div style={{
                gridColumn: '1 / -1',
                marginTop: '6px',
                background: '#fffdf9',
                border: '1.5px solid #eadfd2',
                borderRadius: '16px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🧾</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#3f3029' }}>
                      Tax Invoice &amp; Payment Receipt
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#78695f' }}>
                      Official proof of payment with GST breakdown
                    </div>
                  </div>
                </div>
                <Link
                  href={`/invoice/${note.id}`}
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1.5px solid #eadfd2',
                    color: '#9d382f',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '8px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(63, 48, 41, 0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  📄 View / Download Invoice
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Link
            href="/templates"
            style={{
              color: '#78695f',
              fontSize: '0.84rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            + Craft another surprise
          </Link>
        </div>

      </main>
    </div>
  );
}

function createBrandedQrImage(qrDataUrl) {
  return new Promise((resolve, reject) => {
    const qr = new Image();
    qr.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas error'));

      ctx.fillStyle = '#f8f3eb';
      ctx.fillRect(0, 0, 900, 1080);

      const glow = ctx.createRadialGradient(450, 500, 80, 450, 500, 520);
      glow.addColorStop(0, 'rgba(157, 56, 47, 0.12)');
      glow.addColorStop(1, 'rgba(248, 243, 235, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 900, 1080);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#3f3029';
      ctx.font = '800 34px Arial, sans-serif';
      ctx.fillText('LOVELYCRAFTS', 450, 90);

      roundedRect(ctx, 155, 130, 590, 590, 32);
      ctx.fillStyle = '#fffdf9';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#eadfd2';
      ctx.stroke();
      ctx.drawImage(qr, 185, 160, 530, 530);

      ctx.fillStyle = '#9d382f';
      ctx.font = '800 30px Arial, sans-serif';
      ctx.fillText('Scan to open', 450, 820);
      ctx.fillStyle = '#3f3029';
      ctx.font = '600 24px Arial, sans-serif';
      ctx.fillText('a private moment made just for them', 450, 860);
      ctx.fillStyle = '#78695f';
      ctx.font = '600 20px Arial, sans-serif';
      ctx.fillText('lovelycrafts.in', 450, 950);

      resolve(canvas.toDataURL('image/png'));
    };
    qr.onerror = () => reject(new Error('QR load error'));
    qr.src = qrDataUrl;
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
