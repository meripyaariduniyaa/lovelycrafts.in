'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import CreatorTermsModal from '@/components/CreatorTermsModal';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const STEPS = ['Personal Info', 'Bank & Payments', 'Agreement & Submit'];

export default function CreatorOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    phone: '',
    dob: '',
    address: '',
    state: '',
    language: '',
  });

  const [bankInfo, setBankInfo] = useState({
    bank_account_holder: '',
    bank_account_number: '',
    bank_ifsc: '',
    upi_id: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/creator/login'); return; }

    // Check if already completed
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/creator/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.creator?.joining_form_completed) {
            router.replace('/creator/dashboard');
            return;
          }
          // Pre-fill if data exists
          setPersonalInfo({
            phone: data.creator?.phone || '',
            dob: data.creator?.dob || '',
            address: data.creator?.address || '',
            state: data.creator?.state || '',
            language: data.creator?.language || '',
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    if (!agreementAccepted) { setError('Please accept the Terms & Conditions to continue.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'complete_onboarding',
          personalInfo,
          bankInfo,
          agreementAccepted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      router.replace('/creator/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8f3eb 0%, #f8f3eb 100%)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#ec4899', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f3eb 0%, #f8f3eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      <div style={{ width: '100%', maxWidth: '620px' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            LovelyCrafts <span style={{ color: '#ec4899' }}>Creator Club</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>Complete your profile to activate your creator account</div>
        </div>

        {/* Step Progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '0' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: i < step ? '#ec4899' : i === step ? '#fff' : 'rgba(255,255,255,0.1)',
                  color: i < step ? '#fff' : i === step ? '#0f172a' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: i === step ? '#fff' : '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ height: '2px', flex: 1, background: i < step ? '#ec4899' : 'rgba(255,255,255,0.1)', marginBottom: '22px', maxWidth: '40px' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', boxShadow: '0 25px 60px rgba(247, 238, 228, 0.96)' }}>
          
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#a64036', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* STEP 0: Personal Info */}
          {step === 0 && (
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Personal Information</h2>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.85rem' }}>Help us know you better. This information is secure and only visible to the team.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Phone / WhatsApp *', key: 'phone', type: 'tel', placeholder: '+91 99999 00000' },
                  { label: 'Date of Birth', key: 'dob', type: 'date', placeholder: '' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={personalInfo[key]}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, [key]: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Home Address</label>
                  <textarea
                    placeholder="Street, City, PIN"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', color: '#0f172a' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>State</label>
                    <select
                      value={personalInfo.state}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', background: '#fff', color: '#43332b' }}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Content Language</label>
                    <select
                      value={personalInfo.language}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, language: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', background: '#fff', color: '#43332b' }}
                    >
                      <option value="">Select language</option>
                      {['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Other'].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { if (!personalInfo.phone) { setError('Phone number is required.'); return; } setError(''); setStep(1); }}
                style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#f8f3eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 1: Bank & Payments */}
          {step === 1 && (
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Bank & Payment Details</h2>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.85rem' }}>Required to process your commission payouts. Stored securely, never shared.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Account Holder Name *', key: 'bank_account_holder', placeholder: 'Full name as on bank account' },
                  { label: 'Account Number *', key: 'bank_account_number', placeholder: '0000 0000 0000 0000' },
                  { label: 'IFSC Code *', key: 'bank_ifsc', placeholder: 'e.g. SBIN0001234' },
                  { label: 'UPI ID (Optional)', key: 'upi_id', placeholder: 'yourname@upi' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={bankInfo[key]}
                      onChange={(e) => setBankInfo({ ...bankInfo, [key]: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: key === 'bank_ifsc' ? 'monospace' : 'inherit', color: '#0f172a', textTransform: key === 'bank_ifsc' ? 'uppercase' : 'none' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setStep(0)} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#43332b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                <button
                  type="button"
                  onClick={() => { if (!bankInfo.bank_account_holder || !bankInfo.bank_account_number || !bankInfo.bank_ifsc) { setError('Account holder name, account number and IFSC are required.'); return; } setError(''); setStep(2); }}
                  style={{ flex: 2, padding: '12px', background: '#f8f3eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Agreement */}
          {step === 2 && (
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Terms & Agreement</h2>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.85rem' }}>Please read and accept the Creator Club Terms before activating your account.</p>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', marginBottom: '8px' }}>Summary of key terms:</div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.82rem', lineHeight: 1.7 }}>
                  <li>You earn commissions on verified sales via your referral link or coupon code.</li>
                  <li>Payouts are processed monthly via bank transfer or UPI after admin review.</li>
                  <li>You may not engage in spam, fraudulent purchases, or misrepresent LovelyCrafts.</li>
                  <li>LovelyCrafts reserves the right to adjust commission tiers based on performance.</li>
                  <li>Your personal and banking data is stored securely and never sold to third parties.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setShowTerms(true)}
                style={{ width: '100%', padding: '10px', background: '#f1f5f9', color: '#43332b', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginBottom: '16px' }}
              >
                📄 Read Full Creator Club Terms
              </button>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: '#ec4899', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span style={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  I have read and agree to the <strong>LovelyCrafts Creator Club Terms & Conditions</strong>. I confirm that all information provided is accurate.
                </span>
              </label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: '#f8fafc', color: '#43332b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Activating Account...' : '🚀 Activate Creator Account'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {showTerms && (
        <CreatorTermsModal
          onAccept={() => { setAgreementAccepted(true); setShowTerms(false); }}
          onClose={() => setShowTerms(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
