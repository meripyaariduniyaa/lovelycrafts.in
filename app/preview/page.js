'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import PayButton from '@/components/PayButton';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates } from '@/lib/templates';
import { createKeepsakePoster } from '@/components/KeepsakePoster';

/* ─────────────────────────────────────────────────────────
   TEMPLATE ACCENT MAP
───────────────────────────────────────────────────────── */
const ACCENT_MAP = {
  proposal: { color: '#f43f5e', glow: 'rgba(244,63,94,0.25)', gradient: 'linear-gradient(135deg,#f43f5e,#be123c)', emoji: '💕' },
  birthday: { color: '#f59e0b', glow: 'rgba(245,158,11,0.25)', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)', emoji: '🎂' },
  anniversary: { color: '#fbbf24', glow: 'rgba(251,191,36,0.25)', gradient: 'linear-gradient(135deg,#fbbf24,#92400e)', emoji: '🥂' },
  'emotional-apology': { color: '#94a3b8', glow: 'rgba(148,163,184,0.25)', gradient: 'linear-gradient(135deg,#94a3b8,#475569)', emoji: '🥺' },
  'i-miss-you': { color: '#818cf8', glow: 'rgba(129,140,248,0.25)', gradient: 'linear-gradient(135deg,#818cf8,#4f46e5)', emoji: '🌌' },
};

