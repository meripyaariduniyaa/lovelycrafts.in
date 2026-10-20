'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { changeUserPassword } from '@/lib/firebase';

export default function CreatorChangePasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/creator/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await changeUserPassword(user, newPassword);
      if (!res.success) {
        throw new Error(res.error || 'Failed to update password.');
      }
      setSuccess('Your password has been successfully updated!');
      setTimeout(() => {
        router.push('/creator/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '2.5rem', animation: 'bounce 1s infinite' }}>🔐</div>
          <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading Security Settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 30%, #ffe4e6 0%, #fafafa 100%)', padding: '24px' }}>
      <div
        style={{
          background: '#fff',
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          borderRadius: '24px',
          border: '1px solid #fecdd3',
          boxShadow: '0 12px 36px rgba(225,29,72,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
            Change Creator Password
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Update your account password to secure your creator dashboard &amp; earnings.
          </p>
        </div>

        {/* Security Tip Callout */}
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '14px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: '#a64036', lineHeight: 1.5 }}>
          💡 <strong>First-Time Login Tip:</strong> If you signed in using the temporary password assigned by admin during approval, please set your permanent private password here.
        </div>

        {error && (
          <div style={{ color: '#43332b', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '18px' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#43332b', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, marginBottom: '18px', textAlign: 'center' }}>
            ✅ {success} Redirecting to your dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Creator Account Email
            </label>
            <input
              type="email"
              disabled
              value={user.email || ''}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '0.9rem', color: '#43332b' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              New Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Confirm New Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: '#e11d48',
              color: '#fff',
              border: 'none',
              padding: '13px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(225,29,72,0.25)',
              marginTop: '6px',
            }}
          >
            {submitting ? 'Updating Password...' : 'Update Password & Go to Dashboard 🚀'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/creator/dashboard" style={{ color: '#4b5563', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
