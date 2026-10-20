'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LiveTemplatePreviewModal from '@/components/LiveTemplatePreviewModal';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi, I’m Anya — your LovelyCrafts gift helper. Tell me who you’re celebrating and I’ll help you find a gift. I can chat in English, Hindi, or Hinglish.",
  recommendations: [],
};

const QUICK_PROMPTS = [
  { label: '🎂 Birthday gift', message: 'Help me choose a birthday gift.' },
  { label: '💞 For my partner', message: 'I want a romantic gift for my partner.' },
  { label: '💰 What are the prices?', message: 'What are the current gift prices?' },
  { label: '✨ Custom template', message: 'Can you help me find a personalized experience?' },
  { label: '🔗 My gift link is missing', message: 'I paid but my gift link has not arrived.' },
];

function AnyaAvatar({ small = false }) {
  return (
    <span className={`anya-avatar${small ? ' anya-avatar-small' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <circle cx="32" cy="32" r="30" fill="#f6dfcf" />
        <path d="M12 30c0-15 9-24 21-24s21 10 21 25v16H11z" fill="#593d3e" />
        <path d="M18 29c0-10 6-17 14-17s14 7 14 17v9c0 10-6 17-14 17s-14-7-14-17z" fill="#f1c5a8" />
        <path d="M16 30c1-14 9-22 18-22 8 0 15 5 18 15-7-1-12-4-16-9-3 7-10 12-20 16z" fill="#593d3e" />
        <path d="M24 34h2m12 0h2" stroke="#563e39" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M28 43c2 2 6 2 8 0" stroke="#ad635f" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="47" cy="18" r="4" fill="#d98b84" />
      </svg>
      <i />
    </span>
  );
}

export default function AnyaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const [requestError, setRequestError] = useState('');
  const conversationEndRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      launcherRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const sendMessage = async (value) => {
    const content = String(value || '').trim().slice(0, 800);
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setRequestError('');
    setIsSending(true);

    try {
      const res = await fetch('/api/anya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.filter((message) => message.role !== 'assistant' || message !== INITIAL_MESSAGE).slice(-10).map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Anya is busy. Please try again in a moment.');
      setMessages((current) => [...current, {
        role: 'assistant',
        content: data.reply || 'I’m here to help. Tell me a little more about what you’re looking for.',
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        role: 'assistant',
        content: 'I’m having trouble reaching my helper just now. You can browse the gifts or contact our team for help.',
        recommendations: [],
      }]);
      setRequestError(error.message || 'Anya is temporarily unavailable.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="anya-widget-root">
        {isOpen && (
          <section className="anya-panel" id="anya-chat-panel" role="dialog" aria-label="Chat with Anya" aria-modal="false">
            <header className="anya-header">
              <AnyaAvatar />
              <div className="anya-header-copy">
                <div className="anya-title">Anya <span>from LovelyCrafts</span></div>
                <div className="anya-status"><i /> Your gift helper · replies instantly</div>
              </div>
              <button className="anya-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close Anya chat">×</button>
            </header>

            <div className="anya-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversation with Anya">
              {messages.map((message, index) => (
                <div className={`anya-message-row ${message.role === 'user' ? 'anya-user-row' : ''}`} key={`${index}-${message.role}`}>
                  {message.role === 'assistant' && <AnyaAvatar small />}
                  <div className={`anya-bubble ${message.role === 'user' ? 'anya-user-bubble' : ''}`}>
                    <p>{message.content}</p>
                    {message.recommendations?.length > 0 && (
                      <div className="anya-recommendations" aria-label="Gift recommendations">
                        {message.recommendations.map((item) => (
                          <article className="anya-gift-card" key={item.id}>
                            <div className="anya-gift-art" aria-hidden="true"><span>{item.emoji}</span><small>{item.category}</small></div>
                            <div className="anya-gift-copy">
                              <h3>{item.title}</h3>
                              <strong>₹{item.price}</strong>
                              <div className="anya-gift-actions">
                                <button type="button" onClick={() => setPreviewTemplateId(item.id)}>Try it</button>
                                <Link href={`/create?template=${encodeURIComponent(item.id)}`} onClick={() => setIsOpen(false)}>Make it</Link>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="anya-quick-prompts" aria-label="Suggested questions">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button type="button" key={prompt.label} disabled={isSending} onClick={() => sendMessage(prompt.message)}>{prompt.label}</button>
                  ))}
                </div>
              )}

              {isSending && <div className="anya-typing"><AnyaAvatar small /><span>Anya is typing<span className="anya-dots">…</span></span></div>}
              {requestError && <p className="anya-error" role="status">{requestError}</p>}
              <div ref={conversationEndRef} />
            </div>

            <div className="anya-composer-wrap">
              <form className="anya-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(input); }}>
                <label className="anya-sr-only" htmlFor="anya-message-input">Ask Anya anything</label>
                <input
                  id="anya-message-input"
                  ref={inputRef}
                  value={input}
                  maxLength={800}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask Anya anything…"
                  disabled={isSending}
                />
                <button type="submit" aria-label="Send message" disabled={!input.trim() || isSending}>↑</button>
              </form>
              <p className="anya-disclosure">Chat text is sent to our AI provider to answer you. Please don’t share private gift or payment details.</p>
              <div className="anya-footer">Made with <span>♥</span> by LovelyCrafts · <Link href="/contact" onClick={() => setIsOpen(false)}>Contact support</Link></div>
            </div>
          </section>
        )}

        <button
          ref={launcherRef}
          className={`anya-launcher ${isOpen ? 'anya-launcher-open' : ''}`}
          type="button"
          aria-label={isOpen ? 'Close Anya chat' : 'Chat with Anya, your gift helper'}
          aria-expanded={isOpen}
          aria-controls="anya-chat-panel"
          aria-haspopup="dialog"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? '×' : <><AnyaAvatar small /><span className="anya-launcher-label">Ask Anya</span><span className="anya-launcher-sparkle">✦</span></>}
        </button>
      </div>

      {previewTemplateId && <LiveTemplatePreviewModal templateId={previewTemplateId} onClose={() => setPreviewTemplateId(null)} />}

      <style jsx>{`
        .anya-widget-root { --anya-ink:#40332c; --anya-muted:#796c63; --anya-border:#eadbcd; --anya-paper:#fffaf4; --anya-clay:#f1e5d9; --anya-rose:#bd7779; position:fixed; z-index:1200; right:24px; bottom:24px; font-family:Inter,system-ui,sans-serif; color:var(--anya-ink); }
        .anya-panel { width:min(390px,calc(100vw - 32px)); height:min(640px,calc(100dvh - 120px)); min-height:420px; display:flex; flex-direction:column; overflow:hidden; border:1px solid rgba(226,207,189,.9); border-radius:28px; background:var(--anya-paper); box-shadow:0 22px 70px rgba(66,45,32,.2),0 3px 12px rgba(66,45,32,.08); animation:anya-enter .25s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes anya-enter { from { opacity:0; transform:translateY(12px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        .anya-header { display:flex; align-items:center; gap:12px; padding:14px 15px; background:linear-gradient(110deg,#f9eee8,#fbf1dc); border-bottom:1px solid var(--anya-border); flex:none; }
        .anya-avatar { width:54px; height:54px; position:relative; display:inline-flex; align-items:center; justify-content:center; flex:none; border:3px solid white; border-radius:50%; background:#f7e5d9; box-shadow:0 4px 10px rgba(77,52,38,.12); }
        .anya-avatar svg { width:100%; height:100%; }
        .anya-avatar i { position:absolute; width:11px; height:11px; right:0; bottom:0; border:2px solid white; border-radius:50%; background:#58a879; }
        .anya-avatar-small { width:30px; height:30px; border-width:2px; box-shadow:none; }
        .anya-avatar-small i { width:8px; height:8px; border-width:1px; }
        .anya-header-copy { min-width:0; flex:1; }
        .anya-title { font:600 1.18rem/1.2 Georgia,serif; color:#44352e; }
        .anya-title span { color:var(--anya-rose); font:italic 0.88rem/1.2 Georgia,serif; margin-left:4px; }
        .anya-status { display:flex; align-items:center; gap:6px; margin-top:4px; color:var(--anya-muted); font-size:.77rem; }
        .anya-status i { width:7px; height:7px; border-radius:50%; background:#54a77b; box-shadow:0 0 0 3px rgba(84,167,123,.14); }
        .anya-close { width:38px; height:38px; flex:none; border:1px solid var(--anya-border); border-radius:50%; background:#fffaf4; color:var(--anya-ink); font-size:1.6rem; line-height:1; cursor:pointer; }
        .anya-messages { flex:1; overflow-y:auto; overscroll-behavior:contain; padding:16px 13px; background:linear-gradient(180deg,#fffdf9,#fff9f2); }
        .anya-message-row { display:flex; align-items:flex-end; gap:8px; margin:0 0 13px; }
        .anya-user-row { justify-content:flex-end; }
        .anya-bubble { max-width:88%; padding:11px 13px; border:1px solid #eee0d3; border-radius:17px 17px 17px 5px; background:#fff; box-shadow:0 3px 10px rgba(71,48,32,.04); }
        .anya-bubble p { margin:0; color:#4c4039; font-size:.91rem; line-height:1.5; white-space:pre-wrap; overflow-wrap:anywhere; }
        .anya-user-bubble { max-width:88%; border-color:#3a3030; border-radius:17px 17px 5px 17px; background:#302a2a; box-shadow:0 4px 12px rgba(54,44,42,.12); }
        .anya-user-bubble p { color:#fffaf4; }
        .anya-quick-prompts { display:flex; flex-wrap:wrap; gap:7px; padding-left:36px; margin:4px 0 14px; }
        .anya-quick-prompts button { padding:8px 11px; border:1px solid #ead9c9; border-radius:999px; background:linear-gradient(145deg,#fffdf9,#f5eadf); color:#59483d; font:600 .77rem/1.2 Inter,system-ui,sans-serif; cursor:pointer; box-shadow:3px 3px 8px rgba(88,61,40,.07); }
        .anya-quick-prompts button:hover { background:#f4e4d7; }
        .anya-quick-prompts button:disabled { opacity:.55; cursor:wait; }
        .anya-typing { display:flex; align-items:center; gap:8px; color:var(--anya-muted); font-size:.78rem; }
        .anya-dots { display:inline-block; animation:anya-dots 1s steps(3,end) infinite; }
        @keyframes anya-dots { 0%,20% { opacity:.25; } 70%,100% { opacity:1; } }
        .anya-error { margin:8px 0 0 38px; color:#8c3f3c; font-size:.75rem; }
        .anya-recommendations { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:8px; margin-top:11px; }
        .anya-gift-card { min-width:0; overflow:hidden; border:1px solid #e8d8c9; border-radius:15px; background:#fffdf9; box-shadow:4px 5px 12px rgba(81,58,43,.08); }
        .anya-gift-art { height:72px; display:flex; align-items:center; justify-content:center; gap:8px; background:radial-gradient(circle at 50% 15%,#fff8eb,#f0dfd0); color:#79554a; }
        .anya-gift-art span { font-size:2rem; filter:drop-shadow(0 3px 4px rgba(67,46,32,.12)); }
        .anya-gift-art small { padding:4px 7px; border:1px solid rgba(157,109,91,.18); border-radius:99px; background:rgba(255,255,255,.7); font-size:.63rem; }
        .anya-gift-copy { padding:9px; }
        .anya-gift-copy h3 { min-height:2.2em; margin:0 0 5px; color:#44352e; font:600 .82rem/1.3 Georgia,serif; }
        .anya-gift-copy strong { color:#44352e; font-size:.87rem; }
        .anya-gift-actions { display:flex; gap:6px; margin-top:8px; }
        .anya-gift-actions button,.anya-gift-actions a { display:flex; flex:1; justify-content:center; align-items:center; min-height:34px; padding:4px 7px; border:1px solid #e5d6c8; border-radius:999px; background:#f8f0e7; color:#59473c; font:700 .72rem/1 Inter,system-ui,sans-serif; text-decoration:none; cursor:pointer; }
        .anya-gift-actions a { border-color:#3a3030; background:#302a2a; color:#fffaf4; }
        .anya-composer-wrap { flex:none; padding:10px 13px 9px; border-top:1px solid #eadbcd; background:linear-gradient(180deg,#fffaf4,#fffdf9); }
        .anya-composer { display:flex; align-items:center; gap:8px; min-height:46px; padding:4px 5px 4px 14px; border:1px solid #e4d2c3; border-radius:999px; background:#fff; box-shadow:inset 2px 2px 5px rgba(90,65,46,.04),0 2px 8px rgba(90,65,46,.03); }
        .anya-composer:focus-within { border-color:#c88980; box-shadow:0 0 0 3px rgba(200,137,128,.16); }
        .anya-composer input { flex:1; min-width:0; border:0; outline:0; background:transparent; color:#44352e; font:400 .9rem/1.3 Inter,system-ui,sans-serif; }
        .anya-composer input::placeholder { color:#9b8e84; }
        .anya-composer button { width:36px; height:36px; border:0; border-radius:50%; background:#352d2d; color:white; font-size:1.2rem; cursor:pointer; }
        .anya-composer button:disabled { background:#c9c3be; cursor:not-allowed; }
        .anya-disclosure { margin:6px 4px 3px; color:#887a70; font-size:.65rem; line-height:1.35; text-align:center; }
        .anya-footer { color:#89796f; font: .7rem/1.35 Georgia,serif; text-align:center; }
        .anya-footer span { color:#c87e7b; }
        .anya-footer a { color:#75554b; text-decoration:underline; text-underline-offset:2px; }
        .anya-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .anya-widget-root button:focus-visible,.anya-widget-root a:focus-visible,.anya-widget-root input:focus-visible { outline:3px solid #ac6b60; outline-offset:3px; }
        .anya-launcher { min-width:66px; min-height:66px; display:flex; align-items:center; justify-content:center; gap:8px; margin:14px 0 0 auto; padding:8px 12px; border:3px solid #fffaf4; border-radius:999px; background:#302a2a; color:white; font-size:1.7rem; line-height:1; cursor:pointer; box-shadow:0 8px 24px rgba(51,39,32,.25); transition:transform .2s ease,box-shadow .2s ease; }
        .anya-launcher:hover { transform:translateY(-2px); box-shadow:0 11px 28px rgba(51,39,32,.3); }
        .anya-launcher .anya-avatar { width:42px; height:42px; }
        .anya-launcher-label { color:#fffaf4; font:700 .86rem/1 Inter,system-ui,sans-serif; }
        .anya-launcher-sparkle { color:#e7bf83; font-size:.85rem; }
        .anya-launcher-open { width:58px; min-width:58px; min-height:58px; height:58px; margin-top:12px; padding:0; font-size:2rem; }
        @media (max-width:600px) {
          .anya-widget-root { right:12px; bottom:calc(82px + env(safe-area-inset-bottom)); }
          .anya-panel { width:calc(100vw - 24px); height:min(620px,calc(100dvh - 160px)); min-height:390px; border-radius:23px; }
          .anya-header { padding:11px 12px; }
          .anya-avatar { width:46px; height:46px; }
          .anya-messages { padding:13px 10px; }
          .anya-quick-prompts { padding-left:0; }
          .anya-launcher { min-width:60px; min-height:60px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .anya-panel { animation:none; }
          .anya-dots { animation:none; }
          .anya-launcher { transition:none; }
        }
      `}</style>
    </>
  );
}
