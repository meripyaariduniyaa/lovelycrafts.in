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

  // Auto-open purchase modal after 4s of preview (unpaid only)
  useEffect(() => {
    if (paid || !note) return;
    const timer = setTimeout(() => setShowPurchaseModal(true), 4000);
    return () => clearTimeout(timer);
  }, [paid, note]);

  // Exit-intent modal on tab switch (unpaid)
  useEffect(() => {
    if (paid) return;
    const handleVisibilityChange = () => {
      if (document.hidden) setShowPleaseModal(true);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [paid]);

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

  const accent = ACCENT_MAP[note?.template] || ACCENT_MAP.proposal;
  const selectedTemplate = templates.find((t) => t.id === note?.template);
  const totalAmount = selectedTemplate?.price || 199;

  // ── LOADING ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810', flexDirection: 'column', gap: '1rem' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${accent.color}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#475569', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>Preparing your private preview...</p>
      </div>
    );
  }

  // ── NOT FOUND ──
  if (!note) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810', flexDirection: 'column', gap: '1.5rem', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '3rem' }}>💔</div>
        <h1 style={{ color: '#fff', fontSize: '1.5rem', textAlign: 'center', margin: 0 }}>Experience Not Found</h1>
        <p style={{ color: '#475569', textAlign: 'center', margin: 0 }}>This experience may have expired or the link is incorrect.</p>
        <Link href="/create" style={{ background: '#f43f5e', color: '#fff', padding: '12px 28px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700 }}>
          Create a New Experience
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 0%, #15152a 0%, #080810 100%)`,
        color: '#f8fafc',
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
          background: 'rgba(8,8,16,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0.75rem 1.25rem',
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
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50px',
              padding: '6px 12px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Edit
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>{accent.emoji}</span>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>LovelyCrafts</span>
          </div>

          <div
            style={{
              background: `${accent.color}18`,
              border: `1px solid ${accent.color}44`,
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
        </div>
      </header>

      {/* ── BODY ── */}
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1.25rem 6rem' }}>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '1.25rem' }}
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: accent.color, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
            Private Preview
          </span>
          <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.8rem, 7vw, 2.6rem)', color: '#fff', margin: '0 0 0.25rem', lineHeight: 1.15 }}>
            {note.recipient_name ? `For ${note.recipient_name}` : 'Your Experience'}
          </h1>
          <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
            This is exactly what they&apos;ll see. Review it, then unlock the shareable link.
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
            border: `1.5px solid ${accent.color}35`,
            boxShadow: `0 28px 70px rgba(0,0,0,0.8), 0 0 50px ${accent.glow}`,
            marginBottom: '2rem',
            background: '#080810',
          }}
        >
          {/* Subtle phone frame top header pill */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            fontSize: '0.72rem',
            color: '#94a3b8',
            fontWeight: 600,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span>Live Recipient View</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          <TemplateRenderer note={note} isPreview={true} />
        </motion.div>

        {/* ── UNLOCKED PANEL (inline, only after payment) ── */}
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

      {/* ── STICKY UNLOCK CTA (unpaid only) ── */}
      <AnimatePresence>
        {!paid && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.6 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              padding: '0.85rem 1.25rem 1.5rem',
              background: 'linear-gradient(0deg, rgba(8,8,16,0.98) 60%, transparent 100%)',
            }}
          >
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              {/* Social proof micro-copy */}
              <div style={{ textAlign: 'center', marginBottom: '0.6rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>🔥 <strong>1,420+</strong> unlocked this week</span>
                <span style={{ color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', padding: '2px 8px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 }}>
                  🎁 Save 10% Extra Today
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPurchaseModal(true)}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${accent.color} 0%, #be123c 100%)`,
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: `0 8px 28px ${accent.glow}, 0 0 0 1px ${accent.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '-0.01em',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {note.recipient_name ? `Unlock ${note.recipient_name}'s Moment` : 'Unlock & Send'}
                <span style={{ fontSize: '0.88rem', opacity: 0.9, fontWeight: 700 }}>• ₹{totalAmount}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PURCHASE MODAL (bottom-sheet, opens on CTA click or auto after 4s) ── */}
      <AnimatePresence>
        {showPurchaseModal && !paid && (
          <PurchaseModal
            note={note}
            accent={accent}
            totalAmount={totalAmount}
            selectedTemplate={selectedTemplate}
            onClose={() => setShowPurchaseModal(false)}
            onPaid={() => { setPaid(true); setShowPurchaseModal(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── EXIT-INTENT MODAL (tab switch) ── */}
      <AnimatePresence>
        {showPleaseModal && !paid && (
          <PleaseModal
            note={note}
            accent={accent}
            totalAmount={totalAmount}
            onClose={() => setShowPleaseModal(false)}
            onPaid={() => { setPaid(true); setShowPleaseModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PURCHASE MODAL (Primary — bottom-sheet over preview)
───────────────────────────────────────────────────────── */
function PurchaseModal({ note, accent, totalAmount, selectedTemplate, onClose, onPaid }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #13131f 0%, #080812 100%)',
          borderRadius: '28px 28px 0 0',
          border: `1px solid ${accent.color}40`,
          borderBottom: 'none',
          boxShadow: `0 -24px 80px rgba(0,0,0,0.9), 0 0 60px ${accent.glow}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Drag handle + close row */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(180deg, #13131f 90%, transparent 100%)',
          padding: '0.85rem 1.25rem 0',
          zIndex: 1,
        }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)', margin: '0 auto 0.85rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: accent.color, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Ready to send?
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: '1px' }}>
                {note.recipient_name ? `Unlock ${note.recipient_name}'s experience` : 'Unlock & Share'}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#94a3b8', fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              ✕
            </motion.button>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent.color}30, transparent)`, marginBottom: '0.75rem' }} />
        </div>

        {/* LockedPanel content */}
        <div style={{ padding: '0 1.25rem 2rem' }}>
          <LockedPanel
            note={note}
            accent={accent}
            totalAmount={totalAmount}
            selectedTemplate={selectedTemplate}
            onPaid={onPaid}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   LOCKED PANEL
───────────────────────────────────────────────────────── */
function LockedPanel({ note, accent, totalAmount, selectedTemplate, onPaid }) {
  const recipient = note?.recipient_name || 'them';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="locked-panel-root"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '1.25rem 1.25rem 1rem',
      }}
    >
      <style jsx>{`
        @media (max-width: 640px) {
          .locked-panel-root {
            padding: 0.85rem 0.85rem 0.75rem !important;
            border-radius: 20px !important;
          }
          .comparison-grid {
            display: none !important;
          }
          .headline-sub {
            display: none !important;
          }
          .lock-header {
            margin-bottom: 0.65rem !important;
          }
          .value-card {
            padding: 0.75rem 0.85rem !important;
            margin-bottom: 0.75rem !important;
            border-radius: 14px !important;
          }
        }
      `}</style>

      {/* Lock Icon + Emotional Headline */}
      <div className="lock-header" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Don&apos;t Let This Moment Stay Hidden
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.25 }}>
          Give {recipient} a moment they&apos;ll cherish forever 💕
        </h2>
        <p className="headline-sub" style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
          You spent time crafting this experience—don&apos;t let it go unsent.
        </p>
      </div>

      {/* Value Card */}
      <div className="value-card" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '1rem 1.15rem', marginBottom: '1rem' }}>
        {/* Value Comparison Card (Desktop/Tablet) */}
        <div className="comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '0.85rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '0.65rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>💬</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f87171' }}>Plain Text Message</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>Forgotten in 10 mins</div>
          </div>
          <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '12px', padding: '0.65rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>✨</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4ade80' }}>LovelyCrafts Experience</div>
            <div style={{ fontSize: '0.68rem', color: '#a7f3d0', marginTop: '2px' }}>Kept forever 💕</div>
          </div>
        </div>

        {/* Compact Feature List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[
            `Private shareable link & HD QR card for ${recipient}`,
            'Interactive music, custom memories & photos',
            'Live read receipt & reaction notification',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(74,222,128,0.18)', color: '#4ade80', fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>✓</div>
              <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Price Anchoring */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Special Price</div>
            <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>Save 60% Today</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'line-through', marginRight: '6px' }}>₹499</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>₹{totalAmount}</span>
          </div>
        </div>
      </div>

      <PayButton apologyId={note.id} onPaid={onPaid} displayAmount={totalAmount} recipientName={note.recipient_name} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '0.75rem' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span style={{ color: '#475569', fontSize: '0.75rem' }}>100% Secure payment via Razorpay</span>
      </div>
    </motion.div>
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
        .share-btn-whatsapp:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .share-action-btn { transition: all 0.2s; }
        .share-action-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* ── CELEBRATION HEADER ── */}
      <div style={{
        background: `linear-gradient(160deg, #0e1a14 0%, #080812 100%)`,
        border: `1px solid ${accent.color}40`,
        borderRadius: '24px',
        padding: '1.75rem',
        boxShadow: `0 0 60px ${accent.glow}`,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', top:'-20px', right:'-20px', width:120, height:120, borderRadius:'50%', background:`radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-30px', left:'-10px', width:100, height:100, borderRadius:'50%', background:`radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)`, pointerEvents:'none' }} />

        {/* Animated emojis */}
        <div style={{ position:'relative', marginBottom:'0.75rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type:'spring', stiffness:300, damping:18, delay:0.1 }}
            style={{ display:'inline-flex', padding:'14px', background:'rgba(74,222,128,0.12)', borderRadius:'50%' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          style={{ fontSize:'1.45rem', fontWeight:800, color:'#fff', margin:'0 0 0.3rem', lineHeight:1.2 }}
        >
          {recipient === 'them' ? 'Link Unlocked! 🎉' : `${recipient}'s moment is ready! 🎉`}
        </motion.h2>
        <motion.p
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.3 }}
          style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}
        >
          Your experience is live. Share it whenever you're ready.
        </motion.p>
      </div>

      {/* ── LIVE REPLY WATCHER ── */}
      <div style={{
        background: note.recipient_reaction
          ? 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(190,24,93,0.05) 100%)'
          : 'rgba(255,255,255,0.02)',
        border: note.recipient_reaction
          ? `1px solid rgba(244,63,94,0.35)`
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '18px',
        padding: '1rem 1.25rem',
        boxShadow: note.recipient_reaction ? `0 0 30px rgba(244,63,94,0.12)` : 'none',
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
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#f43f5e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'2px' }}
              >
                💌 {recipient} replied
              </div>
              <div style={{ fontSize:'0.88rem', fontWeight:600, color:'#e2e8f0', lineHeight:1.45 }}>
                {note.recipient_reaction.label}
              </div>
              {note.recipient_reaction.message && (
                <div style={{ fontSize:'0.83rem', color:'#94a3b8', fontStyle:'italic', marginTop:'4px', lineHeight:1.45 }}>
                  &ldquo;{note.recipient_reaction.message}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Waiting */
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background: note.view_count > 0 ? '#4ade80' : '#475569', boxShadow: note.view_count > 0 ? '0 0 8px #4ade80' : 'none', animation: note.view_count > 0 ? 'pulse-dot 2s ease-in-out infinite' : 'none' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color: note.view_count > 0 ? '#4ade80' : '#475569' }}>
                {note.view_count > 0
                  ? `👀 Opened ${note.view_count} time${note.view_count > 1 ? 's' : ''} · Waiting for reply…`
                  : 'Not opened yet · Share below to get started'}
              </div>
              {note.view_count === 0 && (
                <div style={{ fontSize:'0.75rem', color:'#334155', marginTop:'2px' }}>
                  You'll see their reaction here the moment they reply
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── SHARE SECTION ── */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent.color}33`,
        borderRadius: '20px',
        padding: '1.25rem',
      }}>
        <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#64748b', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
          Share with {recipient}
        </div>

        {/* URL strip */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${accent.color}22`,
          borderRadius: '10px',
          padding: '9px 12px',
          fontSize: '0.78rem',
          color: '#475569',
          wordBreak: 'break-all',
          fontWeight: 600,
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
            boxShadow:'0 6px 20px rgba(37,211,102,0.3)',
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
              background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
              border: copied ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: copied ? '#4ade80' : '#e2e8f0',
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
              background:'rgba(245,158,11,0.07)',
              border:'1px solid rgba(245,158,11,0.25)',
              color:'#fbbf24', padding:'12px 10px', borderRadius:'12px',
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
          background:'rgba(255,255,255,0.02)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'20px',
          padding:'1.25rem',
          textAlign:'center',
        }}>
          <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#64748b', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'0.85rem' }}>
            📲 Scan to share
          </div>
          <img
            src={qrCodeUrl}
            alt="QR Code"
            style={{ width:'130px', height:'130px', borderRadius:'14px', border:`1.5px solid ${accent.color}44`, display:'block', margin:'0 auto 0.85rem' }}
          />
          <button
            onClick={downloadQrCode}
            disabled={downloadingQr}
            style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
              color:'#94a3b8', padding:'10px 20px', borderRadius:'12px',
              fontWeight:600, fontSize:'0.82rem', cursor: downloadingQr ? 'not-allowed' : 'pointer',
              transition:'all 0.2s',
            }}
          >
            {downloadingQr ? 'Preparing…' : 'Download QR Card'}
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <p style={{ textAlign:'center', color:'#334155', fontSize:'0.78rem', margin:'0.25rem 0' }}>
        Revisit anytime from your{' '}
        <Link href="/profile" style={{ color: accent.color, textDecoration:'underline' }}>dashboard</Link>.
        {' '}We'll notify you when {recipient} replies.
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   PLEASE MODAL (Exit Intent — unpaid)
───────────────────────────────────────────────────────── */
function PleaseModal({ note, accent, totalAmount, onClose, onPaid }) {
  const recipient = note?.recipient_name || 'them';

  const handleClose = () => {
    if (note?.id) {
      fetch('/api/coupons/organic-retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, action: 'disable' })
      }).catch(() => {});
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 0',
      }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(180deg, #16162a 0%, #080812 100%)',
          borderRadius: '28px 28px 0 0',
          border: '1px solid rgba(244,63,94,0.3)',
          borderBottom: 'none',
          padding: '2rem 1.75rem 3rem',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(244,63,94,0.15)',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)', margin: '0 auto 1.5rem' }} />

        {/* Emotional header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <motion.div
            animate={{ rotate: [0, -12, 10, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.8, delay: 0.2, repeat: Infinity, repeatDelay: 2 }}
            style={{ fontSize: '3.5rem', marginBottom: '0.5rem', display: 'inline-block' }}
          >
            🥺
          </motion.div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem', lineHeight: 1.25 }}>
            Wait... don&apos;t leave {recipient} waiting 💔
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
            You put so much heart into creating this for{' '}
            <strong style={{ color: '#fff' }}>{recipient}</strong>.
            If you leave now, this special moment remains locked and unsent. They deserve to feel this love. 💕
          </p>
        </div>

        {/* Price reminder */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Unlock full experience for</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              ₹{totalAmount} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b', textDecoration: 'line-through' }}>₹499</span>
            </div>
          </div>
          <div style={{ fontSize: '2rem' }}>{accent.emoji}</div>
        </div>

        {/* CTA */}
        <PayButton apologyId={note.id} onPaid={onPaid} displayAmount={totalAmount} recipientName={note.recipient_name} />

        {/* Dismiss */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            marginTop: '0.75rem',
            padding: '12px',
            borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.88rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Dismiss for now
        </button>
      </motion.div>
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

      ctx.fillStyle = '#07070f';
      ctx.fillRect(0, 0, 900, 1080);

      const glow = ctx.createRadialGradient(450, 500, 80, 450, 500, 520);
      glow.addColorStop(0, 'rgba(244,63,94,0.2)');
      glow.addColorStop(1, 'rgba(7,7,15,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 900, 1080);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fda4af';
      ctx.font = '700 32px Arial, sans-serif';
      ctx.fillText('LOVELYCRAFTS', 450, 90);

      roundedRect(ctx, 155, 130, 590, 590, 32);
      ctx.fillStyle = '#0f0f1e';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f43f5e';
      ctx.stroke();
      ctx.drawImage(qr, 185, 160, 530, 530);

      ctx.fillStyle = '#f43f5e';
      ctx.font = '700 30px Arial, sans-serif';
      ctx.fillText('Scan to open', 450, 820);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 24px Arial, sans-serif';
      ctx.fillText('a private moment made just for them', 450, 860);
      ctx.fillStyle = '#64748b';
      ctx.font = '400 20px Arial, sans-serif';
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
