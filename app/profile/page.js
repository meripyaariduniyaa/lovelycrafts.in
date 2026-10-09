'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, login, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [claiming, setClaiming] = useState(false);

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

  if (loading || claiming) {
    return (
      <main className="center-screen">
        <div className="spinner" />
        <p className="text-muted">Loading your notes & reactions…</p>
      </main>
    );
  }

  return (
    <main className="shell" style={{ padding: '2rem 1rem 5rem' }}>
      <div className="bg-glow bg-glow--top" aria-hidden="true" />

      <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Profile Header Card */}
        <section
          className="hero-section hero-enhanced mb-8"
          style={{
            borderRadius: '24px',
            padding: '2rem 2rem',
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
                }}
              >
                + Craft a Surprise
              </Link>
              {user ? (
                <button
                  className="btn-secondary"
                  onClick={logout}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    background: '#ffffff',
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={login}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🔑</span> Sign in to Sync
                </button>
              )}
            </div>
          </div>
        </section>

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
                }}
              >
                ✨ Choose an Experience &amp; Start
              </Link>
            </div>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => {
              const shareSlug = note.id;
              const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${shareSlug}` : '';

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

                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {note.custom_message}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link
                      href={note.is_paid ? `/success?id=${note.id}` : `/preview?id=${note.id}`}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        padding: '0.55rem',
                        background: note.is_paid ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #f43f5e, #be185d)',
                        borderRadius: '12px',
                      }}
                    >
                      {note.is_paid ? '🎁 Share Hub & Downloads' : 'Finish & Pay'}
                    </Link>
                    <Link
                      href={`/p/${shareSlug}`}
                      target="_blank"
                      className="btn-secondary"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        padding: '0.55rem',
                        borderRadius: '12px',
                        background: '#ffffff',
                      }}
                    >
                      👁️ View Experience
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
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
