'use client';

import { useState } from 'react';
import { WhatsAppIcon, LinkIcon } from '@/components/AppIcons';
import { triggerHaptic } from '@/lib/haptics';

export default function GameDuelCard({
  gameId,
  gameTitle,
  score,
  challenge,
  onChallengeCreated
}) {
  const [yourName, setYourName] = useState('');
  const [busy, setBusy] = useState(false);
  const [createdChallenge, setCreatedChallenge] = useState(challenge || null);
  const [copied, setCopied] = useState(false);

  const createChallenge = async () => {
    if (!yourName.trim()) return;
    triggerHaptic('medium');
    setBusy(true);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          gameId,
          creatorName: yourName.trim(),
          creatorScore: score
        })
      });
      const data = await res.json();
      if (data.success && data.challenge) {
        triggerHaptic('success');
        setCreatedChallenge(data.challenge);
        onChallengeCreated?.(data.challenge);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const getChallengeUrl = () => {
    if (!createdChallenge) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/arcade/${gameId}?challenge=${createdChallenge.id}`;
  };

  const handleCopy = async () => {
    triggerHaptic('success');
    const url = getChallengeUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('success');
    const url = getChallengeUrl();
    const text = `🔥 ${createdChallenge?.creatorName || 'Your partner'} just scored ${score} pts in ${gameTitle} on LovelyCrafts! 💖\n\nThink you can beat their score? Accept the couple duel here:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
      border: '1px solid #fecdd3',
      borderRadius: '16px',
      padding: '1.5rem',
      maxWidth: '480px',
      margin: '1.5rem auto 0',
      boxShadow: '0 4px 16px rgba(168,61,70,0.08)',
      textAlign: 'center'
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.25rem 0.75rem', borderRadius: '6px', background: 'rgba(168,61,70,0.1)', color: 'var(--accent-primary, #a83d46)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        <span>✦ Couple Duel</span>
      </div>
      <h3 style={{ fontSize: '1.25rem', color: '#881337', fontWeight: 600, margin: '0 0 0.4rem' }}>
        Challenge Your Partner or Bestie
      </h3>
      <p style={{ fontSize: '0.9rem', color: '#9f1239', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
        Send them a custom link to see if they can beat your score of <strong>{score} pts</strong>!
      </p>

      {!createdChallenge ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px', margin: '0 auto' }}>
          <input
            className="form-input"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            placeholder="Enter your name / nickname"
            maxLength={40}
            style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', minHeight: '46px' }}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={createChallenge}
            disabled={!yourName.trim() || busy}
            style={{ padding: '0.75rem', fontSize: '0.95rem', minHeight: '48px', touchAction: 'manipulation', background: 'linear-gradient(135deg, #f43f5e, #be185d)' }}
          >
            {busy ? 'Creating Challenge…' : '✨ Generate Challenge Link'}
          </button>
        </div>
      ) : (
        <div style={{ animation: 'sorryStepFadeIn 0.4s ease' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '0.75rem',
            border: '1px solid #fecdd3',
            fontSize: '0.85rem',
            color: '#374151',
            wordBreak: 'break-all',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            {getChallengeUrl()}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '999px',
                padding: '0.75rem 1.4rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '48px',
                touchAction: 'manipulation',
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
              }}
            >
              <WhatsAppIcon size={18} color="#ffffff" />
              <span>Send on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.2rem', fontSize: '0.9rem', fontWeight: 700, minHeight: '48px', touchAction: 'manipulation', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LinkIcon size={16} />
              <span>{copied ? '✓ Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
