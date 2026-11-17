'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates } from '@/lib/templates';
import JourneyStepper from '@/components/JourneyStepper';

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="gift-preview-state"><span className="preview-spinner" />Preparing your private preview…</div>}>
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

  if (loading) return (
    <div className="gift-preview-state">
      <span className="preview-spinner" />
      <p className="mt-2 text-stone-600 font-medium">Opening your private preview…</p>
    </div>
  );

  if (!id || !note) return (
    <main className="gift-preview-state">
      <div className="preview-state-icon">💌</div>
      <h1 className="text-xl font-bold text-stone-800">Preview not found</h1>
      <p className="text-stone-600 max-w-sm text-sm">This gift may have expired, or its preview link is incorrect.</p>
      <Link href="/create" className="mt-4 px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold text-sm shadow-xs hover:bg-rose-700 transition">
        Create a new gift
      </Link>
    </main>
  );

  return (
    <div className="min-h-screen bg-[#faf6f0] text-stone-800">
      <JourneyStepper currentStep={2} noteId={id} templateId={note.template} />

      <main className="gift-preview-page">
        <div className="preview-heading">
          <span className="preview-kicker">STEP 2 OF 4 · INTERACTIVE PREVIEW</span>
          <h1>Experience Your Keepsake</h1>
          <p>This is how your recipient will see and feel your gift. Interact with it below before unlocking sharing.</p>
        </div>

        <div className="preview-layout">
          {/* Device Mockup Section with Fullscreen Toggle */}
          <section className="device-container" aria-label={`Gift preview for ${note.recipient_name || 'someone special'}`}>
            <div className="device-controls">
              <span className="text-xs font-semibold text-stone-600">📱 Mobile View</span>
              <button
                type="button"
                onClick={() => setIsFullScreen(true)}
                className="fullscreen-btn"
                title="Open full screen test mode"
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

          {/* Action Card */}
          <aside className="preview-actions">
            <div className="flex items-center justify-between">
              <span className="preview-summary-label">YOUR KEEPSAKE</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                Draft Ready
              </span>
            </div>

            <div className="preview-template-header">
              <div className="preview-template-icon">{template?.emoji || '🎁'}</div>
              <div>
                <h2>{template?.title || 'LovelyCrafts Gift'}</h2>
                <p className="text-xs text-stone-500 font-medium">
                  Crafted for <strong className="text-stone-800">{note.recipient_name || 'someone special'}</strong>
                </p>
              </div>
            </div>

            <div className="preview-divider" />

            <div className="space-y-2.5 mb-6 text-sm text-stone-600">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>60fps Canvas Physics</strong>: Interactive animations & sound FX</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Private Link</strong>: 100% private link with optional wax seal lock</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Emotional Responses</strong>: Live recipient reaction box & dashboard</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Keepsake Poster</strong>: Branded high-resolution QR poster download</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                className="preview-checkout-button"
                href={`/checkout?id=${encodeURIComponent(id)}`}
              >
                <span>Continue to Checkout</span>
                <span className="text-lg">→</span>
              </Link>

              <Link
                className="preview-edit-link"
                href={`/create?template=${encodeURIComponent(note.template || 'proposal')}&noteId=${encodeURIComponent(id)}`}
              >
                ← Edit Gift Details
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Fullscreen Modal View */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="bg-stone-900/90 backdrop-blur-md px-4 py-3 flex items-center justify-between text-white border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span>{template?.emoji || '🎁'}</span>
              <span className="text-sm font-semibold">Testing: {template?.title} for {note.recipient_name || 'someone special'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/checkout?id=${encodeURIComponent(id)}`}
                className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs hover:bg-rose-700 transition"
              >
                Proceed to Checkout →
              </Link>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="px-3 py-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white font-bold text-xs"
              >
                ✕ Close Full Screen
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full overflow-y-auto">
            <TemplateRenderer note={note} isPreview={false} />
          </div>
        </div>
      )}

      <style jsx>{`
        .gift-preview-page { max-width:1140px; margin:0 auto; padding:2rem 1.25rem 4rem; }
        .preview-heading { text-align:center; margin:0 auto 2.5rem; }
        .preview-kicker { color:#9d382f; font-size:.72rem; font-weight:800; letter-spacing:.14em; text-transform:uppercase; display:block; margin-bottom:.5rem; }
        .preview-heading h1 { margin:.25rem 0 .5rem; color:#2c1e19; font:700 clamp(1.8rem,4vw,2.5rem)/1.2 var(--font-playfair),Georgia,serif; }
        .preview-heading p { margin:0 auto; color:#6b5a50; max-width:540px; font-size:.95rem; }
        .preview-layout { display:grid; grid-template-columns:minmax(280px, 1fr) minmax(300px, 420px); align-items:start; justify-items:center; gap:clamp(1.5rem,4vw,3.5rem); }
        .device-container { display:flex; flex-direction:column; align-items:center; gap:10px; width:100%; max-width:380px; }
        .device-controls { display:flex; align-items:center; justify-content:space-between; width:100%; padding:0 8px; }
        .fullscreen-btn { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:#882f25; background:rgba(255,255,255,0.8); border:1px solid #dfd0c3; border-radius:999px; padding:4px 12px; cursor:pointer; transition:all 0.2s; }
        .fullscreen-btn:hover { background:#fff; border-color:#882f25; }
        .device-frame { position:relative; width:min(100%,360px); height:clamp(590px,72vh,720px); padding:12px; border:3px solid #d4c5b7; border-radius:44px; background:#e9ded3; box-shadow:0 24px 60px rgba(74,48,32,.14),inset 0 0 0 2px #fff8f0; }
        .device-speaker { position:absolute; z-index:2; top:18px; left:50%; width:88px; height:18px; transform:translateX(-50%); border-radius:999px; background:#342c29; }
        .device-screen { width:100%; height:100%; overflow:hidden; border-radius:32px; background:#fffdf9; }
        .preview-actions { width:100%; max-width:420px; padding:clamp(1.5rem,4vw,2.2rem); border:1px solid #ebdcd0; border-radius:28px; background:#ffffff; box-shadow:0 16px 42px rgba(91,58,39,.06); }
        .preview-summary-label { color:#8e2f26; font-size:.7rem; font-weight:800; letter-spacing:.12em; }
        .preview-template-header { display:flex; align-items:center; gap:14px; margin:1rem 0 .5rem; }
        .preview-template-icon { width:52px; height:52px; display:grid; place-items:center; border-radius:16px; background:#faece4; font-size:1.7rem; flex-shrink:0; }
        .preview-actions h2 { margin:0; color:#2c1e19; font:700 1.5rem var(--font-playfair),Georgia,serif; }
        .preview-divider { margin:1.2rem 0; border-top:1px dashed #e6d8cb; }
        .preview-checkout-button { min-height:52px; width:100%; display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:.85rem 1.4rem; border-radius:16px; background:#a83d46; color:#ffffff; font-weight:800; font-size:1rem; text-decoration:none; box-shadow:0 4px 14px rgba(168,61,70,.25); transition:all .2s; }
        .preview-checkout-button:hover { background:#8d303a; transform:translateY(-1px); }
        .preview-edit-link { display:block; text-align:center; color:#78695f; font-size:.86rem; font-weight:700; text-decoration:none; padding:6px 0; }
        .preview-edit-link:hover { color:#2c1e19; }
        .gift-preview-state { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; padding:2rem; text-align:center; }
        .preview-state-icon { font-size:2.5rem; }
        .preview-spinner { width:34px; height:34px; border:3px solid #eadfd2; border-top-color:#a83d46; border-radius:50%; animation:preview-spin .8s linear infinite; }
        @keyframes preview-spin { to { transform:rotate(360deg); } }
        @media(max-width:768px) { .preview-layout { grid-template-columns:1fr; } .device-container { max-width:360px; } }
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
    </div>
  );
}
