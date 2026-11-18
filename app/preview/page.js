'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates } from '@/lib/templates';
import HeartLoader from '@/components/HeartLoader';

export default function PreviewPage() {
  return (
    <Suspense fallback={<HeartLoader message="Preparing your private preview…" />}>
      <PreviewContent />
    </Suspense>
  );
}

function PreviewContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    return onSnapshot(doc(db, 'notes', id), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.is_paid) {
          router.replace(`/success?id=${encodeURIComponent(id)}`);
          return;
        }
        setNote({ id: snapshot.id, ...data });
      }
      setLoading(false);
    }, () => setLoading(false));
  }, [id, router]);

  const template = templates.find((item) => item.id === note?.template);
  if (loading) return <HeartLoader message="Preparing your private preview…" />;

  if (!id || !note) return (
    <main className="gift-preview-state">
      <div className="preview-state-icon">💌</div>
      <h1>Preview not found</h1>
      <p>This gift may have expired, or its preview link is incorrect.</p>
      <Link href="/create">Create a new gift</Link>
      <style jsx>{`
        .gift-preview-state { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:2rem; color:#43332b; text-align:center; }
        .gift-preview-state p { color:#78695f; }
        .gift-preview-state a { display:inline-block; margin-top:0.75rem; padding:10px 22px; border-radius:50px; background:#a64036; color:#fff; font-weight:700; text-decoration:none; }
        .preview-state-icon { font-size:2.5rem; }
      `}</style>
    </main>
  );

  return (
    <main className="gift-preview-page">
      <div className="preview-heading">
        <span className="preview-kicker">STEP 2 · PREVIEW</span>
        <h1>See your gift before checkout</h1>
        <p>Review the experience as your recipient will see it. You can still go back and edit.</p>
      </div>

      <div className="preview-layout">
        <section className="device-column" aria-label={`Gift preview${note.recipient_name ? ` for ${note.recipient_name}` : ''}`}>
          <div className="device-header-controls">
            <span className="device-view-pill">📱 Mobile Preview</span>
            <button
              type="button"
              onClick={() => setIsFullScreen(true)}
              className="fullscreen-toggle-btn"
              title="Test in full screen"
            >
              <span>⛶</span> Full Screen Test
            </button>
          </div>

          <div className="device-frame">
            <div className="device-speaker" aria-hidden="true" />
            <div className="device-screen device-screen-scroll">
              <TemplateRenderer note={note} isPreview />
            </div>
          </div>
        </section>

        <aside className="preview-actions">
          <span className="preview-summary-label">YOUR GIFT</span>
          <div className="preview-template-icon">{template?.emoji || '🎁'}</div>
          <h2>{template?.title || 'A LovelyCrafts gift'}</h2>
          <p className="recipient-line">Made for <strong>{note.recipient_name || 'someone special'}</strong></p>
          <div className="preview-divider" />
          <ul>
            <li>Personalized with your names, letter and memories</li>
            <li>60fps canvas particles, animations &amp; ambient sound FX</li>
            <li>100% private until you share the gift link</li>
            <li>Interactive recipient reaction box &amp; live dashboard</li>
          </ul>
          <Link className="preview-checkout-button" href={`/checkout?id=${encodeURIComponent(id)}`}>
            <span>Continue to checkout</span>
            <span>→</span>
          </Link>
          <Link className="preview-edit-link" href={`/create?template=${encodeURIComponent(note.template || 'proposal')}&noteId=${encodeURIComponent(id)}`}>
            ← Edit this gift
          </Link>
        </aside>
      </div>

      {/* Fullscreen Interactive Modal */}
      {isFullScreen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-topbar">
            <div className="fullscreen-info">
              <span>{template?.emoji || '🎁'}</span>
              <span>Testing: <strong>{template?.title}</strong> for {note.recipient_name || 'someone special'}</span>
            </div>
            <div className="fullscreen-actions">
              <Link href={`/checkout?id=${encodeURIComponent(id)}`} className="fullscreen-checkout-btn">
                Continue to Checkout →
              </Link>
              <button type="button" onClick={() => setIsFullScreen(false)} className="fullscreen-close-btn">
                ✕ Close
              </button>
            </div>
          </div>
          <div className="fullscreen-canvas-area">
            <TemplateRenderer note={note} isPreview={false} />
          </div>
        </div>
      )}

      <style jsx>{`
        .gift-preview-page { max-width:1120px; margin:0 auto; padding:clamp(1.75rem,4vw,3rem) 1.25rem 4rem; color:#43332b; }
        .preview-heading { text-align:center; margin:0 auto 2.2rem; }
        .preview-kicker,.preview-summary-label { color:#9d382f; font-size:.72rem; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
        .preview-heading h1 { margin:.5rem 0 .35rem; color:#3f3029; font:500 clamp(2rem,5vw,2.9rem)/1.15 var(--font-playfair),Georgia,serif; }
        .preview-heading p { margin:0; color:#78695f; font-size:.95rem; }
        .preview-layout { display:grid; grid-template-columns:minmax(280px, 1fr) minmax(280px, 400px); align-items:start; justify-items:center; gap:clamp(1.5rem,5vw,4rem); }
        .device-column { display:flex; flex-direction:column; align-items:center; gap:10px; width:100%; max-width:360px; }
        .device-header-controls { display:flex; align-items:center; justify-content:space-between; width:100%; padding:0 6px; font-size:0.78rem; font-weight:700; color:#746258; }
        .device-view-pill { opacity:0.85; }
        .fullscreen-toggle-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:50px; background:#ffffff; border:1px solid #dccbbd; color:#882f25; font-size:0.75rem; font-weight:700; cursor:pointer; box-shadow:0 1px 4px rgba(0,0,0,0.04); transition:all .2s; }
        .fullscreen-toggle-btn:hover { background:#fdf7f3; border-color:#882f25; }
        .device-frame { position:relative; width:min(100%,360px); height:clamp(590px,72vh,740px); padding:12px; border:2px solid #cbb9a9; border-radius:42px; background:#e7dbce; box-shadow:0 24px 60px rgba(74,48,32,.16),inset 0 0 0 2px #fff8f0; }
        .device-speaker { position:absolute; z-index:2; top:18px; left:50%; width:88px; height:18px; transform:translateX(-50%); border-radius:999px; background:#342c29; }
        .device-screen { width:100%; height:100%; overflow:hidden; border-radius:31px; background:#fffdf9; }
        .preview-actions { width:100%; max-width:400px; padding:clamp(1.4rem,4vw,2.2rem); border:1px solid #eadfd2; border-radius:26px; background:#fffdf9; box-shadow:0 16px 42px rgba(91,58,39,.07); }
        .preview-template-icon { width:58px; height:58px; display:grid; place-items:center; margin:1rem 0 .8rem; border-radius:18px 18px 18px 4px; background:#f7e9df; font-size:1.8rem; }
        .preview-actions h2 { margin:0; color:#3f3029; font:500 1.8rem var(--font-playfair),Georgia,serif; }
        .recipient-line { margin:.6rem 0; color:#746258; font-size:.92rem; }
        .recipient-line strong { color:#43332b; }
        .preview-divider { margin:1.2rem 0; border-top:1px dashed #dfd0c3; }
        .preview-actions ul { display:grid; gap:.85rem; margin:0 0 1.6rem; padding:0; list-style:none; color:#67564b; font-size:.88rem; line-height:1.45; }
        .preview-actions li { position:relative; padding-left:1.5rem; }
        .preview-actions li::before { content:'✓'; position:absolute; left:0; top:0; color:#438257; font-weight:900; }
        .preview-checkout-button { min-height:54px; width:100%; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:.85rem 1.3rem; border-radius:15px; background:#a64036; color:#fffaf5; font-weight:800; font-size:1rem; text-decoration:none; box-shadow:0 4px 14px rgba(166,64,54,0.25); transition:all .2s; }
        .preview-checkout-button:hover { background:#8f342e; transform:translateY(-1px); }
        .preview-checkout-button span:last-child { font-size:1.2rem; }
        .preview-edit-link { display:block; margin-top:1.1rem; text-align:center; color:#8e4437; font-size:.87rem; font-weight:700; text-decoration:none; }
        .preview-edit-link:hover { text-decoration:underline; }

        /* Fullscreen modal styles */
        .fullscreen-overlay { position:fixed; inset:0; z-index:9999; background:#000; display:flex; flex-direction:column; }
        .fullscreen-topbar { background:rgba(25,20,18,0.92); backdrop-filter:blur(16px); padding:10px 18px; display:flex; align-items:center; justify-content:space-between; color:#fff; border-bottom:1px solid rgba(255,255,255,0.1); font-size:0.88rem; }
        .fullscreen-info { display:flex; align-items:center; gap:8px; }
        .fullscreen-actions { display:flex; align-items:center; gap:10px; }
        .fullscreen-checkout-btn { background:#a64036; color:#fff; padding:6px 16px; border-radius:50px; font-weight:700; font-size:0.8rem; text-decoration:none; }
        .fullscreen-close-btn { background:rgba(255,255,255,0.15); border:0; color:#fff; padding:6px 12px; border-radius:50px; font-size:0.8rem; font-weight:700; cursor:pointer; }
        .fullscreen-canvas-area { flex:1; width:100%; height:100%; overflow-y:auto; }

        @media(max-width:760px) { .preview-layout { grid-template-columns:1fr; } .device-frame { height:min(74vh,690px); } .preview-actions { max-width:460px; } }
      `}</style>
      <style jsx global>{`
        .device-screen-scroll { width:100% !important; height:100% !important; overflow:hidden !important; position:relative !important; display:flex !important; flex-direction:column !important; }
        .device-screen-scroll .experience-wrapper,.device-screen-scroll .is-preview-mockup { width:100% !important; height:100% !important; min-height:100% !important; max-height:100% !important; position:relative !important; overflow:hidden !important; display:flex !important; flex-direction:column !important; flex:1 1 100% !important; }
        .device-screen-scroll .experience-wrapper > div,.device-screen-scroll .is-preview-mockup > div { width:100% !important; height:100% !important; min-height:100% !important; max-height:100% !important; position:relative !important; overflow:hidden !important; display:flex !important; flex-direction:column !important; }
        .device-screen-scroll [style*="100vh"],.device-screen-scroll [style*="110vh"],.device-screen-scroll [style*="min-height: 100vh"],.device-screen-scroll [style*="min-height:100vh"],.device-screen-scroll [style*="height: 100vh"],.device-screen-scroll [style*="height:100vh"] { min-height:100% !important; height:100% !important; max-height:100% !important; overflow:hidden !important; box-sizing:border-box !important; }
        .device-screen-scroll [style*="margin-bottom: 2.5rem"],.device-screen-scroll [style*="marginBottom: 2.5rem"],.device-screen-scroll [style*="margin-bottom:2.5rem"] { margin-bottom:1.25rem !important; }
        .device-screen-scroll [style*="margin-bottom: 3rem"],.device-screen-scroll [style*="marginBottom: 3rem"],.device-screen-scroll [style*="margin-bottom:3rem"] { margin-bottom:1.5rem !important; }
        .device-screen-scroll [style*="padding: 2rem 1rem"],.device-screen-scroll [style*="padding: 2rem"] { padding:1.25rem 1rem !important; }
      `}</style>
    </main>
  );
}
