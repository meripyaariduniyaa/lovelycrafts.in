'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates } from '@/lib/templates';

export default function PreviewPage() {
  return <Suspense fallback={<div className="gift-preview-state">Preparing your preview…</div>}><PreviewContent /></Suspense>;
}

function PreviewContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get('id');
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

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
  if (loading) return <div className="gift-preview-state"><span className="preview-spinner" />Preparing your private preview…</div>;
  if (!id || !note) return (
    <main className="gift-preview-state">
      <div className="preview-state-icon">💌</div><h1>Preview not found</h1>
      <p>This gift may have expired, or its preview link is incorrect.</p><Link href="/create">Create a new gift</Link>
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
        <section className="device-frame" aria-label={`Gift preview${note.recipient_name ? ` for ${note.recipient_name}` : ''}`}>
          <div className="device-speaker" aria-hidden="true" />
          <div className="device-screen device-screen-scroll"><TemplateRenderer note={note} isPreview /></div>
        </section>
        <aside className="preview-actions">
          <span className="preview-summary-label">YOUR GIFT</span>
          <div className="preview-template-icon">{template?.emoji || '🎁'}</div>
          <h2>{template?.title || 'A LovelyCrafts gift'}</h2>
          <p>Made for <strong>{note.recipient_name || 'someone special'}</strong></p>
          <div className="preview-divider" />
          <ul>
            <li>Personalized with your names and message</li>
            <li>Private until you share the gift link</li>
            <li>Unlock sharing after secure checkout</li>
          </ul>
          <Link className="preview-checkout-button" href={`/checkout?id=${encodeURIComponent(id)}`}>Continue to checkout <span>→</span></Link>
          <Link className="preview-edit-link" href={`/create?template=${encodeURIComponent(note.template || 'proposal')}&noteId=${encodeURIComponent(id)}`}>← Edit this gift</Link>
        </aside>
      </div>
      <style jsx>{`
        .gift-preview-page { max-width:1100px; margin:0 auto; padding:clamp(1.75rem,4vw,3rem) 1.25rem 4rem; color:#43332b; }
        .preview-heading { text-align:center; margin:0 auto 2rem; }
        .preview-kicker,.preview-summary-label { color:#9d382f; font-size:.7rem; font-weight:800; letter-spacing:.14em; }
        .preview-heading h1 { margin:.5rem 0; color:#3f3029; font:500 clamp(2rem,5vw,3rem)/1.15 var(--font-playfair),Georgia,serif; }
        .preview-heading p { margin:0; color:#78695f; }
        .preview-layout { display:grid; grid-template-columns:minmax(280px, 1fr) minmax(280px, .8fr); align-items:center; justify-items:center; gap:clamp(1.5rem,5vw,4rem); }
        .device-frame { position:relative; width:min(100%,360px); height:clamp(590px,72vh,740px); padding:12px; border:2px solid #cbb9a9; border-radius:42px; background:#e7dbce; box-shadow:0 24px 60px rgba(74,48,32,.16),inset 0 0 0 2px #fff8f0; }
        .device-speaker { position:absolute; z-index:2; top:18px; left:50%; width:88px; height:18px; transform:translateX(-50%); border-radius:999px; background:#342c29; }
        .device-screen { width:100%; height:100%; overflow:hidden; border-radius:31px; background:#fffdf9; }
        .preview-actions { width:100%; max-width:390px; padding:clamp(1.4rem,4vw,2rem); border:1px solid #eadfd2; border-radius:25px; background:#fffdf9; box-shadow:0 16px 42px rgba(91,58,39,.07); }
        .preview-template-icon { width:58px; height:58px; display:grid; place-items:center; margin:1rem 0 .8rem; border-radius:18px 18px 18px 4px; background:#f7e9df; font-size:1.8rem; }
        .preview-actions h2 { margin:0; color:#3f3029; font:500 1.8rem var(--font-playfair),Georgia,serif; }
        .preview-actions p { margin:.6rem 0; color:#746258; }.preview-actions p strong { color:#43332b; }
        .preview-divider { margin:1.2rem 0; border-top:1px dashed #dfd0c3; }
        .preview-actions ul { display:grid; gap:.8rem; margin:0 0 1.5rem; padding:0; list-style:none; color:#67564b; font-size:.9rem; }
        .preview-actions li::before { content:'✓'; margin-right:.65rem; color:#438257; font-weight:800; }
        .preview-checkout-button { min-height:54px; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:.8rem 1.1rem; border-radius:15px; background:#a64036; color:#fffaf5; font-weight:800; }
        .preview-checkout-button:hover { background:#8f342e; }.preview-checkout-button span { font-size:1.2rem; }
        .preview-edit-link { display:block; margin-top:1rem; text-align:center; color:#8e4437; font-size:.87rem; font-weight:700; }
        .gift-preview-state { min-height:58vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:2rem; color:#43332b; text-align:center; }
        .gift-preview-state p { color:#78695f; }.gift-preview-state a { color:#963b35; font-weight:700; }.preview-state-icon { font-size:2.5rem; }
        .preview-spinner { width:34px; height:34px; border:3px solid #eadfd2; border-top-color:#a64036; border-radius:50%; animation:preview-spin .8s linear infinite; }
        @keyframes preview-spin { to { transform:rotate(360deg); } }
        @media(max-width:760px) { .preview-layout { grid-template-columns:1fr; }.device-frame { height:min(74vh,690px); }.preview-actions { max-width:460px; } }
        @media(prefers-reduced-motion:reduce) { .preview-spinner { animation-duration:2s; } }
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
