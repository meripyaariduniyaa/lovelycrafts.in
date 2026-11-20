'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithGoogle } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { CREATOR_TIERS } from '@/lib/creator-club';
import { triggerHaptic } from '@/lib/haptics';

const SHOWCASE_EXPERIENCES = [
  {
    id: 'birthday',
    title: 'Virtual Birthday Bash',
    icon: '🎂',
    badge: 'Best Seller 🎉',
    desc: '7-scene party link with microphone candle blowout, interactive balloon pops, wish wheel & memory gallery.',
    previewUrl: '/templates/birthday',
    tag: 'Celebration',
  },
  {
    id: 'proposal',
    title: 'The Perfect Proposal',
    icon: '💍',
    badge: 'Viral Favorite 💕',
    desc: 'Interactive confession with a playful dodging "NO" button that runs away from the cursor until they click YES!',
    previewUrl: '/templates/proposal',
    tag: 'Romantic',
  },
  {
    id: 'anniversary',
    title: 'Romantic Anniversary',
    icon: '🥂',
    badge: 'Milestone ✨',
    desc: 'Timeline journey of relationship memories, toast animations, date counter and custom love letter.',
    previewUrl: '/templates/anniversary',
    tag: 'Anniversary',
  },
  {
    id: 'emotional-apology',
    title: "I'm Sorry",
    icon: '🥺',
    badge: 'Heartfelt 💌',
    desc: 'A sincere apology that gives them room to feel. Gentle, heartfelt, and beautifully designed.',
    previewUrl: '/templates/emotional-apology',
    tag: 'Heartfelt',
  },
];

const CREATOR_CATEGORIES = [
  { title: 'Couple & Romance Creators', emoji: '💑', desc: 'Share anniversary, proposal & cute relationship surprises' },
  { title: 'Lifestyle & Aesthetic Creators', emoji: '✨', desc: 'Gift meaningful personalized web experiences to friends' },
  { title: 'Comedy & Relatable Skits', emoji: '😂', desc: 'Feature the dodging NO button and funny birthday experiences' },
  { title: 'College & Campus Creators', emoji: '🎓', desc: 'Affordable, instant surprises for besties and partners' },
  { title: 'Vloggers & Storytellers', emoji: '📹', desc: 'Share genuine reactions and emotional keepsake links' },
  { title: 'Art & Aesthetic Curators', emoji: '🎨', desc: 'Showcase vintage typography, wax seals & music experiences' },
];

const FAQS = [
  {
    q: 'Is joining the Creator Club free?',
    a: 'Yes, 100% free. There are no upfront fees, hidden charges, or minimum follower counts required to apply.',
  },
  {
    q: 'How much commission can I earn?',
    a: 'You earn 10% to 18% commission on every qualifying paid referral. Your tier is calculated based on monthly orders: Starter (0–100 @ 10%), Rising (101–300 @ 15%), Creator (301–700 @ 16%), Partner (701–1,500 @ 17%), and Elite (1,501+ @ 18%). Commission tiers evaluate fresh each calendar month.',
  },
  {
    q: 'What discount does my audience receive?',
    a: 'Your audience receives an exclusive 10% OFF across all LovelyCrafts interactive gift experiences when applying your personal creator coupon code.',
  },
  {
    q: 'How do referrals and attribution work?',
    a: 'You receive a personalized short link (lovelycrafts.in/c/yourname) and a branded coupon code. When viewers click your link or apply your code at checkout, the referral is automatically credited to your account.',
  },
  {
    q: 'How long are referrals tracked?',
    a: 'Referral clicks are tracked for 30 full days via secure cookies. If a viewer creates and purchases any gift experience within 30 days of clicking your link, you earn commission.',
  },
  {
    q: 'When do I get paid?',
    a: 'Payouts are processed directly to your UPI ID or bank account within 3–5 business days once your pending creator balance reaches the ₹500 threshold.',
  },
  {
    q: 'Can I try LovelyCrafts before promoting it?',
    a: 'Yes! All approved Creator Club members receive complimentary VIP Creator Experience Passes so you can craft and send your own surprise first.',
  },
  {
    q: 'Can I promote LovelyCrafts on Instagram and YouTube?',
    a: 'Absolutely! You can feature LovelyCrafts in Instagram Reels, Stories, bio links, YouTube Shorts, video descriptions, TikTok, or WhatsApp status.',
  },
  {
    q: 'What happens if an order is refunded?',
    a: 'We provide a 48-hour refund window covering duplicate transactions or technical delivery failures. If an order is refunded under this policy, the corresponding commission is deducted. For completed experiences, commissions are safely credited and ready for payout.',
  },
];

