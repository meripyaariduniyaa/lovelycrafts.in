'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import CreatorTermsModal, { CREATOR_TERMS_VERSION } from '@/components/CreatorTermsModal';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    instagram_url: '',
    youtube_url: '',
    profile_image: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Bank & Payout Details Update Request State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_holder_name: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    pan_number: '',
    document_url: '',
    request_note: '',
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const [bankSuccessMsg, setBankSuccessMsg] = useState('');

  // QR Code Toolkit Modal State
  const [showQrModal, setShowQrModal] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedDisclosure, setCopiedDisclosure] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true); // optimistic default until data loads
  // Earnings estimator — must be declared here (before any conditional returns) to satisfy Rules of Hooks
  const [estimatedMonthlyOrders, setEstimatedMonthlyOrders] = useState(30);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('lc_creator_welcome_v1');
      if (dismissed === 'true') {
        setShowWelcomeGuide(false);
      }
    }
  }, []);

  const dismissWelcomeGuide = () => {
    setShowWelcomeGuide(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lc_creator_welcome_v1', 'true');
    }
  };

  const loadDashboard = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not load dashboard');

      setData(result);
      if (result.creator) {
        setProfileForm({
          name: result.creator.name || '',
          bio: result.creator.bio || '',
          phone: result.creator.phone || '',
          instagram_url: result.creator.instagram_url || '',
          youtube_url: result.creator.youtube_url || '',
          profile_image: result.creator.profile_image || '',
        });
        if (result.creator.payout_details) {
          setBankForm({
            account_holder_name: result.creator.payout_details.account_holder_name || '',
            bank_name: result.creator.payout_details.bank_name || '',
            account_number: result.creator.payout_details.account_number || '',
            ifsc_code: result.creator.payout_details.ifsc_code || '',
            upi_id: result.creator.payout_details.upi_id || '',
            pan_number: result.creator.payout_details.pan_number || '',
            document_url: result.creator.payout_details.document_url || '',
            request_note: result.creator.payout_details.request_note || '',
          });
        }
        // Check if this creator has accepted the current T&C version
        const hasAccepted =
          result.creator.terms_accepted_at &&
          result.creator.terms_version === CREATOR_TERMS_VERSION;
        setTermsAccepted(hasAccepted);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/creator/login');
      return;
    }
    if (user) {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Image must be under 10MB.');
      return;
    }

    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vkcgnlm1';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'apology_images';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'user-uploads');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await res.json();
      if (uploadData.secure_url) {
        setProfileForm((prev) => ({ ...prev, profile_image: uploadData.secure_url }));
      } else {
        setAvatarError(uploadData?.error?.message || 'Failed to upload photo.');
      }
    } catch (err) {
      setAvatarError('Upload failed. Please check your internet connection.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setEditingProfile(false);
      loadDashboard();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setDocUploadError('Document file must be under 12MB.');
      return;
    }

    setUploadingDoc(true);
    setDocUploadError('');
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vkcgnlm1';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'apology_images';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'creator-payout-docs');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await res.json();
      if (uploadData.secure_url) {
        setBankForm((prev) => ({ ...prev, document_url: uploadData.secure_url }));
      } else {
        setDocUploadError(uploadData?.error?.message || 'Failed to upload document.');
      }
    } catch (err) {
      setDocUploadError('Upload failed. Please check your internet connection.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    if (!bankForm.upi_id && !bankForm.account_number) {
      alert('Please provide at least a UPI ID or Bank Account Number for commission payouts.');
      return;
    }

    setSavingBank(true);
    setBankSuccessMsg('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payout_details: bankForm,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit bank details.');
      
      setBankSuccessMsg('✓ Your bank & payout details request was successfully submitted for admin verification!');
      setTimeout(() => {
        setShowBankModal(false);
        setBankSuccessMsg('');
        loadDashboard();
      }, 2500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingBank(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const token = await user.getIdToken();
      const acceptedAt = new Date().toISOString();
      const res = await fetch('/api/creator/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          terms_accepted_at: acceptedAt,
          terms_version: CREATOR_TERMS_VERSION,
        }),
      });
      if (!res.ok) throw new Error('Failed to record acceptance');
      setTermsAccepted(true);
    } catch (err) {
      alert('Could not record your acceptance. Please refresh and try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '2.5rem', animation: 'bounce 1s infinite' }}>👑</div>
          <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading Creator Dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '36px', borderRadius: '20px', border: '1px solid #fecaca', maxWidth: '460px' }}>
          <div style={{ fontSize: '2.5rem', color: '#dc2626', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Access Error</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/creators" style={{ background: '#e11d48', color: '#fff', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
              Join Creator Club
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/creator/login');
              }}
              style={{ background: '#f3f4f6', color: '#43332b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data?.creator || !data.applied) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #fecdd3', maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Join the Creator Club</h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
            You haven&apos;t applied to the Creator Club yet. Apply now to get your exclusive coupon code, custom referral link, and earn up to 18% commission.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <Link href="/creators#apply" style={{ background: '#e11d48', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(166, 64, 54, 0.96)', width: '100%', maxWidth: '280px' }}>
              Start Creator Application 🚀
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/creator/login');
              }}
              style={{ background: 'transparent', color: '#43332b', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: '8px' }}
            >
              🚪 Sign Out ({user?.email})
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { creator, summary, coupons = [], gifts = [], commissions = [], invitedCreators = [] } = data;

  if (creator.status === 'pending') {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '40px 24px', borderRadius: '24px', border: '1px solid #fde68a', maxWidth: '520px', boxShadow: '0 8px 24px rgba(217,119,6,0.08)', width: '100%' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400e', marginBottom: '8px' }}>Application Under Review</h2>
          <p style={{ color: '#b45309', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Hey <strong>{creator.name}</strong>! Your application for <code>lovelycrafts.in/c/{creator.slug}</code> has been received and is currently under review by our admin team.
          </p>
          <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#43332b', border: '1px dashed #fcd34d', marginBottom: '20px' }}>
            <div style={{ marginBottom: '4px' }}>📌 Status: <strong>Pending Admin Approval</strong></div>
            <div style={{ marginBottom: '4px' }}>📬 Email: <strong>{creator.email}</strong></div>
            <div>🔗 Requested URL: <strong>lovelycrafts.in/c/{creator.slug}</strong></div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/creator/login');
            }}
            style={{ background: '#fef3c7', color: '#43332b', border: '1px solid #fde68a', padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}
          >
            🚪 Sign Out
          </button>
        </div>
      </main>
    );
  }

  const referralUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${creator.slug}` : `https://lovelycrafts.in/c/${creator.slug}`;
  const primaryCouponCode = creator.coupon_code || coupons[0]?.code || creator.slug?.toUpperCase();

  // Tier progress calculations (Evaluated on monthly orders, resets on 1st of every month)
  const currentOrders = summary?.monthOrders || 0;
  const currentTier = summary?.tier || { name: 'Starter', minOrders: 0, commissionRate: 10, emoji: '🌱' };
  const nextTier = summary?.nextTier;
  const currentRate = summary?.rate || 10;
  
  let tierProgressPercent = 100;
  let ordersToNextTier = 0;
  if (nextTier) {
    const prevMin = currentTier.minOrders || 0;
    const nextMin = nextTier.minOrders;
    const range = nextMin - prevMin;
    const progress = Math.max(0, currentOrders - prevMin);
    tierProgressPercent = Math.min(100, Math.round((progress / range) * 100));
    ordersToNextTier = nextMin - currentOrders;
  }

  const avgOrderValue = 199; // Standard order price in INR

  // Calculate days remaining until monthly reset
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = Math.max(1, lastDayOfMonth - now.getDate());

  // Conversion rate calculation
  const totalClicks = summary?.clicks || 0;
  const totalOrders = summary?.totalOrders || 0;
  const convRate = totalClicks > 0 ? ((totalOrders / totalClicks) * 100).toFixed(1) : '0.0';

  // Bank payout details status
  const payoutDetails = creator?.payout_details || {};
  const hasBankData = Boolean(payoutDetails.upi_id || payoutDetails.account_number);
  const bankVerificationStatus = payoutDetails.verification_status || (hasBankData ? 'pending_verification' : 'not_submitted');

  // QR Code URL
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(referralUrl)}&color=e11d48&bgcolor=ffffff&margin=10`;

  // WhatsApp share builder
  const waText = encodeURIComponent(
    `✨ Hey! I created a digital card & memory studio with LovelyCrafts!\n\n🎁 Use my code *${primaryCouponCode}* for *10% OFF* on all personalized digital gifts & cards!\n\n👉 Click here: ${referralUrl}`
  );
  const waShareUrl = `https://api.whatsapp.com/send?text=${waText}`;

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '0 0 90px' }}>

      {/* LEGAL T&C GATE */}
      {data && !termsAccepted && (
        <CreatorTermsModal
          creatorName={data.creator?.name}
          creatorEmail={user?.email}
          onAccept={handleAcceptTerms}
        />
      )}
      
      {/* CREATOR PORTAL TOPBAR */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 40, marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              <span style={{ fontSize: '1.3rem' }}>❤️</span> Lovely<span style={{ color: '#e11d48' }}>Crafts</span>
            </Link>
            <span style={{ background: '#ffe4e6', color: '#a64036', padding: '3px 9px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Creator Hub
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* CONTENT IDEAS BUTTON */}
            <Link
              href="/content-ideas"
              style={{
                fontSize: '0.82rem',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                padding: '7px 14px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(225,29,72,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>💡</span> Viral Content Ideas
              <span style={{ background: '#fef08a', color: '#43332b', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px', fontWeight: 800 }}>
                HOT 🔥
              </span>
            </Link>

            {/* QR TOOLKIT BUTTON */}
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              style={{
                fontSize: '0.8rem',
                color: '#0f172a',
                fontWeight: 700,
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              📱 QR Code
            </button>

            {/* BANK & DOCUMENTS BUTTON */}
            <button
              type="button"
              onClick={() => setShowBankModal(true)}
              style={{
                fontSize: '0.8rem',
                color: bankVerificationStatus === 'verified' ? '#15803d' : '#854d0e',
                fontWeight: 700,
                background: bankVerificationStatus === 'verified' ? '#dcfce7' : '#fef3c7',
                border: bankVerificationStatus === 'verified' ? '1px solid #bbf7d0' : '1px solid #fde68a',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              💳 {bankVerificationStatus === 'verified' ? 'Bank ✓' : 'Bank Payout ⚠️'}
            </button>

            <Link href={`/creators/${creator.slug}`} target="_blank" style={{ fontSize: '0.8rem', color: '#43332b', textDecoration: 'none', fontWeight: 700, background: '#fff1f2', padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
              👁️ Storefront
            </Link>
            
            <Link href="/creator/change-password" style={{ fontSize: '0.8rem', color: '#43332b', textDecoration: 'none', fontWeight: 600, background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              🔒 Password
            </Link>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/creator/login');
              }}
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🚪 Exit
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 16px' }}>

        {/* PROFILE HEADER CARD */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
            <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '3px solid #fda4af', overflow: 'hidden', flexShrink: 0 }}>
              {creator.profile_image ? <img src={creator.profile_image} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '💖'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {creator.name}
                </h1>
                <span style={{ background: '#dcfce7', color: '#43332b', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  ✓ Verified Creator
                </span>
                {bankVerificationStatus === 'verified' && (
                  <span style={{ background: '#eff6ff', color: '#43332b', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px' }}>
                    🏦 KYC &amp; Bank Verified
                  </span>
                )}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Tier: <strong style={{ color: '#e11d48' }}>{currentTier.emoji} {currentTier.name}</strong></span>
                <span>•</span>
                <span>Commission: <strong style={{ color: '#059669' }}>{currentRate}%</strong></span>
                <span>•</span>
                <span>Store: <code style={{ color: '#0f172a', fontWeight: 600 }}>/c/{creator.slug}</code></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
            <button
              type="button"
              onClick={() => setEditingProfile(!editingProfile)}
              style={{ background: '#f1f5f9', color: '#43332b', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', flex: 1, minWidth: '120px', minHeight: '42px' }}
            >
              ✏️ {editingProfile ? 'Close Editor' : 'Edit Profile'}
            </button>
            <button
              type="button"
              onClick={() => setShowBankModal(true)}
              style={{ background: '#ffe4e6', color: '#a64036', border: '1px solid #fecdd3', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', flex: 1, minWidth: '140px', minHeight: '42px' }}
            >
              💳 Bank &amp; KYC
            </button>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              style={{ background: '#f8f3eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', flex: 1, minWidth: '120px', minHeight: '42px' }}
            >
              📱 QR Toolkit
            </button>
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#25D366', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, minWidth: '140px', minHeight: '42px' }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>

        {/* VIRAL CONTENT PLAYBOOK HERO BANNER */}
        <div style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #9013fe 100%)', borderRadius: '24px', padding: '24px 28px', color: '#fff', marginBottom: '24px', boxShadow: '0 10px 30px rgba(166, 64, 54, 0.96)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                <span>🔥</span> Creator Growth Engine &amp; Marketing Hub
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                Never Wonder What To Post Again! 💡
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#ffe4e6', margin: 0, lineHeight: 1.5 }}>
                Access proven 20-second Reel &amp; TikTok blueprints, high-converting emotional hooks, 1-click captions, and trending audio ideas for all 5 digital gift templates.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
              <Link
                href="/content-ideas"
                style={{
                  background: '#fff',
                  color: '#be123c',
                  padding: '12px 22px',
                  borderRadius: '14px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <span>🚀</span> Explore Content Ideas &rarr;
              </Link>
              <div style={{ fontSize: '0.75rem', color: '#fecdd3', textAlign: 'center' }}>
                5 Plug &amp; Play Campaign Blueprints
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {[
              { label: '💍 Proposal Love Stories', tag: 'High Virality' },
              { label: '🎂 Birthday Midnight Surprise', tag: 'Daily Demand' },
              { label: '✨ Anniversary Flipbook', tag: 'High Conversion' },
              { label: '🕊️ Heartfelt Apology Card', tag: 'Emotional Hook' },
              { label: '💌 Long-Distance Miss You', tag: 'Relatable Audio' },
            ].map((item, idx) => (
              <span key={idx} style={{ background: 'rgba(255,255,255,0.12)', padding: '5px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {item.label} <span style={{ opacity: 0.75, fontSize: '0.68rem' }}>({item.tag})</span>
              </span>
            ))}
          </div>
        </div>

        {/* VISUAL TIER PROGRESS & LEVEL UP BAR */}
        <div style={{ background: 'linear-gradient(135deg, #f8f3eb 0%, #f8f3eb 100%)', color: '#fff', borderRadius: '24px', padding: '24px 28px', marginBottom: '24px', boxShadow: '0 8px 30px rgba(15,23,42,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(225,29,72,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🏆 MONTHLY CREATOR TIER ROADMAP
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentTier.emoji}</span> {currentTier.name} Tier ({currentRate}% Commission)
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(234,179,8,0.15)', color: '#fef08a', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.25)', fontSize: '0.78rem', fontWeight: 700 }}>
                ⏳ {daysLeftInMonth} Days Left in Month
              </div>
              {nextTier ? (
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 600 }}>
                  Next Level: <strong>{nextTier.emoji} {nextTier.name} ({nextTier.commissionRate}%)</strong>
                </div>
              ) : (
                <div style={{ background: 'rgba(234,179,8,0.2)', color: '#fef08a', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.3)', fontSize: '0.82rem', fontWeight: 700 }}>
                  👑 TOP TIER ACHIEVED!
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar Container */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
              <span>{currentOrders} Paid Orders This Month (Resets on 1st to maintain activity)</span>
              <span>{nextTier ? `${ordersToNextTier} orders until ${nextTier.name}` : 'Maximum Tier Unlocked'}</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', overflow: 'hidden', padding: '2px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${tierProgressPercent}%`,
                  background: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.6s ease',
                  boxShadow: '0 0 12px rgba(244,63,94,0.6)',
                }}
              />
            </div>
          </div>

          {/* Tier levels badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { name: 'Starter', min: 0, range: '0–100', rate: '10%', emoji: '🌱' },
              { name: 'Rising', min: 101, range: '101–300', rate: '15%', emoji: '💚' },
              { name: 'Creator', min: 301, range: '301–700', rate: '16%', emoji: '💙' },
              { name: 'Partner', min: 701, range: '701–1,500', rate: '17%', emoji: '💜' },
              { name: 'Elite', min: 1501, range: '1,501+', rate: '18%', emoji: '👑' },
            ].map((t) => {
              const isUnlocked = currentOrders >= t.min;
              const isCurrent = currentTier.name?.toLowerCase() === t.name.toLowerCase();
              return (
                <div
                  key={t.name}
                  style={{
                    background: isCurrent ? 'rgba(244,63,94,0.25)' : isUnlocked ? 'rgba(255,255,255,0.06)' : 'rgba(247, 238, 228, 0.96)',
                    border: isCurrent ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    textAlign: 'center',
                    opacity: isUnlocked ? 1 : 0.65,
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isCurrent ? '#fecdd3' : '#e2e8f0' }}>
                    {t.emoji} {t.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                    {t.range} orders • <strong style={{ color: '#38bdf8' }}>{t.rate}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ONBOARDING CHECKLIST / WELCOME GUIDE */}
        {showWelcomeGuide ? (
          <div style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fff 100%)', borderRadius: '24px', padding: '24px', border: '1px solid #fecdd3', marginBottom: '24px', boxShadow: '0 8px 24px rgba(225,29,72,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🚀 Quick-Start Checklist
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  🎉 Welcome to the LovelyCrafts Creator Club!
                </h2>
              </div>
              <button
                type="button"
                onClick={dismissWelcomeGuide}
                style={{ background: '#fff', color: '#43332b', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', minHeight: '36px' }}
              >
                Dismiss Checklist ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #ffe4e6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', marginBottom: '4px' }}>STEP 1</div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>Complete Profile</strong>
                <small style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>Add your bio, social channels &amp; custom avatar.</small>
              </div>

              <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #ffe4e6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', marginBottom: '4px' }}>STEP 2</div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>Get Coupon Code</strong>
                <small style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>Your fans get 10% OFF with code <code>{primaryCouponCode}</code>.</small>
              </div>

              <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #ffe4e6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', marginBottom: '4px' }}>STEP 3</div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>Try Free Gift Pass</strong>
                <small style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>Redeem your complimentary VIP gift code below.</small>
              </div>

              <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #ffe4e6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', marginBottom: '4px' }}>STEP 4</div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>Submit Bank Payout</strong>
                <small style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>Provide UPI / Bank IFSC &amp; doc for fast payouts.</small>
              </div>

              <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #ffe4e6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', marginBottom: '4px' }}>STEP 5</div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>Viral Content Ideas</strong>
                <small style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>Use our 20-second script templates to post Reels.</small>
              </div>

              <div style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #ffe4e6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', marginBottom: '4px' }}>STEP 6</div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>Unlock 18% Rate</strong>
                <small style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.4, display: 'block' }}>Level up automatically as sales cross 100+ orders.</small>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => setShowWelcomeGuide(true)}
              style={{ background: 'transparent', border: 'none', color: '#a64036', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              📖 View Creator Checklist
            </button>
          </div>
        )}

        {/* EDIT PROFILE FORM */}
        {editingProfile && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #fecdd3', marginBottom: '24px', boxShadow: '0 8px 24px rgba(225,29,72,0.06)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Edit Public Profile Details
            </h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '16px', background: '#fff5f7', padding: '16px', borderRadius: '16px', border: '1px dashed #f472b6', flexWrap: 'wrap' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '2px solid #a64036', overflow: 'hidden', flexShrink: 0 }}>
                  {profileForm.profile_image ? (
                    <img src={profileForm.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '📸'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Profile Photo
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <label style={{ background: '#e11d48', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: uploadingAvatar ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingAvatar}
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                      />
                      {uploadingAvatar ? '⏳ Uploading...' : profileForm.profile_image ? '🔄 Change Photo' : '📤 Upload Photo'}
                    </label>
                    {profileForm.profile_image && (
                      <button
                        type="button"
                        onClick={() => setProfileForm((prev) => ({ ...prev, profile_image: '' }))}
                        style={{ background: '#f1f5f9', color: '#43332b', border: 'none', padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {avatarError && (
                    <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>
                      ⚠️ {avatarError}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Creator Display Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Instagram URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  value={profileForm.instagram_url}
                  onChange={(e) => setProfileForm({ ...profileForm, instagram_url: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>YouTube Channel URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@channel"
                  value={profileForm.youtube_url}
                  onChange={(e) => setProfileForm({ ...profileForm, youtube_url: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Bio / Intro</label>
                <textarea
                  rows={3}
                  placeholder="Tell your fans what kind of creative digital cards you love..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  style={{ background: '#f1f5f9', color: '#43332b', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', minHeight: '44px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* METRICS OVERVIEW CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>⏳ Pending Commission</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
              ₹{((summary?.pending || 0) / 100).toFixed(2)}
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.75rem', fontWeight: 600, color: (summary?.pending || 0) >= 50000 ? '#15803d' : '#64748b' }}>
              {(summary?.pending || 0) >= 50000 ? (
                '✓ Reached ₹500 payout threshold'
              ) : (
                `Min payout: ₹500 (₹${(500 - (summary?.pending || 0) / 100).toFixed(2)} left)`
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>💰 Paid Earnings</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              ₹{((summary?.paid || 0) / 100).toFixed(2)}
            </div>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Lifetime completed payouts</small>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>🎁 Attributed Orders</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {summary?.totalOrders || 0}
            </div>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{summary?.monthOrders || 0} orders this month</small>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>🔗 Referral Clicks</span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {summary?.clicks || 0}
            </div>
            <small style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>{convRate}% conversion rate</small>
          </div>
        </div>

        {/* PENDING EARNINGS BREAKDOWN */}
        {commissions.filter(c => c.status === 'pending').length > 0 && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>⏳ Pending Earnings Breakdown</h3>
              <span style={{ fontSize: '0.8rem', color: '#43332b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                {commissions.filter(c => c.status === 'pending').length} entries · ₹{(commissions.filter(c => c.status === 'pending').reduce((s,c) => s + (Number(c.commission_amount)||0),0)/100).toFixed(2)} total
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '480px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Type</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions
                    .filter(c => c.status === 'pending')
                    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                    .map((c) => {
                      const isReferralBounty = c.type === 'creator_referral_bounty';
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc', background: isReferralBounty ? '#fdf4ff' : 'transparent' }}>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {isReferralBounty ? (
                              <span style={{ background: '#f3e8ff', color: '#43332b', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>🎁 Referral Bounty</span>
                            ) : (
                              <span style={{ background: '#f0fdf4', color: '#43332b', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>🛒 Sale Commission</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: isReferralBounty ? '#7e22ce' : '#059669', fontFamily: 'monospace' }}>
                            ₹{((Number(c.commission_amount)||0)/100).toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ background: '#fef9c3', color: '#43332b', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>Pending</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BANK & PAYOUT VERIFICATION DETAILS CARD */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏦</span>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Bank &amp; Payout Coordinates
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Commission earnings are transferred automatically via UPI / NEFT
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {bankVerificationStatus === 'verified' ? (
                <span style={{ background: '#dcfce7', color: '#43332b', padding: '6px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}>
                  ✓ Bank Verified
                </span>
              ) : bankVerificationStatus === 'pending_verification' ? (
                <span style={{ background: '#fef3c7', color: '#a64036', padding: '6px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}>
                  ⏳ Verification In Progress
                </span>
              ) : (
                <span style={{ background: '#fee2e2', color: '#a64036', padding: '6px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}>
                  ⚠️ Bank Details Missing
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowBankModal(true)}
                style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {hasBankData ? '✏️ Update Bank & Docs' : '➕ Add Bank Details'}
              </button>
            </div>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Account Holder</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {payoutDetails.account_holder_name || creator.name || '—'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>UPI ID (VPA)</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontFamily: 'monospace' }}>
                {payoutDetails.upi_id || '—'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Bank Name &amp; IFSC</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                {payoutDetails.bank_name || 'Bank'} {payoutDetails.ifsc_code ? `(${payoutDetails.ifsc_code})` : ''}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Account Number</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontFamily: 'monospace' }}>
                {payoutDetails.account_number ? `••••••••${payoutDetails.account_number.slice(-4)}` : '—'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>PAN Card</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a', fontFamily: 'monospace' }}>
                {payoutDetails.pan_number || '—'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Uploaded Proof</span>
              {payoutDetails.document_url ? (
                <a href={payoutDetails.document_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#e11d48', fontWeight: 700, textDecoration: 'underline' }}>
                  📄 View Uploaded Document &rarr;
                </a>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No doc uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* 1-CLICK SOCIAL SHARING & MARKETING KIT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          {/* REFERRAL LINK CARD */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🔗</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Your 30-Day Referral Link</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.4 }}>
              Share this link in your YouTube description or Instagram bio. Anyone clicking it is tracked to your account for 30 days!
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={referralUrl}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.85rem', color: '#43332b' }}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                style={{ background: copiedLink ? '#059669' : '#e11d48', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '42px' }}
              >
                {copiedLink ? '✓ Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* CREATOR DISCOUNT CODE CARD */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🏷️</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Your Exclusive Coupon Code</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px', lineHeight: 1.4 }}>
              Followers get <strong>10% OFF</strong> at checkout when using your unique code!
            </p>
            {primaryCouponCode ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={primaryCouponCode}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #fecdd3', background: '#fff1f2', fontSize: '1rem', fontWeight: 800, color: '#a64036', fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(primaryCouponCode);
                    setCopiedCoupon(true);
                    setTimeout(() => setCopiedCoupon(false), 2000);
                  }}
                  style={{ background: copiedCoupon ? '#059669' : '#e11d48', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '42px' }}
                >
                  {copiedCoupon ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                Admin will assign your custom coupon code shortly.
              </div>
            )}
          </div>

          {/* DIGITAL STORY PROMO CARD PASS WIDGET */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📸 PROMO CARD PREVIEW
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  Digital Promo Card Pass (Share on IG Stories / WhatsApp Status)
                </h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
              
              {/* Visual Card Graphic */}
              <div style={{ background: 'linear-gradient(135deg, #e11d48 0%, #9013fe 100%)', borderRadius: '20px', padding: '24px', color: '#fff', boxShadow: '0 12px 30px rgba(166, 64, 54, 0.96)', position: 'relative', overflow: 'hidden', minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', filter: 'blur(20px)' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800 }}>
                    <span>❤️ LovelyCrafts</span>
                  </div>
                  <span style={{ background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                    10% DISCOUNT PASS
                  </span>
                </div>

                <div style={{ margin: '16px 0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fff', border: '2px solid rgba(255,255,255,0.8)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#a64036' }}>
                    {creator.profile_image ? <img src={creator.profile_image} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '💖'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Created by</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{creator.name}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.95)', color: '#43332b', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Use Code At Checkout</span>
                    <strong style={{ fontSize: '1.1rem', color: '#e11d48', fontFamily: 'monospace' }}>{primaryCouponCode}</strong>
                  </div>
                  <span style={{ background: '#ffe4e6', color: '#a64036', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                    10% OFF
                  </span>
                </div>
              </div>

              {/* Action Buttons for Creator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#fff', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px' }}
                >
                  📲 Post to WhatsApp Status / Chat
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`✨ Create personalized digital cards & memory pages with my code ${primaryCouponCode} for 10% OFF! 👉 ${referralUrl}`);
                    setCopiedDisclosure(true);
                    setTimeout(() => setCopiedDisclosure(false), 2000);
                  }}
                  style={{ background: copiedDisclosure ? '#059669' : '#f8f3eb', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}
                >
                  {copiedDisclosure ? '✓ Copied Story Caption!' : '📋 Copy Caption for Instagram Story'}
                </button>
              </div>

            </div>
          </div>

          {/* INTERACTIVE EARNINGS ESTIMATOR CALCULATOR */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>🧮</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Interactive Earnings Estimator</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.4 }}>
              Estimate your monthly earnings based on sales generated through your link at your current <strong>{currentRate}%</strong> commission rate!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Estimated Monthly Orders:</label>
                  <strong style={{ fontSize: '1.1rem', color: '#e11d48' }}>{estimatedMonthlyOrders} orders / month</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={estimatedMonthlyOrders}
                  onChange={(e) => setEstimatedMonthlyOrders(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#e11d48', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  <span>5 orders</span>
                  <span>250 orders</span>
                  <span>500 orders</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Monthly Earnings</span>
                  <strong style={{ fontSize: '1.4rem', color: '#059669', fontWeight: 800 }}>
                    ₹{Math.round(estimatedMonthlyOrders * avgOrderValue * (currentRate / 100)).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Annual Potential</span>
                  <strong style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>
                    ₹{Math.round(estimatedMonthlyOrders * avgOrderValue * (currentRate / 100) * 12).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CREATOR GIFTS SECTION */}
        {gifts.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              🎁 Complimentary Creator VIP Pass
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {gifts.map((gift) => (
                <div key={gift.id} style={{ background: '#fdf2f8', border: '1px dashed #f472b6', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
                      {gift.template_id}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: gift.claimed ? '#e2e8f0' : '#dcfce7', color: gift.claimed ? '#64748b' : '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                      {gift.claimed ? 'Claimed' : 'Active 100% Free'}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace', color: '#831843', marginBottom: '12px' }}>
                    {gift.code}
                  </div>
                  {!gift.claimed && (
                    <Link
                      href={`/create?template=${gift.template_id}&coupon=${gift.code}`}
                      style={{ display: 'block', textAlign: 'center', background: '#db2777', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', minHeight: '40px' }}
                    >
                      Redeem &amp; Craft Free Gift ✨
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATOR REFERRAL PROGRAM */}
        <div style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%)', borderRadius: '24px', padding: '28px', border: '1px solid #e879f9', marginBottom: '32px', boxShadow: '0 4px 20px rgba(232,121,249,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7e22ce', margin: 0 }}>🤝 Invite Creators &amp; Earn ₹150</h3>
              <p style={{ fontSize: '0.85rem', color: '#a21caf', margin: '4px 0 0' }}>For every friend you bring who gets approved &amp; makes their first sale, you earn a ₹150 bounty.</p>
            </div>
            <div style={{ background: '#f3e8ff', border: '1px solid #d8b4fe', borderRadius: '12px', padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#7e22ce' }}>{invitedCreators.filter(c => c.referral_bounty_awarded).length}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase' }}>Bounties Earned</div>
            </div>
          </div>

          {/* Invite Link Box */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #e9d5ff', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>Your Creator Invite Link</div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ flex: 1, background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#43332b', fontFamily: 'monospace', wordBreak: 'break-all', minWidth: 0 }}>
                {`${typeof window !== 'undefined' ? window.location.origin : 'https://lovelycrafts.in'}/creators?ref=${creator.slug}`}
              </code>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/creators?ref=${creator.slug}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setCopiedInvite(true);
                    setTimeout(() => setCopiedInvite(false), 2000);
                  });
                }}
                style={{ background: copiedInvite ? '#16a34a' : '#7e22ce', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', minHeight: '44px' }}
              >
                {copiedInvite ? '✅ Copied!' : '📋 Copy Link'}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '8px' }}>Share this link with creator friends. Bounty credited after their first successful paid order.</div>
          </div>

          {/* Invited Creators Table */}
          {invitedCreators.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f3e8ff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#7e22ce', borderRadius: '8px 0 0 8px' }}>Creator</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#7e22ce' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 800, color: '#7e22ce' }}>Joined</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#7e22ce', borderRadius: '0 8px 8px 0' }}>₹150 Bounty</th>
                  </tr>
                </thead>
                <tbody>
                  {invitedCreators.map((ic) => (
                    <tr key={ic.id} style={{ borderBottom: '1px solid #f3e8ff' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e1b4b' }}>
                        {ic.name}
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>/{ic.slug}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: ic.status === 'approved' ? '#dcfce7' : ic.status === 'pending' ? '#fef9c3' : '#fee2e2',
                          color: ic.status === 'approved' ? '#15803d' : ic.status === 'pending' ? '#854d0e' : '#b91c1c',
                          padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase'
                        }}>
                          {ic.status === 'approved' ? '✅ Active' : ic.status === 'pending' ? '⏳ Pending' : ic.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#6b7280', fontSize: '0.8rem' }}>
                        {ic.joined_at ? new Date(ic.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        {ic.referral_bounty_awarded ? (
                          <span style={{ background: '#dcfce7', color: '#43332b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>🏆 Earned!</span>
                        ) : ic.status === 'approved' ? (
                          <span style={{ background: '#fef9c3', color: '#43332b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>⏳ Awaiting Sale</span>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', background: '#fff', borderRadius: '14px', border: '1px dashed #d8b4fe' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💌</div>
              <div style={{ fontWeight: 700, color: '#7e22ce', fontSize: '1rem', marginBottom: '6px' }}>No invites yet — be the first!</div>
              <div style={{ fontSize: '0.85rem', color: '#a21caf' }}>Copy your invite link above and share it with creator friends. Each successful referral = ₹150 for you.</div>
            </div>
          )}
        </div>

        {/* PAYOUT HISTORY */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
            💳 Payout Batches &amp; History
          </h3>
          {data.summary?.payouts?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#64748b' }}>Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#64748b' }}>Amount</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#64748b' }}>Method</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#64748b' }}>UTR / Reference</th>
                    <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.payouts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#334155' }}>
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                        ₹{((p.amount || 0) / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#475569' }}>{p.method || 'UPI'}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>{p.reference || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#dcfce7', color: '#43332b', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          ✓ Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>
              No payout batches processed yet. Pending commissions are batched and paid to your UPI/Bank once threshold is met.
            </p>
          )}
        </div>

      </div>

      {/* BANK / PAYOUT DETAILS UPDATE REQUEST MODAL */}
      {showBankModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(247, 238, 228, 0.96)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(247, 238, 228, 0.96)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  KYC &amp; BANK COORDINATES
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  Update Bank &amp; Payout Documents
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                style={{ background: '#f1f5f9', border: 'none', color: '#43332b', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px', lineHeight: 1.4 }}>
              Submit your bank details or UPI ID along with proof (Cancelled Cheque, Bank Passbook, or PAN card) so our finance team can verify and release your commissions without delay.
            </p>

            {bankSuccessMsg && (
              <div style={{ background: '#dcfce7', color: '#43332b', padding: '14px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                {bankSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveBankDetails} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Account Holder Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per Bank / PAN records"
                  value={bankForm.account_holder_name}
                  onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  UPI ID (Fastest Transfer) ⚡
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@okaxis or mobile@upi"
                  value={bankForm.upi_id}
                  onChange={(e) => setBankForm({ ...bankForm, upi_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={bankForm.ifsc_code}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  PAN Card Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={bankForm.pan_number}
                  onChange={(e) => setBankForm({ ...bankForm, pan_number: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase' }}
                />
              </div>

              {/* DOCUMENT UPLOAD */}
              <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Upload Bank Proof / Cancelled Cheque / PAN Photo 📄
                </label>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
                  Supported formats: JPG, PNG, WEBP, PDF (Max 12MB). Clear photo of passbook front page or cancelled cheque.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ background: '#f8f3eb', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: uploadingDoc ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      disabled={uploadingDoc}
                      onChange={handleDocUpload}
                      style={{ display: 'none' }}
                    />
                    {uploadingDoc ? '⏳ Uploading...' : bankForm.document_url ? '🔄 Replace Document' : '📤 Choose Document File'}
                  </label>

                  {bankForm.document_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 700 }}>
                        ✓ Document Attached
                      </span>
                      <a href={bankForm.document_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#e11d48', textDecoration: 'underline' }}>
                        Preview
                      </a>
                    </div>
                  )}
                </div>

                {docUploadError && (
                  <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>
                    ⚠️ {docUploadError}
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Additional Notes for Admin Review (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Account name matches PAN. Please verify for weekly payout batch."
                  value={bankForm.request_note}
                  onChange={(e) => setBankForm({ ...bankForm, request_note: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={savingBank || uploadingDoc}
                  style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', flex: 1, minHeight: '44px' }}
                >
                  {savingBank ? 'Submitting Request...' : 'Submit Payout Details for Verification 🚀'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  style={{ background: '#f1f5f9', color: '#43332b', border: 'none', padding: '12px 18px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', minHeight: '44px' }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATOR QR CODE TOOLKIT MODAL */}
      {showQrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(247, 238, 228, 0.96)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(247, 238, 228, 0.96)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PROMO TOOLKIT
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  Your Custom QR Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{ background: '#f1f5f9', border: 'none', color: '#43332b', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.4 }}>
              Add this QR code to your YouTube video outro, Instagram story stickers, or WhatsApp flyers so fans scan directly into your storefront!
            </p>

            <div style={{ background: '#fff1f2', border: '2px solid #fecdd3', borderRadius: '20px', padding: '20px', display: 'inline-block', marginBottom: '16px', boxShadow: '0 8px 24px rgba(225,29,72,0.08)' }}>
              <img
                src={qrImageUrl}
                alt="Creator Storefront QR Code"
                style={{ width: '220px', height: '220px', display: 'block', borderRadius: '12px' }}
              />
              <div style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: 800, color: '#be123c' }}>
                lovelycrafts.in/c/{creator.slug}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={qrImageUrl}
                download={`${creator.slug}-lovelycrafts-qr.png`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#e11d48', color: '#fff', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', display: 'block' }}
              >
                📥 Download High-Res QR Image
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                style={{ background: '#f1f5f9', color: '#43332b', border: 'none', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {copiedLink ? '✓ Copied Link' : '🔗 Copy Direct URL'}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}