/* ─────────────────────────────────────────────────────────
   PAGE ENTRY
───────────────────────────────────────────────────────── */
export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080811', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #f43f5e', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Preparing your preview...</p>
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PREVIEW CONTENT
───────────────────────────────────────────────────────── */
function PreviewContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [downloadingKeepsake, setDownloadingKeepsake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dynamicPricing, setDynamicPricing] = useState({});

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.pricing) setDynamicPricing(data.pricing);
      })
      .catch(() => {});
  }, []);

  // Listen to Firestore
  useEffect(() => {
    if (!id) return;
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
        setPaid(raw.is_paid || false);
      }
      setLoading(false);
    });
  }, [id]);

  // Generate QR
  useEffect(() => {
    if (!note) return;
    QRCode.toDataURL(getShareUrl(note), { width: 360, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#881337', light: '#fffdfd' } })
      .then(setQrCodeUrl)
      .catch(() => setQrCodeUrl(''));
  }, [note]);

  const getShareUrl = useCallback((n = note) => {
    if (!n) return '';
    const slug = n?.custom_slug || n?.id;
    if (typeof window !== 'undefined') return `${window.location.origin}/p/${slug}`;
    return `/p/${slug}`;
  }, [note]);

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
      a.download = `lovelycrafts-qr-${note?.recipient_name || 'special'}.png`;
      a.click();
    } finally { setDownloadingQr(false); }
  };

  const downloadKeepsake = async () => {
    setDownloadingKeepsake(true);
    try {
      const posterUrl = await createKeepsakePoster(note, qrCodeUrl);
      const a = document.createElement('a');
      a.href = posterUrl;
      a.download = `lovelycrafts-keepsake-${(note?.recipient_name || 'moment').toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    } catch (e) { console.error('Keepsake error:', e); }
    finally { setDownloadingKeepsake(false); }
  };

  const handlePaymentSuccess = () => {
    setPaid(true);
    router.push(`/success?id=${note.id}`);
  };

  const accent = ACCENT_MAP[note?.template] || ACCENT_MAP.proposal;
  const selectedTemplate = templates.find((t) => t.id === note?.template);
  const activePricing = dynamicPricing[note?.template] || {};
  const totalAmount = activePricing.price || selectedTemplate?.price || 199;
  const baseAmount = activePricing.basePrice || selectedTemplate?.basePrice || 499;

  // ── LOADING ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080811', flexDirection: 'column', gap: '1rem' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${accent.color}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Preparing your private preview...</p>
      </div>
    );
  }

  // ── NOT FOUND ──
  if (!note) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080811', flexDirection: 'column', gap: '1.5rem', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>💔</div>
        <h1 style={{ color: '#ffffff', fontSize: '1.5rem', textAlign: 'center', margin: 0, fontWeight: 800 }}>Experience Not Found</h1>
        <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>This experience may have expired or the link is incorrect.</p>
        <Link href="/create" style={{ background: '#f43f5e', color: '#fff', padding: '12px 28px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
          Create a New Experience
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        height: paid ? 'auto' : '100dvh',
        minHeight: '100vh',
        maxHeight: paid ? 'none' : '100dvh',
        background: '#080811',
        backgroundImage: `
          radial-gradient(circle at 50% 15%, rgba(225, 29, 72, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 10% 40%, rgba(147, 51, 234, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 90% 70%, rgba(244, 63, 94, 0.08) 0%, transparent 50%)
        `,
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: paid ? 'auto' : 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
        
        /* Subtle cosmic dust stars */
        .cosmic-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.18) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.25;
          pointer-events: none;
        }

        /* Device mockup scrollbar styling */
        .device-screen-scroll::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>

      {/* ── TOP HEADER (Matching reference design with circular back button and centered title) ── */}
      <header
        style={{
          flexShrink: 0,
          position: 'relative',
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(8, 8, 17, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0.45rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '40px 1fr 40px',
            alignItems: 'center',
          }}
        >
          {/* Circular Back Button */}
          <Link
            href={`/create?template=${note?.template || 'proposal'}`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: 'transform 0.15s ease',
            }}
            title="Edit Experience"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          {/* Centered Title & Subtitle */}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Preview
            </h1>
            <p style={{ margin: '1px 0 0', fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>
              This is how it will look
            </p>
          </div>

          {/* Right Spacer / Paid Hub Button */}
          {paid ? (
            <Link
              href={`/success?id=${note.id}`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
              title="Share Hub"
            >
              ✓
            </Link>
          ) : (
            <div style={{ width: '32px' }} />
          )}
        </div>
      </header>

      {/* ── MAIN VIEWPORT (Phone Mockup perfectly fitted into available space) ── */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: paid ? '1.5rem 1rem 3rem' : '4px 12px 6px',
          position: 'relative',
          overflow: paid ? 'visible' : 'hidden',
        }}
      >
        {/* Recipient note title pill if not paid */}
        {!paid && note.recipient_name && (
          <div
            style={{
              flexShrink: 0,
              marginBottom: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#fecdd3',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '2px 12px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✨</span>
            <span>Crafted for <strong>{note.recipient_name}</strong></span>
          </div>
        )}

        {/* ── REALISTIC SMARTPHONE DEVICE MOCKUP ── */}
        <div
          style={{
            position: 'relative',
            flex: paid ? 'none' : '1',
            minHeight: 0,
            height: paid ? 'clamp(500px, 64vh, 660px)' : '100%',
            maxHeight: paid ? 'none' : '100%',
            aspectRatio: paid ? 'auto' : '9 / 18.5',
            width: paid ? '100%' : 'auto',
            maxWidth: 'min(380px, 92vw)',
            background: '#000000',
            borderRadius: '38px',
            border: '3.5px solid rgba(255, 255, 255, 0.16)',
            boxShadow: `
              0 20px 50px -15px rgba(0, 0, 0, 0.9),
              0 0 30px rgba(225, 29, 72, 0.15),
              inset 0 0 0 1px rgba(255, 255, 255, 0.08)
            `,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto',
          }}
        >
          {/* Top Speaker / Dynamic Island Notch Pill */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '84px',
              height: '18px',
              background: '#09090b',
              borderRadius: '12px',
              zIndex: 30,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#18181b', marginRight: '6px' }} />
            <div style={{ width: 32, height: 4, borderRadius: '4px', background: '#27272a' }} />
          </div>

          {/* Inner Phone Display Container */}
          <div
            className="device-screen-scroll"
            style={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              borderRadius: '40px',
              background: '#080810',
            }}
          >
            <TemplateRenderer note={note} isPreview={true} />
          </div>
        </div>

        {/* ── UNLOCKED PANEL (Shown when paid) ── */}
        {paid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ width: '100%', maxWidth: '440px', marginTop: '1.5rem' }}
          >
            <UnlockedPanel
              note={note}
              accent={accent}
              getShareUrl={getShareUrl}
              getWhatsAppUrl={getWhatsAppUrl}
              copyLink={copyLink}
              copied={copied}
              qrCodeUrl={qrCodeUrl}
              downloadQrCode={downloadQrCode}
              downloadingQr={downloadingQr}
              downloadKeepsake={downloadKeepsake}
              downloadingKeepsake={downloadingKeepsake}
            />
          </motion.div>
        )}
      </main>

      {/* ── FIXED COMPACT CHECKOUT DOCK (Unpaid) ── */}
      {!paid && (
        <PayButton
          apologyId={note.id}
          onPaid={handlePaymentSuccess}
          displayAmount={totalAmount}
          baseAmount={baseAmount}
          recipientName={note.recipient_name}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   UNLOCKED PANEL (Modernized in dark aesthetic)
───────────────────────────────────────────────────────── */
function UnlockedPanel({
  note,
  accent,
  getShareUrl,
  getWhatsAppUrl,
  copyLink,
  copied,
  qrCodeUrl,
  downloadQrCode,
  downloadingQr,
  downloadKeepsake,
  downloadingKeepsake,
}) {
  const recipient = note.recipient_name || 'them';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
    >
      {/* Celebration Header */}
      <div
        style={{
          background: 'linear-gradient(160deg, #064e3b 0%, #022c22 100%)',
          border: '1.5px solid #059669',
          borderRadius: '24px',
          padding: '1.5rem',
          boxShadow: '0 8px 30px rgba(5, 150, 105, 0.25)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🎉</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ecfdf5', margin: '0 0 0.3rem' }}>
          {recipient === 'them' ? 'Link Unlocked! 🎉' : `${recipient}'s moment is ready! 🎉`}
        </h2>
        <p style={{ color: '#a7f3d0', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
          Your experience is live. Share it whenever you&apos;re ready.
        </p>
      </div>

      {/* Share Section */}
      <div
        style={{
          background: '#11101e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '1.25rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Share with {recipient}
        </div>

        {/* URL strip */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '9px 12px',
            fontSize: '0.8rem',
            color: '#fbcfe8',
            wordBreak: 'break-all',
            fontWeight: 700,
            marginBottom: '0.85rem',
            fontFamily: 'monospace',
          }}
        >
          {getShareUrl()}
        </div>

        {/* WhatsApp Button */}
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            color: '#ffffff',
            padding: '14px',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1rem',
            marginBottom: '0.6rem',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Send on WhatsApp
        </motion.a>

        {/* Secondary Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={copyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: copied ? 'rgba(5, 150, 105, 0.25)' : 'rgba(255, 255, 255, 0.08)',
              border: copied ? '1px solid #059669' : '1px solid rgba(255, 255, 255, 0.15)',
              color: copied ? '#34d399' : '#ffffff',
              padding: '11px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>

          <button
            type="button"
            onClick={downloadKeepsake}
            disabled={downloadingKeepsake}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fef08a',
              padding: '11px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: downloadingKeepsake ? 'not-allowed' : 'pointer',
            }}
          >
            {downloadingKeepsake ? '⏳ Making…' : '✨ Keepsake'}
          </button>
        </div>
      </div>

      {/* QR Code */}
      {qrCodeUrl && (
        <div
          style={{
            background: '#11101e',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f43f5e', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            📲 Scan to Share
          </div>
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{ width: '130px', height: '130px', borderRadius: '14px', border: '1.5px solid #fecdd3', display: 'block', margin: '0 auto 0.85rem' }}
          />
          <button
            type="button"
            onClick={downloadQrCode}
            disabled={downloadingQr}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: downloadingQr ? 'not-allowed' : 'pointer',
            }}
          >
            {downloadingQr ? 'Preparing…' : 'Download QR Card'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   BRANDED QR HELPER
───────────────────────────────────────────────────────── */
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