export default function CreatorsLandingPage() {
  const { user } = useAuth();
  const [creators, setCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  // Application form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    bio: '',
    instagram_url: '',
    youtube_url: '',
    profile_image: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appStatus, setAppStatus] = useState(null); // null | 'pending' | 'active' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [invitedBy, setInvitedBy] = useState('');

  // FAQ open/close state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Earnings calculator slider state
  const [calculatorOrders, setCalculatorOrders] = useState(150);

  const getTierInfo = (orders) => {
    if (orders >= 1501) return { name: 'Elite', emoji: '👑', rate: 18, color: '#e11d48', bg: '#ffe4e6', minOrders: 1501, range: '1,501+ orders/mo' };
    if (orders >= 701) return { name: 'Partner', emoji: '💜', rate: 17, color: '#7c3aed', bg: '#f5f3ff', minOrders: 701, range: '701–1,500 orders/mo' };
    if (orders >= 301) return { name: 'Creator', emoji: '💙', rate: 16, color: '#0284c7', bg: '#f0f9ff', minOrders: 301, range: '301–700 orders/mo' };
    if (orders >= 101) return { name: 'Rising', emoji: '💚', rate: 15, color: '#16a34a', bg: '#f0fdf4', minOrders: 101, range: '101–300 orders/mo' };
    return { name: 'Starter', emoji: '🌱', rate: 10, color: '#d97706', bg: '#fffbeb', minOrders: 0, range: '0–100 orders/mo' };
  };

  // Read invite query param & localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref') || urlParams.get('invitedBy') || urlParams.get('referrer');
      if (refParam) {
        setInvitedBy(refParam.toLowerCase().trim());
        localStorage.setItem('lc_invited_by_creator', refParam.toLowerCase().trim());
      } else {
        const stored = localStorage.getItem('lc_invited_by_creator');
        if (stored) setInvitedBy(stored);
      }
    }
  }, []);

  // Load public creators
  useEffect(() => {
    fetch('/api/creators/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.creators) setCreators(data.creators);
      })
      .catch((err) => console.error('Failed to load creators:', err))
      .finally(() => setLoadingCreators(false));
  }, []);

  // Pre-fill form from user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        slug: prev.slug || (user.displayName || '').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30),
        profile_image: prev.profile_image || user.photoURL || '',
      }));

      // Check current application status
      user.getIdToken().then((token) => {
        fetch('/api/creator/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.creator) {
              setAppStatus(data.creator.status);
            }
          })
          .catch(() => { });
      });
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    triggerHaptic('medium');
    setAuthLoading(true);
    setErrorMessage('');
    const { error: authErr } = await signInWithGoogle();
    if (authErr) {
      setErrorMessage(authErr);
      triggerHaptic('error');
    } else {
      triggerHaptic('success');
    }
    setAuthLoading(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Profile image must be under 10MB.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage('');
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vkcgnlm1';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'apology_images';

      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);
      data.append('folder', 'creator-uploads');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const uploadResult = await res.json();
      if (uploadResult.secure_url) {
        setFormData((prev) => ({ ...prev, profile_image: uploadResult.secure_url }));
      } else {
        setErrorMessage(uploadResult?.error?.message || 'Failed to upload photo.');
      }
    } catch (err) {
      setErrorMessage('Upload failed. Please check your internet connection.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          referred_by_creator_slug: invitedBy || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setAppStatus('pending');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="lc-page-shell" style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #ffe4e6 0%, #fff1f2 35%, #fafafa 100%)', padding: '40px 16px 100px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* =========================================================================
            PRIORITY 2: HERO SECTION
        ========================================================================= */}
        <section
          className="hero-section hero-enhanced text-center mb-12"
          style={{
            borderRadius: 'clamp(20px, 4vw, 28px)',
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.25rem)',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <span className="hero-floating-decor d1" aria-hidden="true">👑</span>
          <span className="hero-floating-decor d2" aria-hidden="true">💸</span>
          <span className="hero-floating-decor d3" aria-hidden="true">✨</span>
          <span className="hero-floating-decor d4" aria-hidden="true">💌</span>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: '0.32rem 0.95rem',
              borderRadius: '99px',
              fontSize: 'clamp(0.72rem, 1.6vw, 0.78rem)',
              color: '#be185d',
              fontWeight: 800,
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(244,63,94,0.08)',
            }}
          >
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>👑 LOVELYCRAFTS CREATOR CLUB &bull; EARN UP TO 18%</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)', fontWeight: 900, color: '#111827', lineHeight: 1.15, margin: '0 auto 18px', maxWidth: '880px', letterSpacing: '-0.03em' }}>
            Share Something They&apos;ll Love.{' '}
            <br />
            <span className="cursive" style={{ color: 'var(--accent-primary)', fontSize: '1.05em' }}>
              Earn When They Do. ❤️
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#4b5563', maxWidth: '720px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Join the LovelyCrafts Creator Club. Give your audience <strong>10% OFF</strong> personalized digital surprises and earn <strong>10% to 18% recurring commission</strong> on successful referrals.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <a
              href="#apply"
              className="btn-primary"
              style={{
                padding: '14px 32px',
                borderRadius: '999px',
                fontWeight: 800,
                fontSize: '1.02rem',
                boxShadow: '0 8px 24px rgba(225,29,72,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🚀 Join Creator Club
            </a>
            <Link
              href="/creator/login"
              className="btn-secondary"
              style={{
                padding: '14px 28px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🔑 Already a Creator? Login
            </Link>
          </div>

          <div className="hero-social-proof" style={{ marginTop: '0.5rem', paddingTop: '1rem' }}>
            <span className="hero-social-proof-item">
              <span>⚡</span>
              <span>Direct weekly UPI payouts</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🎟️</span>
              <span>Custom creator coupon &amp; page</span>
            </span>
            <span>•</span>
            <span className="hero-social-proof-item">
              <span>🎁</span>
              <span>Complimentary VIP experience passes</span>
            </span>
          </div>

          {/* Value Pillars Quick Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', maxWidth: '880px', margin: '1.75rem auto 0' }}>
            <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '16px', border: '1px solid #fecdd3', fontSize: '0.92rem', fontWeight: 700, color: '#43332b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(225,29,72,0.04)' }}>
              <span>🎁</span> Free experiences
            </div>
            <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '16px', border: '1px solid #fecdd3', fontSize: '0.92rem', fontWeight: 700, color: '#43332b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(225,29,72,0.04)' }}>
              <span>🎟️</span> Your own discount code
            </div>
            <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '16px', border: '1px solid #fecdd3', fontSize: '0.92rem', fontWeight: 700, color: '#43332b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(225,29,72,0.04)' }}>
              <span>💰</span> 10–18% commission
            </div>
            <div style={{ background: '#fff', padding: '14px 16px', borderRadius: '16px', border: '1px solid #fecdd3', fontSize: '0.92rem', fontWeight: 700, color: '#43332b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(225,29,72,0.04)' }}>
              <span>🌐</span> Your own creator page
            </div>
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 3: SHOW THE PRODUCT MUCH EARLIER
        ========================================================================= */}
        <section style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The Content You Share
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', fontWeight: 800, color: '#111827', margin: '6px 0 10px' }}>
              What are you actually sharing?
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.5 }}>
              Instant interactive surprises your audience can personalize in 2 minutes and send privately on WhatsApp. Perfect for making authentic videos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
            {SHOWCASE_EXPERIENCES.map((exp) => (
              <div
                key={exp.id}
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontSize: '2.4rem' }}>{exp.icon}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#43332b', background: '#ffe4e6', padding: '3px 10px', borderRadius: '999px' }}>
                      {exp.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                    {exp.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {exp.desc}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>{exp.tag}</span>
                    <Link
                      href={exp.previewUrl}
                      target="_blank"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#e11d48',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                      }}
                    >
                      Preview Experience ↗
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 4: CREATOR EXPERIENCE PASS (Try it before you share it)
        ========================================================================= */}
        <section
          style={{
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
            borderRadius: '28px',
            padding: '40px 32px',
            border: '1px solid #fbcfe8',
            marginBottom: '70px',
            boxShadow: '0 12px 36px rgba(225,29,72,0.08)',
          }}
        >
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎁 Complimentary VIP Access
            </span>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 2.5rem)', fontWeight: 800, color: '#111827', margin: '8px 0 14px' }}>
              Try it before you share it.
            </h2>
            <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 28px' }}>
              We don&apos;t expect you to recommend something you&apos;ve never experienced. Every Creator Club member gets complimentary access to selected LovelyCrafts experiences so you can create your own surprise and see what makes it special.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
              <a
                href={appStatus === 'active' ? '/creator/dashboard' : '#apply'}
                style={{
                  background: '#e11d48',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(225,29,72,0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🎁 Claim Your Free Experience Pass
              </a>
            </div>

            {/* 4-Step Flow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', textAlign: 'left' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid rgba(225,29,72,0.1)' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🎨</div>
                <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '4px' }}>1. Create yours</strong>
                <small style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>Pick a template and add your photos &amp; secrets.</small>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid rgba(225,29,72,0.1)' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>📲</div>
                <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '4px' }}>2. Send it</strong>
                <small style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>Send the private link to your partner or best friend.</small>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid rgba(225,29,72,0.1)' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🥹</div>
                <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '4px' }}>3. See reaction</strong>
                <small style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>Witness the genuine emotion and smile on their face.</small>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid rgba(225,29,72,0.1)' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🚀</div>
                <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block', marginBottom: '4px' }}>4. Share authentic</strong>
                <small style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>Share your genuine review and earn on every order.</small>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            PRIORITIES 5 & 6: COMPACT MOBILE TIER TABLE & EARNINGS CALCULATOR SLIDER
        ========================================================================= */}
        <section style={{ marginBottom: '70px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

          {/* Compact Mobile Tier Table */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: 'clamp(20px, 3.5vw, 32px)', border: '1px solid #f3f4f6', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Simple &amp; Transparent
              </span>
              <span style={{ fontSize: '0.72rem', background: '#ffe4e6', color: '#be123c', padding: '3px 8px', borderRadius: '999px', fontWeight: 800 }}>
                Automatic Tiers
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.6rem)', fontWeight: 800, color: '#111827', margin: '4px 0 8px' }}>
              Earn more as you grow
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '18px', lineHeight: 1.5 }}>
              Your commission rate scales automatically every month based on verified paid referrals.
            </p>

            {/* Compact Mobile Tier Cards / Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Starter', emoji: '🌱', range: '0–100 orders/mo', rate: '10%', color: '#d97706', bg: '#fffbeb', border: '#fde68a', min: 0, max: 100 },
                { name: 'Rising', emoji: '💚', range: '101–300 orders/mo', rate: '15%', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', min: 101, max: 300 },
                { name: 'Creator', emoji: '💙', range: '301–700 orders/mo', rate: '16%', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', min: 301, max: 700 },
                { name: 'Partner', emoji: '💜', range: '701–1,500 orders/mo', rate: '17%', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', min: 701, max: 1500 },
                { name: 'Elite', emoji: '👑', range: '1,501+ orders/mo', rate: '18%', color: '#e11d48', bg: '#ffe4e6', border: '#fecdd3', min: 1501, max: Infinity },
              ].map((tier) => {
                const isActive = calculatorOrders >= tier.min && (calculatorOrders <= tier.max || tier.max === Infinity);
                return (
                  <div
                    key={tier.name}
                    onClick={() => {
                      setCalculatorOrders(tier.min === 0 ? 50 : tier.min);
                      triggerHaptic('selection');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      background: isActive ? tier.bg : '#fafafa',
                      border: isActive ? `2px solid ${tier.color}` : '1px solid #f1f5f9',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{tier.emoji}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.92rem', color: '#111827' }}>{tier.name}</strong>
                          {isActive && (
                            <span style={{ fontSize: '0.65rem', background: tier.color, color: '#fff', padding: '1px 6px', borderRadius: '999px', fontWeight: 800 }}>
                              SELECTED
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{tier.range}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 900, color: tier.color, display: 'block', lineHeight: 1 }}>
                        {tier.rate}
                      </span>
                      <small style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600 }}>commission</small>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fdf2f8', borderRadius: '12px', border: '1px solid #fce7f3', fontSize: '0.8rem', color: '#a64036', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💡</span>
              <span><strong>Fast Weekly Payouts:</strong> Tiers evaluate monthly. Withdrawable to UPI or bank once balance hits ₹500.</span>
            </div>
          </div>

          {/* Earnings Calculator Slider with Large Touch Thumb */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: 'clamp(20px, 3.5vw, 32px)', border: '1px solid #fecdd3', boxShadow: '0 8px 24px rgba(225,29,72,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Interactive Simulator
                </span>
                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '999px', fontWeight: 800 }}>
                  Live Calculator
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.6rem)', fontWeight: 800, color: '#111827', margin: '4px 0 6px' }}>
                Earnings Calculator
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '18px', lineHeight: 1.4 }}>
                Slide to estimate your monthly payouts based on orders placed with your 10% coupon code.
              </p>

              {/* Slider Controls with Large Touch Thumb */}
              <div style={{ background: '#fff1f2', borderRadius: '18px', padding: '16px 18px', border: '1px solid #fecdd3', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4b5563' }}>Estimated Monthly Orders:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1.5px solid #e11d48', padding: '4px 12px', borderRadius: '999px', boxShadow: '0 2px 6px rgba(225,29,72,0.1)' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#e11d48' }}>
                      {calculatorOrders}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be123c' }}>orders</span>
                  </div>
                </div>

                {/* Range Slider with large touch target and thumb */}
                <div style={{ padding: '8px 0', position: 'relative' }}>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={calculatorOrders}
                    onChange={(e) => {
                      setCalculatorOrders(Number(e.target.value));
                      triggerHaptic('selection');
                    }}
                    aria-label="Estimated monthly orders slider"
                    className="creator-touch-slider"
                    style={{
                      width: '100%',
                      height: '10px',
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, #f43f5e, #be185d)',
                      outline: 'none',
                      cursor: 'pointer',
                      WebkitAppearance: 'none',
                      touchAction: 'manipulation',
                      minHeight: '44px',
                      margin: 0,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px', fontWeight: 600 }}>
                    <span>10</span>
                    <span>500</span>
                    <span>1,000</span>
                    <span>2,000+</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #fda4af' }}>
                  {[30, 100, 250, 500, 1000, 1500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setCalculatorOrders(num);
                        triggerHaptic('selection');
                      }}
                      style={{
                        background: calculatorOrders === num ? '#e11d48' : '#fff',
                        color: calculatorOrders === num ? '#fff' : '#4b5563',
                        border: calculatorOrders === num ? '1px solid #e11d48' : '1px solid #cbd5e1',
                        borderRadius: '999px',
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        touchAction: 'manipulation',
                        minHeight: '32px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Earnings Card */}
              {(() => {
                const activeTier = getTierInfo(calculatorOrders);
                const avgPrice = 179.10; // 199 with 10% coupon
                const monthlyPayout = Math.round(calculatorOrders * avgPrice * (activeTier.rate / 100));
                const yearlyPayout = monthlyPayout * 12;
                const fanSavings = Math.round(calculatorOrders * 19.90);
                return (
                  <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>Achieved Tier:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activeTier.color, background: activeTier.bg, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${activeTier.color}40` }}>
                        {activeTier.emoji} {activeTier.name} ({activeTier.rate}% Commission)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Monthly Payout</span>
                        <strong style={{ fontSize: '1.35rem', color: '#059669', fontWeight: 900, display: 'block', marginTop: '2px' }}>
                          ₹{monthlyPayout.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Annual Potential</span>
                        <strong style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 900, display: 'block', marginTop: '2px' }}>
                          ₹{yearlyPayout.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', padding: '4px 2px' }}>
                      <span>Viewer Savings Generated:</span>
                      <strong style={{ color: '#e11d48' }}>₹{fanSavings.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
              * Based on average ₹199 experience with your 10% coupon applied (₹179.10 net paid). Commission paid directly to your UPI/Bank.
            </p>
          </div>

        </section>


        {/* =========================================================================
            PRIORITY 7: VISUAL REFERRAL TRACKING
        ========================================================================= */}
        <section style={{ marginBottom: '70px', background: '#fff', borderRadius: '24px', padding: '36px', border: '1px solid #f3f4f6', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              How Tracking Works
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '4px 0 8px' }}>
              Your personal LovelyCrafts link
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Seamless 30-day attribution that ensures you get credited for every viewer purchase.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', maxWidth: '850px', margin: '0 auto 24px' }}>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '150px' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '2px' }}>🔗</span>
              <code style={{ fontSize: '0.85rem', color: '#be123c', fontWeight: 700 }}>lovelycrafts.in/c/you</code>
            </div>
            <span style={{ color: '#e11d48', fontWeight: 800, fontSize: '1.2rem' }}>➔</span>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '130px' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '2px' }}>👆</span>
              <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>Viewer Clicks</span>
            </div>
            <span style={{ color: '#9ca3af', fontWeight: 800, fontSize: '1.2rem' }}>➔</span>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '130px' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '2px' }}>✨</span>
              <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>Creates Surprise</span>
            </div>
            <span style={{ color: '#9ca3af', fontWeight: 800, fontSize: '1.2rem' }}>➔</span>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '130px' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '2px' }}>💳</span>
              <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600 }}>Purchases</span>
            </div>
            <span style={{ color: '#059669', fontWeight: 800, fontSize: '1.2rem' }}>➔</span>

            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '140px' }}>
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '2px' }}>❤️</span>
              <strong style={{ fontSize: '0.85rem', color: '#065f46' }}>You Earn ₹₹₹</strong>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#fdf2f8', padding: '10px 20px', borderRadius: '999px', maxWidth: '420px', margin: '0 auto', fontSize: '0.85rem', color: '#a64036', fontWeight: 700 }}>
            ⏳ Referrals are attributed for 30 full days from click.
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 8: GET YOUR OWN LOVELYCRAFTS PAGE
        ========================================================================= */}
        <section style={{ marginBottom: '70px', background: '#fff', borderRadius: '24px', padding: '36px', border: '1px solid #f3f4f6', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Custom Link In Bio
              </span>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#111827', margin: '6px 0 14px' }}>
                🌟 Get your own LovelyCrafts page
              </h2>
              <p style={{ color: '#4b5563', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Every selected Creator Club member gets a personal LovelyCrafts page where your audience can discover your favorite experiences and exclusive discount.
              </p>
              <div style={{ background: '#f9fafb', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'inline-block', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Example Creator URL:</span>
                <code style={{ fontSize: '0.95rem', color: '#e11d48', fontWeight: 700 }}>lovelycrafts.in/creators/ananya</code>
              </div>
              <div>
                <a href="#apply" style={{ background: '#f8f3eb', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                  Claim Your Handle 🚀
                </a>
              </div>
            </div>

            {/* Visual Mockup of Creator Page */}
            <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', borderRadius: '20px', padding: '24px', border: '1px solid #fecdd3', boxShadow: '0 8px 24px rgba(225,29,72,0.08)' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid #ffe4e6' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ffe4e6', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '2px solid #fda4af' }}>
                  👩‍🦰
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#43332b', background: '#ecfdf5', padding: '2px 8px', borderRadius: '999px', display: 'inline-block', marginBottom: '6px' }}>
                  ✓ Verified Creator
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Ananya Sharma</h4>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 14px' }}>&quot;My favorite interactive surprises to send on WhatsApp ✨&quot;</p>

                <div style={{ background: '#fff1f2', border: '1px dashed #fb7185', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'left' }}>
                    <small style={{ fontSize: '0.7rem', color: '#be123c', fontWeight: 700 }}>EXCLUSIVE CODE</small>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#881337', fontFamily: 'monospace' }}>ANANYA10</div>
                  </div>
                  <span style={{ background: '#e11d48', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>
                    10% OFF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 14: SOCIAL PROOF / CATEGORY FIT
        ========================================================================= */}
        <section style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Creator Community
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '4px 0 8px' }}>
              Built for creators who love...
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              No matter your niche, LovelyCrafts gives you an emotional, creative way to delight your audience.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {CREATOR_CATEGORIES.map((cat, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f3f4f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{cat.emoji}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{cat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 9: FEATURED CREATORS
        ========================================================================= */}
        {creators.length > 0 && (
          <section style={{ marginBottom: '70px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Spotlight
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '4px 0 8px' }}>
                ⭐ Meet the LovelyCrafts Creators
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {creators.map((c) => (
                <Link
                  key={c.id}
                  href={`/creators/${c.slug}`}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: '#ffe4e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      border: '2px solid #fda4af',
                    }}
                  >
                    {c.profile_image ? (
                      <img src={c.profile_image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '💖'
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{c.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 600, textTransform: 'capitalize' }}>
                    {c.tier} Creator
                  </span>
                  {c.bio && (
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '8px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.bio}
                    </p>
                  )}
                  <span style={{ marginTop: '12px', fontSize: '0.8rem', color: '#e11d48', fontWeight: 700 }}>
                    Visit Creator Page →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}


        {/* =========================================================================
            PRIORITY 10: FAQS
        ========================================================================= */}
        <section style={{ marginBottom: '70px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Clear Answers
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: '4px 0 8px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Everything you need to know about joining, promoting, and getting paid.
            </p>
          </div>

          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 22px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#111827',
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: '#e11d48', fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 22px 18px', color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.6, borderTop: '1px solid #f9fafb' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 11: CREATOR DISCLOSURE GUIDANCE
        ========================================================================= */}
        <section style={{ marginBottom: '70px', background: '#f8fafc', borderRadius: '20px', padding: '24px 30px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '1.6rem' }}>⚖️</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
                Creator Disclosure Guidance
              </h3>
              <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 10px' }}>
                When sharing LovelyCrafts in your videos, posts, or stories, please clearly disclose your affiliate relationship (as required by ASCI / FTC guidelines).
              </p>
              <div style={{ background: '#fff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', color: '#43332b', fontFamily: 'monospace' }}>
                &quot;I&apos;m partnered with LovelyCrafts, and you can use my code YOURCODE for 10% off at lovelycrafts.in/c/yourname&quot;
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            PRIORITY 2: APPLICATION SECTION
        ========================================================================= */}
        <section id="apply" style={{ background: '#fff', borderRadius: '24px', padding: '36px', border: '1px solid #fecdd3', boxShadow: '0 12px 32px rgba(225,29,72,0.06)' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: '8px' }}>
              Apply to the Creator Club
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '28px' }}>
              Free to join. Applications are reviewed within 24 hours.
            </p>

            {appStatus === 'pending' ? (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏳</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>Application Under Review</h3>
                <p style={{ color: '#b45309', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  Thank you for applying! Our admin team is reviewing your profile. You will receive access to your Creator Dashboard as soon as you are approved.
                </p>
                <Link href="/creator/dashboard" style={{ background: '#d97706', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, textDecoration: 'none' }}>
                  Check Dashboard Status
                </Link>
              </div>
            ) : appStatus === 'active' || appStatus === 'approved' ? (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46', marginBottom: '8px' }}>You are an Active Creator!</h3>
                <p style={{ color: '#047857', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  Your account is fully approved. Visit your dashboard to view your referral links, coupons, and earnings.
                </p>
                <Link href="/creator/dashboard" style={{ background: '#059669', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none' }}>
                  Go to Creator Dashboard 🚀
                </Link>
              </div>
            ) : (
              <div>
                {!user ? (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #fff1f2 0%, #fff 100%)',
                      borderRadius: '20px',
                      border: '1.5px solid #fecdd3',
                      padding: 'clamp(20px, 4vw, 32px)',
                      textAlign: 'center',
                      boxShadow: '0 8px 24px rgba(225,29,72,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👑</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
                      1-Tap Creator Club Sign-Up
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                      Connect with Google in one tap to instantly lock in your handle and start your creator application.
                    </p>

                    {/* Value highlights */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '20px', textAlign: 'left' }}>
                      <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #ffe4e6', fontSize: '0.8rem', color: '#4b5563' }}>
                        <span style={{ color: '#059669', fontWeight: 800 }}>⚡ Fast Payouts</span>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Weekly to UPI/Bank</div>
                      </div>
                      <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #ffe4e6', fontSize: '0.8rem', color: '#4b5563' }}>
                        <span style={{ color: '#e11d48', fontWeight: 800 }}>🎟️ 10% Code</span>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>For your fans &amp; bio</div>
                      </div>
                      <div style={{ background: '#fff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #ffe4e6', fontSize: '0.8rem', color: '#4b5563' }}>
                        <span style={{ color: '#7c3aed', fontWeight: 800 }}>🎁 VIP Pass</span>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Free experience pass</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authLoading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        width: '100%',
                        maxWidth: '380px',
                        minHeight: '52px',
                        background: '#ffffff',
                        color: '#1f2937',
                        border: '1.5px solid #d1d5db',
                        padding: '12px 24px',
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: authLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                        touchAction: 'manipulation',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {authLoading ? (
                        <>
                          <span className="live-pulse-dot" style={{ background: '#e11d48' }} />
                          <span>Connecting Google...</span>
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Continue with Google</span>
                        </>
                      )}
                    </button>

                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#9ca3af' }}>
                      🔒 Zero spam • No minimum follower count • Free forever
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', color: '#43332b', border: '1px solid #f3f4f6' }}>
                      Signed in as: <strong>{user.email}</strong>
                    </div>

                    {/* Profile Picture Uploader */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff1f2', padding: '12px 16px', borderRadius: '12px', border: '1px dashed #f472b6' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: '2px solid #a64036', overflow: 'hidden', flexShrink: 0 }}>
                        {formData.profile_image ? (
                          <img src={formData.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '📸'
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                          Profile Photo (Optional)
                        </div>
                        <label style={{ background: '#e11d48', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: uploadingAvatar ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', minHeight: '34px' }}>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingAvatar}
                            onChange={handleAvatarUpload}
                            style={{ display: 'none' }}
                          />
                          {uploadingAvatar ? '⏳ Uploading...' : formData.profile_image ? '🔄 Change Photo' : '📤 Upload Photo'}
                        </label>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Creator / Channel Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Maya &amp; Arjun"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', minHeight: '46px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Desired Creator URL * (lovelycrafts.in/c/yourname)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        placeholder="e.g. mayavlogs"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', minHeight: '46px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        WhatsApp / Phone Number (for payout notifications)
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', minHeight: '46px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Instagram Profile Link
                      </label>
                      <input
                        type="url"
                        inputMode="url"
                        value={formData.instagram_url}
                        onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/yourhandle"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', minHeight: '46px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        YouTube / TikTok Profile Link
                      </label>
                      <input
                        type="url"
                        inputMode="url"
                        value={formData.youtube_url}
                        onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                        placeholder="https://youtube.com/@yourchannel"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', minHeight: '46px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Short Bio (What content do you create?)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us a little about your audience and vibe..."
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', resize: 'vertical' }}
                      />
                    </div>

                    {errorMessage && (
                      <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fecaca' }}>
                        ⚠️ {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      onClick={() => triggerHaptic('success')}
                      style={{
                        background: '#e11d48',
                        color: '#fff',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        marginTop: '8px',
                        boxShadow: '0 4px 14px rgba(225,29,72,0.2)',
                        minHeight: '50px',
                        touchAction: 'manipulation',
                      }}
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Creator Application ✨'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
