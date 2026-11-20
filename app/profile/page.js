'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/haptics';

export default function ProfilePage() {
  const { user, loading, login, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState('gifts'); // 'gifts' | 'account'
  const [copiedId, setCopiedId] = useState(null);

  // Instant cached render from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('cached_profile_notes');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setFetching(false);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    async function initProfile() {
      if (user) {
        // Start fetching user notes immediately
        fetchUserNotes();

        // Claim device notes silently in background without blocking UI
        const deviceId = localStorage.getItem('note_device_id');
        if (deviceId) {
          try {
            const token = await user.getIdToken();
            await fetch('/api/claim-notes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ deviceId })
            });
            // Re-sync after claiming
            fetchUserNotes();
          } catch (err) {
            console.error('Error claiming notes:', err);
          }
        }
      } else {
        // Fetch notes created on this device
        fetchDeviceNotes();
      }
    }

    initProfile();
  }, [user]);

  async function fetchUserNotes() {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'notes'),
        where('creator_uid', '==', user.uid)
      );

      const snap = await getDocs(q);
      const data = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));

      data.sort((a, b) => {
        const timeA = a.created_at?.toMillis() || 0;
        const timeB = b.created_at?.toMillis() || 0;
        return timeB - timeA;
      });

      setNotes(data);
      try { localStorage.setItem('cached_profile_notes', JSON.stringify(data)); } catch { }
    } catch (e) {
      console.warn('Query by Auth UID failed, falling back to local note IDs:', e?.message);
      await fetchDeviceNotes();
    } finally {
      setFetching(false);
    }
  }

  async function fetchDeviceNotes() {
    try {
      const storedIds = JSON.parse(localStorage.getItem('created_note_ids') || '[]');
      const deviceId = localStorage.getItem('note_device_id');

      const notesMap = new Map();

      // 1. Query by device ID if available
      if (deviceId) {
        try {
          const q = query(
            collection(db, 'notes'),
            where('creator_uid', '==', deviceId)
          );
          const snap = await getDocs(q);
          snap.forEach(d => notesMap.set(d.id, { id: d.id, ...d.data() }));
        } catch (err) {
          // Fallback handled by direct stored ID lookups
        }
      }

      // 2. Fetch missing stored IDs IN PARALLEL with Promise.all (lightning fast!)
      const missingIds = storedIds.filter(id => !notesMap.has(id));
      if (missingIds.length > 0) {
        const docSnaps = await Promise.all(
          missingIds.map(id => getDoc(doc(db, 'notes', id)).catch(() => null))
        );
        docSnaps.forEach(docSnap => {
          if (docSnap && docSnap.exists()) {
            notesMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
          }
        });
      }

      const data = Array.from(notesMap.values());
      data.sort((a, b) => {
        const timeA = a.created_at?.toMillis() || 0;
        const timeB = b.created_at?.toMillis() || 0;
        return timeB - timeA;
      });

      setNotes(data);
      try { localStorage.setItem('cached_profile_notes', JSON.stringify(data)); } catch { }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  }

  const copyShareLink = async (noteItem) => {
    try {
      const slug = noteItem.custom_slug || noteItem.id;
      const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `/p/${slug}`;
      await navigator.clipboard.writeText(shareUrl);
      triggerHaptic('success');
      setCopiedId(noteItem.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      triggerHaptic('warning');
    }
  };

  const quickWhatsAppShare = (noteItem) => {
    triggerHaptic('light');
    const slug = noteItem.custom_slug || noteItem.id;
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `/p/${slug}`;
    const name = noteItem.recipient_name || 'Someone special';
    const text = `Hey ${name}! 🎁 Open your surprise here: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading || claiming) {
    return (
      <main className="center-screen">
        <div className="spinner" />
        <p className="text-muted">Loading your notes & reactions…</p>
      </main>
    );
  }

  return (
    <main className="shell lc-page-shell" style={{ padding: '2rem 1rem 5rem' }}>
      <div className="bg-glow bg-glow--top" aria-hidden="true" />

      <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Profile Header Card */}
        <section
          className="hero-section hero-enhanced mb-6"
          style={{
            borderRadius: '24px',
            padding: '1.75rem 1.5rem',
            textAlign: 'left',
          }}
        >
          <div className="hero-glow-orb" aria-hidden="true" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                className="testimonial-avatar-monogram"
                style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}
              >
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {user?.displayName ? `Hello, ${user.displayName}` : 'Your Moments & Notes'}
                  </h1>
                  {user && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                      ✓ Synced
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '4px 0 0' }}>
                  {user?.email || 'Track recipient views, replies, and manage your moments.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href="/templates"
                className="btn-primary"
                style={{
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  boxShadow: '0 4px 14px rgba(244,63,94,0.3)',
                  touchAction: 'manipulation',
                }}
              >
                + Craft a Surprise
              </Link>
              {user ? (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    triggerHaptic('light');
                    logout();
                  }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    background: '#ffffff',
                    touchAction: 'manipulation',
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    triggerHaptic('light');
                    login();
                  }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    touchAction: 'manipulation',
                  }}
                >
                  <span>🔑</span> Sign in to Sync
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Mobile Segmented Control ('My Gifts' / 'Account Settings') ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div
            role="tablist"
            aria-label="Profile navigation tabs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px',
              background: '#f1e8dc',
              borderRadius: '999px',
              border: '1px solid #eadfd2',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'gifts'}
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('gifts');
              }}
              style={{
                flex: 1,
                minHeight: '42px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'gifts' ? '#ffffff' : 'transparent',
                color: activeTab === 'gifts' ? '#0f172a' : '#78695f',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'gifts' ? 800 : 600,
                cursor: 'pointer',
                boxShadow: activeTab === 'gifts' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation',
              }}
            >
              🎁 My Gifts ({notes.length})
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'account'}
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('account');
              }}
              style={{
                flex: 1,
                minHeight: '42px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                background: activeTab === 'account' ? '#ffffff' : 'transparent',
                color: activeTab === 'account' ? '#0f172a' : '#78695f',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'account' ? 800 : 600,
                cursor: 'pointer',
                boxShadow: activeTab === 'account' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation',
              }}
            >
              ⚙️ Account Settings
            </button>
          </div>
        </div>

        {/* ── Tab Content: Account Settings ── */}
        {activeTab === 'account' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2rem 1.5rem',
              border: '1.5px solid #eadfd2',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem' }}>
              Account &amp; Sync Preferences
            </h2>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      Google Account Connected
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Signed in as <strong>{user.email}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Multi-Device Cloud Sync</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Your created gifts are backed up to your account.</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '999px' }}>
                    Active
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    logout();
                  }}
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    borderRadius: '14px',
                    border: '1.5px solid #fecdd3',
                    background: '#fff1f2',
                    color: '#e11d48',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    touchAction: 'manipulation',
                  }}
                >
                  Sign Out of Google
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #fffdfa 0%, #faf5ef 100%)',
                  border: '1.5px solid #eadfd2',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3f3029', margin: '0 0 0.5rem' }}>
                  Sync Your Gifts Across Devices
                </h3>
                <p style={{ color: '#78695f', fontSize: '0.86rem', lineHeight: 1.5, maxWidth: '380px', margin: '0 auto 1.25rem' }}>
                  Sign in with your Google account to ensure your created gifts, receipts, and recipient reactions never disappear when clearing browser cache.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    login();
                  }}
                  style={{
                    minHeight: '50px',
                    width: '100%',
                    maxWidth: '320px',
                    margin: '0 auto',
                    borderRadius: '16px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                    touchAction: 'manipulation',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab Content: My Gifts ── */}
        {activeTab === 'gifts' && (
          <>
            {fetching ? (
              <div className="center-screen" style={{ minHeight: '35vh' }}>
                <div className="spinner" />
              </div>
            ) : notes.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  border: '1.5px dashed #fecdd3',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ fontSize: '3.2rem', marginBottom: '0.75rem' }}>💌 ✨</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No surprises created yet</h3>
                <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                  {user
                    ? "You haven't crafted any surprise links yet with this account. Choose a template to get started!"
                    : "Create an interactive digital surprise to track views and recipient reactions here."}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/templates"
                    className="btn-primary"
                    style={{
                      padding: '0.8rem 2rem',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                      touchAction: 'manipulation',
                    }}
                  >
                    ✨ Choose an Experience &amp; Start
                  </Link>
                </div>
              </div>
            ) : (
              <div className="notes-grid">
                {notes.map(note => {
                  const shareSlug = note.custom_slug || note.id;

                  return (
                    <div key={note.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                      {/* Reaction glow if replied */}
                      {note.recipient_reaction && (
                        <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(244,63,94,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, margin: 0 }}>
                          To: {note.recipient_name}
                        </h3>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          background: note.is_paid ? '#dcfce7' : '#f1f5f9',
                          color: note.is_paid ? '#166534' : '#64748b',
                          border: '1.5px solid ' + (note.is_paid ? '#166534' : '#94a3b8'),
                          marginLeft: '0.5rem',
                          flexShrink: 0,
                        }}>
                          {note.is_paid ? 'PAID & UNLOCKED' : 'DRAFT'}
                        </span>
                      </div>

                      {/* View Counter Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: note.view_count > 0 ? '#15803d' : '#64748b',
                          background: note.view_count > 0 ? '#f0fdf4' : '#f8fafc',
                          border: '1px solid ' + (note.view_count > 0 ? '#bbf7d0' : '#e2e8f0'),
                          padding: '3px 10px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <span>👀</span>
                          <span>{note.view_count || 0} View{note.view_count === 1 ? '' : 's'}</span>
                        </span>
                        {note.template && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                            • {note.template.replace(/-/g, ' ')}
                          </span>
                        )}
                      </div>

                      {/* Reaction & View tracker */}
                      {note.is_paid && (
                        <div style={{
                          borderRadius: '12px',
                          marginBottom: '1rem',
                          overflow: 'hidden',
                          border: note.recipient_reaction ? '1px solid rgba(244,63,94,0.3)' : '1px solid #e5e7eb',
                        }}>
                          {note.recipient_reaction ? (
                            /* ── Has replied ── */
                            <div style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <span style={{ fontSize: '2rem', lineHeight: 1, flexShrink: 0 }}>{note.recipient_reaction.emoji}</span>
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                                  💌 {note.recipient_name} replied
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                                  {note.recipient_reaction.label}
                                </div>
                                {note.recipient_reaction.message && (
                                  <div style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginTop: '3px', lineHeight: 1.4 }}>
                                    &ldquo;{note.recipient_reaction.message}&rdquo;
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* ── No reply yet ── */
                            <div style={{ background: '#f8fafc', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: note.view_count > 0 ? '#22c55e' : '#cbd5e1',
                                boxShadow: note.view_count > 0 ? '0 0 6px #22c55e' : 'none',
                              }} />
                              <span style={{ fontSize: '12px', fontWeight: 700, color: note.view_count > 0 ? '#15803d' : '#94a3b8' }}>
                                {note.view_count > 0
                                  ? `👀 Opened ${note.view_count} time${note.view_count > 1 ? 's' : ''} · Waiting for reply…`
                                  : 'Not opened yet'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {note.custom_message}
                      </p>

                      {/* Quick Share Action Row */}
                      {note.is_paid && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                          <button
                            type="button"
                            onClick={() => quickWhatsAppShare(note)}
                            style={{
                              minHeight: '40px',
                              padding: '6px 10px',
                              borderRadius: '10px',
                              border: '1px solid #c7e8cc',
                              background: '#f0fdf4',
                              color: '#166534',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              touchAction: 'manipulation',
                            }}
                          >
                            <span>💬</span>
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => copyShareLink(note)}
                            style={{
                              minHeight: '40px',
                              padding: '6px 10px',
                              borderRadius: '10px',
                              border: '1px solid #e2e8f0',
                              background: copiedId === note.id ? '#ecfdf5' : '#ffffff',
                              color: copiedId === note.id ? '#059669' : '#334155',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              touchAction: 'manipulation',
                            }}
                          >
                            <span>{copiedId === note.id ? '✓' : '🔗'}</span>
                            <span>{copiedId === note.id ? 'Copied' : 'Copy Link'}</span>
                          </button>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Link
                          href={note.is_paid ? `/success?id=${note.id}` : `/preview?id=${note.id}`}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            padding: '0.55rem',
                            background: note.is_paid ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #a64036, #a64036)',
                            borderRadius: '12px',
                            touchAction: 'manipulation',
                          }}
                        >
                          {note.is_paid ? '🎁 Share Hub' : 'Finish & Pay'}
                        </Link>
                        <Link
                          href={`/p/${shareSlug}`}
                          target="_blank"
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            padding: '0.55rem',
                            borderRadius: '12px',
                            background: '#ffffff',
                            touchAction: 'manipulation',
                          }}
                        >
                          👁️ View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}


        {/* ── Couple Arcade & High Score Dashboard ── */}
        <div style={{
          marginTop: '3.5rem',
          background: 'linear-gradient(135deg, #ffffff, #fff1f2)',
          borderRadius: '24px',
          border: '1.5px solid #fecdd3',
          padding: '2rem 1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                🎮 COUPLE &amp; BESTIE ARCADE
              </span>
              <h2 style={{ fontSize: '1.5rem', color: '#1f2937', fontWeight: 800, margin: '4px 0 0' }}>
                Your Mini-Game High Scores &amp; Duels
              </h2>
            </div>
            <Link
              href="/arcade"
              className="btn-primary"
              style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
            >
              🎮 Open Full Arcade ➔
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#fff5f8', padding: '1.25rem', borderRadius: '18px', border: '1px solid #fbcfe8', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.25rem' }}>💖⚡</span>
              <h3 style={{ fontSize: '1rem', color: '#881337', fontWeight: 800, margin: 0 }}>Heart Rush</h3>
              <p style={{ fontSize: '0.8rem', color: '#9f1239', margin: '4px 0 10px' }}>30s Falling Sparks Catcher</p>
              <Link href="/arcade/heart-rush" className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'inline-block' }}>
                Play &amp; Challenge
              </Link>
            </div>

            <div style={{ background: '#f5f3ff', padding: '1.25rem', borderRadius: '18px', border: '1px solid #ddd6fe', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.25rem' }}>🧩🃏</span>
              <h3 style={{ fontSize: '1rem', color: '#4c1d95', fontWeight: 800, margin: 0 }}>Memory Match</h3>
              <p style={{ fontSize: '0.8rem', color: '#6d28d9', margin: '4px 0 10px' }}>Emoji Card Flip Match</p>
              <Link href="/arcade/memory-match" className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'inline-block' }}>
                Play &amp; Challenge
              </Link>
            </div>

            <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '18px', border: '1px solid #fde68a', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.25rem' }}>⚡🫂</span>
              <h3 style={{ fontSize: '1rem', color: '#78350f', fontWeight: 800, margin: 0 }}>10s Hug Frenzy</h3>
              <p style={{ fontSize: '0.8rem', color: '#92400e', margin: '4px 0 10px' }}>Speed Tap Adrenaline</p>
              <Link href="/arcade/speed-tap" className="btn-secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'inline-block' }}>
                Play &amp; Challenge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
