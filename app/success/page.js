'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f8', flexDirection: 'column', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #f43f5e', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Unlocking your experience...</p>
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
      color: { dark: '#881337', light: '#fffdfd' }
    })
      .then(setQrCodeUrl)
      .catch(() => setQrCodeUrl(''));
  }, [note, getShareUrl]);

  const getWhatsAppUrl = () => {
    const link = getShareUrl();
    const name = note?.recipient_name || 'you';
    const text = `Hey ${name}! 🎁 Someone crafted a beautiful private interactive experience just for you...\n\nTap here to unwrap your moment: ${link}\n\n✨ Made with love on LovelyCrafts`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadQrCode = async () => {
    if (!qrCodeUrl) return;
    setDownloadingQr(true);
    try {
      const branded = await createBrandedQrImage(qrCodeUrl);
      const a = document.createElement('a');
      a.href = branded;
      a.download = `lovelycrafts-qr-${(note?.recipient_name || 'moment').toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    } finally {
      setDownloadingQr(false);
    }
  };

  const downloadKeepsake = async () => {
    setDownloadingKeepsake(true);
    try {
      const posterUrl = await createKeepsakePoster(note, qrCodeUrl);
      const a = document.createElement('a');
      a.href = posterUrl;
      a.download = `lovelycrafts-keepsake-${(note?.recipient_name || 'moment').toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    } catch (e) {
      console.error('Keepsake error:', e);
    } finally {
      setDownloadingKeepsake(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f8', flexDirection: 'column', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #f43f5e', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Loading your moment...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f8', flexDirection: 'column', gap: '1.5rem', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>💔</div>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', textAlign: 'center', margin: 0, fontWeight: 800 }}>Experience Not Found</h1>
        <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>We could not find the experience details.</p>
        <Link href="/profile" style={{ background: '#f43f5e', color: '#fff', padding: '12px 28px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700 }}>
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const recipient = note.recipient_name || 'Someone Special';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fff5f8 0%, #fff0f5 50%, #faf0f7 100%)',
      color: '#0f172a',
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
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid #fce7f3',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 2px 10px rgba(244, 63, 94, 0.05)',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be185d', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 800 }}>
            <span>←</span> Profile &amp; Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>💖</span>
            <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a' }}>LovelyCrafts</span>
          </div>
          <span style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '50px' }}>
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
            background: 'linear-gradient(145deg, #ffffff 0%, #fff1f5 100%)',
            border: '1.5px solid #fecdd3',
            borderRadius: '28px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(244, 63, 94, 0.12)',
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
            color: '#be185d',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.4rem',
          }}>
            Payment Successful • Moment Live
          </span>

          <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: '#0f172a', margin: '0 0 0.4rem', lineHeight: 1.15 }}>
            {recipient}&apos;s Moment is Ready!
          </h1>

          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 auto 1.25rem', maxWidth: '380px' }}>
            Your custom private experience is live and unlocked permanently. Share the surprise using the options below!
          </p>

          {/* Shareable Link Box */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #fecdd3',
            borderRadius: '16px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}>
            <span style={{
              fontSize: '0.82rem',
              color: '#be185d',
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
                background: copied ? '#ecfdf5' : '#fff1f2',
                border: copied ? '1px solid #a7f3d0' : '1px solid #fecdd3',
                color: copied ? '#059669' : '#be185d',
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
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1.5px solid #86efac',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.1)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '1rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', flexShrink: 0,
            }}>
              👀
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Live Response &amp; Reaction Tracker
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065f46', margin: '2px 0 4px' }}>
                See {recipient}&apos;s Reaction on Your Profile
              </h2>
              <p style={{ color: '#047857', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
                When {recipient} completes their experience and reacts, their emotions, rating, and secret reply will appear live in your dashboard.
              </p>
            </div>
          </div>

          {/* Current Status Pill */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #bbf7d0',
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
                background: note.recipient_reaction ? '#f43f5e' : (note.view_count > 0 ? '#16a34a' : '#94a3b8'),
                boxShadow: note.recipient_reaction || note.view_count > 0 ? '0 0 8px currentColor' : 'none',
              }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1f2937' }}>
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
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.25)',
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
            border: '1.5px solid #fecdd3',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.85rem' }}>
            🚀 Instant Sharing Options
          </div>

          {/* Primary WhatsApp Button */}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#ffffff',
              padding: '15px 20px',
              borderRadius: '16px',
              textDecoration: 'none',
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
            <span>Send to {recipient} via WhatsApp</span>
          </a>

          {/* Secondary Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={copyLink}
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: copied ? '#ecfdf5' : '#f8fafc',
                border: copied ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                color: copied ? '#059669' : '#0f172a',
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
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be185d',
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
        </motion.div>

        {/* ── HD DOWNLOADS STATION (QR & KEEPSAKE) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            background: '#ffffff',
            border: '1.5px solid #fecdd3',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
            🎁 Physical Gifts &amp; Downloads
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* QR Card */}
            <div style={{
              background: '#fff9fb',
              border: '1px solid #fce7f3',
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
                  style={{ width: '90px', height: '90px', borderRadius: '10px', border: '1px solid #fecdd3', marginBottom: '0.75rem' }}
                />
              ) : (
                <div style={{ width: '90px', height: '90px', background: '#f1f5f9', borderRadius: '10px', marginBottom: '0.75rem' }} />
              )}
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                HD QR Card
              </div>
              <button
                onClick={downloadQrCode}
                disabled={downloadingQr || !qrCodeUrl}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#be185d',
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
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '16px',
              padding: '1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '2.4rem', margin: '10px 0' }}>🖼️ ✨</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#78350f', marginBottom: '0.5rem' }}>
                Keepsake Poster
              </div>
              <button
                onClick={downloadKeepsake}
                disabled={downloadingKeepsake}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: downloadingKeepsake ? 'not-allowed' : 'pointer',
                }}
              >
                {downloadingKeepsake ? 'Rendering…' : 'Download Poster'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Link
            href="/templates"
            style={{
              color: '#64748b',
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

      ctx.fillStyle = '#fff8fb';
      ctx.fillRect(0, 0, 900, 1080);

      const glow = ctx.createRadialGradient(450, 500, 80, 450, 500, 520);
      glow.addColorStop(0, 'rgba(244,63,94,0.12)');
      glow.addColorStop(1, 'rgba(255,248,251,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 900, 1080);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#be185d';
      ctx.font = '800 34px Arial, sans-serif';
      ctx.fillText('LOVELYCRAFTS', 450, 90);

      roundedRect(ctx, 155, 130, 590, 590, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f43f5e';
      ctx.stroke();
      ctx.drawImage(qr, 185, 160, 530, 530);

      ctx.fillStyle = '#e11d48';
      ctx.font = '800 30px Arial, sans-serif';
      ctx.fillText('Scan to open', 450, 820);
      ctx.fillStyle = '#334155';
      ctx.font = '600 24px Arial, sans-serif';
      ctx.fillText('a private moment made just for them', 450, 860);
      ctx.fillStyle = '#94a3b8';
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
