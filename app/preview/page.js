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
import { WhatsAppIcon, LinkIcon } from '@/components/AppIcons';

/* ─────────────────────────────────────────────────────────
   TEMPLATE ACCENT MAP
───────────────────────────────────────────────────────── */
const ACCENT_MAP = {
  proposal: { color: '#f43f5e', glow: 'rgba(244,63,94,0.25)', gradient: 'linear-gradient(135deg,#f43f5e,#be123c)', emoji: '💕' },
  birthday: { color: '#f59e0b', glow: 'rgba(245,158,11,0.25)', gradient: 'linear-gradient(135deg,#f59e0b,#b45309)', emoji: '🎂' },
  anniversary: { color: '#fbbf24', glow: 'rgba(251,191,36,0.25)', gradient: 'linear-gradient(135deg,#fbbf24,#92400e)', emoji: '🥂' },
  'emotional-apology': { color: '#94a3b8', glow: 'rgba(148,163,184,0.25)', gradient: 'linear-gradient(135deg,#94a3b8,#475569)', emoji: '🥺' },
};

/* ─────────────────────────────────────────────────────────
   PAGE ENTRY
───────────────────────────────────────────────────────── */
export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #f43f5e', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Preparing your preview...</p>
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
  const [showPleaseModal, setShowPleaseModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
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

  const [couponOpen, setCouponOpen] = useState(false);

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
  const totalAmount = dynamicPricing[note?.template]?.price || selectedTemplate?.price || 199;

  // ── LOADING ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f8', flexDirection: 'column', gap: '1rem' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${accent.color}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Preparing your private preview...</p>
      </div>
    );
  }

  // ── NOT FOUND ──
  if (!note) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff5f8', flexDirection: 'column', gap: '1.5rem', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>💔</div>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', textAlign: 'center', margin: 0, fontWeight: 800 }}>Experience Not Found</h1>
        <p style={{ color: '#64748b', textAlign: 'center', margin: 0 }}>This experience may have expired or the link is incorrect.</p>
        <Link href="/create" style={{ background: '#f43f5e', color: '#fff', padding: '12px 28px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 15px rgba(244,63,94,0.3)' }}>
          Create a New Experience
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, #fff5f8 0%, #fff0f5 50%, #faf0f7 100%)`,
        color: '#0f172a',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Dancing+Script:wght@700&display=swap');`}</style>

      {/* ── STICKY TOP BAR ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '1px solid #fce7f3',
          padding: '0.75rem 1.25rem',
          boxShadow: '0 2px 10px rgba(244, 63, 94, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/create"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '50px',
              padding: '6px 12px',
              color: '#be185d',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Edit
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>{accent.emoji}</span>
            <span style={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>LovelyCrafts</span>
          </div>

          {paid ? (
            <Link
              href={`/success?id=${note.id}`}
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '50px',
                padding: '4px 12px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#059669',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Share Hub</span> ➔
            </Link>
          ) : (
            <div
              style={{
                background: `${accent.color}15`,
                border: `1px solid ${accent.color}40`,
                borderRadius: '50px',
                padding: '4px 10px',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: accent.color,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Preview
            </div>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 7.5rem' }}>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '1.25rem' }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: accent.color, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
            Private Preview
          </span>
          <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2rem, 8vw, 2.8rem)', color: '#0f172a', margin: '0 0 0.25rem', lineHeight: 1.15 }}>
            {note.recipient_name ? `For ${note.recipient_name}` : 'Your Experience'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            {paid
              ? 'Your private experience is unlocked! Share the moment below or visit your share hub.'
              : 'Review your crafted moment below, then unlock and send with one tap.'}
          </p>
        </motion.div>

        {/* ── EXPERIENCE PANEL ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            border: `1.5px solid #fecdd3`,
            boxShadow: `0 20px 60px rgba(244,63,94,0.12), 0 4px 16px rgba(0,0,0,0.04)`,
            marginBottom: '2rem',
            background: '#ffffff',
          }}
        >
          {/* Phone frame top header pill */}
          <div style={{
            background: '#fff1f5',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #fce7f3',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#be185d',
            fontWeight: 700,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span>Live Recipient View</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', opacity: 0.8 }}>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          <TemplateRenderer note={note} isPreview={true} />
        </motion.div>

        {/* ── UNLOCKED PANEL (inline if paid) ── */}
        {paid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
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

      {/* ── NON-INTRUSIVE STICKY BOTTOM CHECKOUT DOCK (Unpaid) ── */}
      <AnimatePresence>
        {!paid && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 60,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1.5px solid #fecdd3',
              boxShadow: '0 -10px 40px rgba(244, 63, 94, 0.14)',
              padding: '0.85rem 1.25rem env(safe-area-inset-bottom, 1rem)',
            }}
          >
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              
              {/* Top mini row with pricing & coupon toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: couponOpen ? '0.75rem' : '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    ₹{totalAmount}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    ₹499
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#059669',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '2px 7px',
                    borderRadius: '50px',
                  }}>
                    Save 60%
                  </span>
                </div>

                {/* Coupon Code Toggle Button */}
                <button
                  type="button"
                  onClick={() => setCouponOpen((prev) => !prev)}
                  style={{
                    background: couponOpen ? '#fff1f2' : 'transparent',
                    border: couponOpen ? '1px solid #fecdd3' : '1px solid transparent',
                    color: '#be185d',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>🎟️</span>
                  <span>{couponOpen ? 'Close Code' : 'Have a Coupon?'}</span>
                  <span style={{ fontSize: '0.65rem', transform: couponOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </button>
              </div>

              {/* PayButton (Rendered directly with its coupon row & secure pay button, without taking over whole screen) */}
              <PayButton
                apologyId={note.id}
                onPaid={handlePaymentSuccess}
                displayAmount={totalAmount}
                recipientName={note.recipient_name}
              />

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



/* ─────────────────────────────────────────────────────────
   UNLOCKED PANEL
───────────────────────────────────────────────────────── */
function UnlockedPanel({ note, accent, getShareUrl, getWhatsAppUrl, copyLink, copied, qrCodeUrl, downloadQrCode, downloadingQr, downloadKeepsake, downloadingKeepsake }) {
  const recipient = note.recipient_name || 'them';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <style>{`
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(8deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-6deg)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes shimmer-bar { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .share-btn-whatsapp { transition: all 0.2s; }
        .share-btn-whatsapp:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .share-action-btn { transition: all 0.2s; }
        .share-action-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* ── CELEBRATION HEADER ── */}
      <div style={{
        background: `linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 100%)`,
        border: `1.5px solid #86efac`,
        borderRadius: '24px',
        padding: '1.75rem',
        boxShadow: `0 8px 30px rgba(34,197,94,0.12)`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated emojis */}
        <div style={{ position:'relative', marginBottom:'0.75rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type:'spring', stiffness:300, damping:18, delay:0.1 }}
            style={{ display:'inline-flex', padding:'14px', background:'#dcfce7', borderRadius:'50%' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <motion.span style={{ position:'absolute', top:0, right:'calc(50% - 60px)', fontSize:'1.5rem', animation:'float1 3s ease-in-out infinite' }}>🎉</motion.span>
          <motion.span style={{ position:'absolute', top:0, left:'calc(50% - 60px)', fontSize:'1.4rem', animation:'float2 2.8s ease-in-out infinite 0.4s' }}>{accent.emoji}</motion.span>
        </div>

        <motion.h2
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          transition={{ delay:0.2 }}
          style={{ fontSize:'1.45rem', fontWeight:900, color:'#065f46', margin:'0 0 0.3rem', lineHeight:1.2 }}
        >
          {recipient === 'them' ? 'Link Unlocked! 🎉' : `${recipient}'s moment is ready! 🎉`}
        </motion.h2>
        <motion.p
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.3 }}
          style={{ color:'#047857', fontSize:'0.88rem', margin:0, fontWeight: 500 }}
        >
          Your experience is live. Share it whenever you&apos;re ready.
        </motion.p>
      </div>

      {/* ── LIVE REPLY WATCHER ── */}
      <div style={{
        background: note.recipient_reaction ? '#fff1f5' : '#ffffff',
        border: note.recipient_reaction ? '1.5px solid #fecdd3' : '1px solid #fce7f3',
        borderRadius: '18px',
        padding: '1rem 1.25rem',
        boxShadow: note.recipient_reaction ? '0 4px 20px rgba(244,63,94,0.1)' : '0 2px 10px rgba(0,0,0,0.03)',
      }}>
        {note.recipient_reaction ? (
          /* Has replied */
          <motion.div
            initial={{ opacity:0, scale:0.95 }}
            animate={{ opacity:1, scale:1 }}
            style={{ display:'flex', alignItems:'flex-start', gap:'0.85rem' }}
          >
            <span style={{ fontSize:'2.2rem', lineHeight:1, flexShrink:0 }}>{note.recipient_reaction.emoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#be185d', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'2px' }}>
                💌 {recipient} replied
              </div>
              <div style={{ fontSize:'0.88rem', fontWeight:700, color:'#0f172a', lineHeight:1.45 }}>
                {note.recipient_reaction.label}
              </div>
              {note.recipient_reaction.message && (
                <div style={{ fontSize:'0.83rem', color:'#475569', fontStyle:'italic', marginTop:'4px', lineHeight:1.45 }}>
                  &ldquo;{note.recipient_reaction.message}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Waiting */
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background: note.view_count > 0 ? '#16a34a' : '#94a3b8', boxShadow: note.view_count > 0 ? '0 0 8px #22c55e' : 'none', animation: note.view_count > 0 ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color: note.view_count > 0 ? '#15803d' : '#64748b' }}>
                {note.view_count > 0
                  ? `👀 Opened ${note.view_count} time${note.view_count > 1 ? 's' : ''} · Waiting for reply…`
                  : 'Not opened yet · Share below to get started'}
              </div>
              {note.view_count === 0 && (
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'2px' }}>
                  You&apos;ll see their reaction here the moment they reply
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── SHARE SECTION ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #fce7f3',
        borderRadius: '20px',
        padding: '1.25rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      }}>
        <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#be185d', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
          Share with {recipient}
        </div>

        {/* URL strip */}
        <div style={{
          background: '#fff1f5',
          border: '1px solid #fce7f3',
          borderRadius: '10px',
          padding: '9px 12px',
          fontSize: '0.78rem',
          color: '#be185d',
          wordBreak: 'break-all',
          fontWeight: 700,
          marginBottom: '0.85rem',
          fontFamily: 'monospace',
        }}>
          {getShareUrl()}
        </div>

        {/* Primary: WhatsApp */}
        <motion.a
          className="share-btn-whatsapp"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
            background:'linear-gradient(135deg,#25D366,#128C7E)',
            color:'#fff', padding:'14px', borderRadius:'14px', textDecoration:'none',
            fontWeight:800, fontSize:'1rem', marginBottom:'0.6rem',
            boxShadow:'0 6px 20px rgba(37,211,102,0.25)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Send on WhatsApp
        </motion.a>

        {/* Secondary row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
          <motion.button
            className="share-action-btn"
            whileTap={{ scale: 0.96 }}
            onClick={copyLink}
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
              background: copied ? '#ecfdf5' : '#f8fafc',
              border: copied ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              color: copied ? '#059669' : '#0f172a',
              padding:'12px 10px', borderRadius:'12px',
              fontWeight:700, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </motion.button>

          <motion.button
            className="share-action-btn"
            whileTap={{ scale: 0.96 }}
            onClick={downloadKeepsake}
            disabled={downloadingKeepsake}
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
              background:'#fffbeb',
              border:'1px solid #fde68a',
              color:'#b45309', padding:'12px 10px', borderRadius:'12px',
              fontWeight:700, fontSize:'0.85rem',
              cursor: downloadingKeepsake ? 'not-allowed' : 'pointer', transition:'all 0.2s',
            }}
          >
            {downloadingKeepsake ? '⏳' : '✨'} {downloadingKeepsake ? 'Making…' : 'Keepsake'}
          </motion.button>
        </div>
      </div>

      {/* ── QR CODE ── */}
      {qrCodeUrl && (
        <div style={{
          background:'#ffffff',
          border:'1px solid #fce7f3',
          borderRadius:'20px',
          padding:'1.25rem',
          textAlign:'center',
          boxShadow:'0 4px 16px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#be185d', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.85rem' }}>
            📲 Scan to share
          </div>
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{ width:'130px', height:'130px', borderRadius:'14px', border:`1.5px solid #fecdd3`, display:'block', margin:'0 auto 0.85rem' }}
          />
          <button
            onClick={downloadQrCode}
            disabled={downloadingQr}
            style={{
              background:'#fff1f2', border:'1px solid #fecdd3',
              color:'#be185d', padding:'10px 20px', borderRadius:'12px',
              fontWeight:700, fontSize:'0.82rem', cursor: downloadingQr ? 'not-allowed' : 'pointer',
              transition:'all 0.2s',
            }}
          >
            {downloadingQr ? 'Preparing…' : 'Download QR Card'}
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <p style={{ textAlign:'center', color:'#64748b', fontSize:'0.78rem', margin:'0.25rem 0' }}>
        Revisit anytime from your{' '}
        <Link href="/profile" style={{ color: accent.color, textDecoration:'underline', fontWeight: 700 }}>dashboard</Link>.
        {' '}We&apos;ll notify you when {recipient} replies.
      </p>
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
      canvas.width = 900; canvas.height = 1080;
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

