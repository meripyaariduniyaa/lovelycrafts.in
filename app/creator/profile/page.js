'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function CreatorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Change request form
  const [changeField, setChangeField] = useState('phone');
  const [changeValue, setChangeValue] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/creator/login'); return; }
    loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Access denied');
      const data = await res.json();
      setProfile(data.creator);
      setChangeRequests(data.changeRequests || []);
    } catch (err) {
      router.replace('/creator/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRequest = async (e) => {
    e.preventDefault();
    if (!changeValue.trim()) return;
    setSubmitting(true);
    setMessage('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'change_request', field: changeField, newValue: changeValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setMessage('Change request submitted! Admin will review it shortly.');
      setChangeValue('');
      loadProfile();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#ec4899', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const CHANGEABLE_FIELDS = [
    { value: 'phone', label: 'Phone Number' },
    { value: 'address', label: 'Address' },
    { value: 'state', label: 'State' },
    { value: 'bank_account_number', label: 'Bank Account Number' },
    { value: 'bank_ifsc', label: 'IFSC Code' },
    { value: 'bank_account_holder', label: 'Account Holder Name' },
    { value: 'upi_id', label: 'UPI ID' },
  ];

  const statusColor = { pending: '#b45309', approved: '#15803d', rejected: '#b91c1c' };
  const statusBg = { pending: '#fef3c7', approved: '#dcfce7', rejected: '#fee2e2' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Top Nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/creator/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>My Profile</div>
        <div style={{ width: '120px' }} />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Header Card */}
        <div style={{ background: 'linear-gradient(135deg, #f8f3eb 0%, #f8f3eb 100%)', borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff', border: '2px solid rgba(255,255,255,0.2)', overflow: 'hidden', flexShrink: 0 }}>
            {profile?.profile_image ? (
              <img src={profile.profile_image} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (profile?.name || '?').split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>{profile?.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '2px' }}>{profile?.email}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#ec4899', color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                {profile?.tier || 'starter'} tier
              </span>
              {profile?.coupon_code && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace' }}>
                  {profile.coupon_code}
                </span>
              )}
              {profile?.joining_form_completed && (
                <span style={{ background: '#059669', color: '#fff', padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'bank', label: '🏦 Bank Details' },
            { id: 'requests', label: `🔄 Change Requests${changeRequests.filter(r => r.status === 'pending').length > 0 ? ` (${changeRequests.filter(r => r.status === 'pending').length})` : ''}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '9px 16px', borderRadius: '8px', border: 'none',
                background: activeTab === tab.id ? '#f8f3eb' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Full Name', value: profile?.name },
              { label: 'Email Address', value: profile?.email },
              { label: 'Phone / WhatsApp', value: profile?.phone || '—' },
              { label: 'Date of Birth', value: profile?.dob || '—' },
              { label: 'Address', value: profile?.address || '—' },
              { label: 'State', value: profile?.state || '—' },
              { label: 'Content Language', value: profile?.language || '—' },
              { label: 'Creator Slug', value: profile?.slug ? `lovelycrafts.in/c/${profile.slug}` : '—' },
              { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', gap: '16px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 500, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 16px', fontSize: '0.82rem', color: '#43332b' }}>
              💡 To update your personal details, submit a Change Request from the tab above. Admin will review and apply changes.
            </div>
          </div>
        )}

        {/* Bank Tab */}
        {activeTab === 'bank' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', fontSize: '0.82rem', color: '#43332b', marginBottom: '4px' }}>
              🔒 Bank details are stored securely and used exclusively for payout processing.
            </div>
            {[
              { label: 'Account Holder', value: profile?.bank_account_holder || '—' },
              { label: 'Account Number', value: profile?.bank_account_number ? `****${profile.bank_account_number.slice(-4)}` : '—' },
              { label: 'IFSC Code', value: profile?.bank_ifsc || '—' },
              { label: 'UPI ID', value: profile?.upi_id || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</span>
                <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{value}</span>
              </div>
            ))}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 16px', fontSize: '0.82rem', color: '#43332b' }}>
              To update bank details, use the Change Requests tab. Account number changes require admin verification.
            </div>
          </div>
        )}

        {/* Change Requests Tab */}
        {activeTab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Submit Form */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Submit a Change Request</h3>
              
              {message && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', background: message.startsWith('Error') ? '#fee2e2' : '#f0fdf4', color: message.startsWith('Error') ? '#a64036' : '#f8f3eb', border: `1px solid ${message.startsWith('Error') ? '#fecaca' : '#bbf7d0'}` }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleChangeRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Field to Change</label>
                  <select
                    value={changeField}
                    onChange={(e) => setChangeField(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', background: '#fff', color: '#43332b' }}
                  >
                    {CHANGEABLE_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>New Value</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter the new value..."
                    value={changeValue}
                    onChange={(e) => setChangeValue(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', color: '#0f172a' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '11px', background: '#f8f3eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Change Request'}
                </button>
              </form>
            </div>

            {/* Request History */}
            {changeRequests.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Request History</h3>
                </div>
                {changeRequests.map((req) => (
                  <div key={req.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', textTransform: 'capitalize' }}>{req.field?.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{req.old_value || '(empty)'}</span>
                        {' → '}
                        <strong style={{ color: '#0f172a' }}>{req.new_value}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : ''}
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize', background: statusBg[req.status] || '#f1f5f9', color: statusColor[req.status] || '#64748b', flexShrink: 0 }}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
