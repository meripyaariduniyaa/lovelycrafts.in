'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Redirect bridge: lovelycrafts.in/business/activate?token=...
 * → business.lovelycrafts.in/activate?token=...
 *
 * This handles any invitation emails sent before the migration.
 */
function ActivationRedirect() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const dest = `https://business.lovelycrafts.in/activate${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.location.replace(dest);
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#f8fafc',
      textAlign: 'center',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔀</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Redirecting to Business Portal</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Taking you to business.lovelycrafts.in...</p>
        <p style={{ marginTop: '16px' }}>
          <a href={`https://business.lovelycrafts.in/activate${token ? `?token=${encodeURIComponent(token)}` : ''}`}
            style={{ color: '#f43f5e', fontSize: '0.85rem' }}>
            Click here if you are not redirected automatically →
          </a>
        </p>
      </div>
    </div>
  );
}

export default function BusinessActivateRedirectPage() {
  return (
    <Suspense>
      <ActivationRedirect />
    </Suspense>
  );
}
