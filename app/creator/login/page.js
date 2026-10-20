'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithGoogle, signInWithEmail } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export default function CreatorLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/creator/dashboard');
    }
  }, [user, router]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setSigningIn(true);
    setError('');
    const { user: signedUser, error: authErr } = await signInWithEmail(email.trim(), password.trim());
    if (authErr) {
      setError(authErr);
      setSigningIn(false);
      return;
    }
    if (signedUser) {
      router.push('/creator/dashboard');
    } else {
      setSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setError('');
    const { user: signedUser, error: authErr } = await signInWithGoogle();
    if (authErr) {
      setError(authErr);
      setSigningIn(false);
      return;
    }
    if (signedUser) {
      router.push('/creator/dashboard');
    } else {
      setSigningIn(false);
    }
  };

  return (
    <main style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 30%, #ffe4e6 0%, #fafafa 100%)', padding: '24px' }}>
      <div
        style={{
          background: '#fff',
          maxWidth: '440px',
          width: '100%',
          padding: '36px',
          borderRadius: '24px',
          border: '1px solid #fecdd3',
          boxShadow: '0 12px 36px rgba(225,29,72,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👑</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
            Creator Club Portal
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Sign in to access your real-time analytics, coupon codes, referral links, and earnings.
          </p>
        </div>

        {error && (
          <div style={{ color: '#43332b', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* EMAIL & PASSWORD LOGIN FORM */}
        <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Creator Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. creator@gmail.com"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', outline: 'none', background: '#f9fafb' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', margin: 0 }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.92rem', outline: 'none', background: '#f9fafb' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={signingIn || loading}
            style={{
              width: '100%',
              background: '#e11d48',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: signingIn ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(225,29,72,0.22)',
              marginTop: '4px',
              transition: 'all 0.2s',
            }}
          >
            {signingIn ? 'Signing in...' : 'Sign In with Password 🔑'}
          </button>
        </form>

        {/* SECURITY NOTICE FOR FIRST TIME LOGIN */}
        <div style={{ background: '#fff1f2', border: '1px border-dashed #fda4af', borderRadius: '12px', padding: '10px 14px', fontSize: '0.8rem', color: '#a64036', lineHeight: 1.4, marginBottom: '20px', textAlign: 'left' }}>
          💡 <strong>First-Time Login Note:</strong> If you are signing in with a temporary password provided by your admin, please <Link href="/creator/change-password" style={{ color: '#9f1239', fontWeight: 800, textDecoration: 'underline' }}>change your password</Link> after your first login.
        </div>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={signingIn || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#fff',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: signingIn ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {signingIn ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f3f4f6', fontSize: '0.85rem', color: '#6b7280' }}>
          Not yet a member?{' '}
          <Link href="/creators" style={{ color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>
            Apply for Creator Club
          </Link>
        </div>
      </div>
    </main>
  );
}
