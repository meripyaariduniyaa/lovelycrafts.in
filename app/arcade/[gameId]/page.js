'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HeartRushGame from '@/components/arcade/HeartRushGame';
import MemoryMatchGame from '@/components/arcade/MemoryMatchGame';
import SpeedTapGame from '@/components/arcade/SpeedTapGame';
import LoveQuizGame from '@/components/arcade/LoveQuizGame';
import WordScrambleGame from '@/components/arcade/WordScrambleGame';
import GameDuelCard from '@/components/arcade/GameDuelCard';

import { WhatsAppIcon } from '@/components/AppIcons';

const GAME_INFO = {
  'heart-rush': {
    title: 'Heart Rush!',
    icon: '💖⚡',
    component: HeartRushGame
  },
  'memory-match': {
    title: 'Memory Match',
    icon: '🧩🃏',
    component: MemoryMatchGame
  },
  'speed-tap': {
    title: '10s Hug Frenzy',
    icon: '⚡🫂',
    component: SpeedTapGame
  },
  'love-quiz': {
    title: 'Couple Chemistry Quiz',
    icon: '🧠❓',
    component: LoveQuizGame
  },
  'word-scramble': {
    title: 'Love Word Scramble',
    icon: '🔡💌',
    component: WordScrambleGame
  }
};

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <main className="center-screen">
          <div className="spinner" />
          <p className="text-muted">Loading game arcade...</p>
        </main>
      }
    >
      <GameRunner />
    </Suspense>
  );
}

function GameRunner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameId = params.gameId || 'heart-rush';
  const challengeId = searchParams.get('challenge');
  const gameConfig = GAME_INFO[gameId] || GAME_INFO['heart-rush'];
  const GameComponent = gameConfig.component;

  const [challengeData, setChallengeData] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(!!challengeId);
  const [latestScore, setLatestScore] = useState(null);
  const [highScore, setHighScore] = useState(0);

  // Partner submission state
  const [partnerName, setPartnerName] = useState('');
  const [submittingDuel, setSubmittingDuel] = useState(false);
  const [duelResult, setDuelResult] = useState(null);

  // Fetch challenge data if in challenge mode
  useEffect(() => {
    if (!challengeId) return;
    async function fetchChallenge() {
      try {
        const res = await fetch(`/api/challenges?id=${challengeId}`);
        const data = await res.json();
        if (data.success && data.challenge) {
          setChallengeData(data.challenge);
          if (data.challenge.status === 'completed') {
            setDuelResult(data.challenge);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChallenge(false);
      }
    }
    fetchChallenge();
  }, [challengeId]);

  // Load high score from localStorage
  useEffect(() => {
    try {
      const savedScores = JSON.parse(localStorage.getItem('arcade_high_scores') || '{}');
      setHighScore(savedScores[gameId] || 0);
    } catch {}
  }, [gameId]);

  const handleGameOver = (score) => {
    setLatestScore(score);
    // Update local high score if higher
    if (score > highScore) {
      setHighScore(score);
      try {
        const savedScores = JSON.parse(localStorage.getItem('arcade_high_scores') || '{}');
        savedScores[gameId] = score;
        localStorage.setItem('arcade_high_scores', JSON.stringify(savedScores));
      } catch {}
    }
  };

  const submitPartnerDuelScore = async () => {
    if (!partnerName.trim() || !challengeId) return;
    setSubmittingDuel(true);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_partner_score',
          challengeId,
          partnerName: partnerName.trim(),
          partnerScore: latestScore
        })
      });
      const data = await res.json();
      if (data.success && data.challenge) {
        setDuelResult(data.challenge);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingDuel(false);
    }
  };

  return (
    <main style={{
      minHeight: '100dvh',
      width: '100%',
      background: 'radial-gradient(ellipse at 50% 0%, #fff1f2 0%, #fdf4f5 50%, #fef2f2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(0.75rem, 2vw, 1.5rem) clamp(0.5rem, 2vw, 1.25rem)'
    }}>
      <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Sleek Minimal Floating Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(254, 205, 211, 0.8)',
          borderRadius: '999px',
          padding: '0.45rem 0.85rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(190, 24, 93, 0.06)'
        }}>
          <Link
            href="/arcade"
            style={{
              color: '#be185d',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(253, 242, 248, 0.8)',
              transition: 'background 0.2s ease'
            }}
          >
            ← <span>Arcade</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>{gameConfig.icon}</span>
            <span style={{ fontWeight: 800, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#1f2937' }}>
              {gameConfig.title}
            </span>
          </div>

          <span style={{
            fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)',
            fontWeight: 800,
            color: '#16a34a',
            background: '#dcfce7',
            padding: '0.3rem 0.7rem',
            borderRadius: '999px',
            border: '1px solid #bbf7d0'
          }}>
            🏆 {highScore} pts
          </span>
        </header>

        {/* Active Challenge Alert Banner */}
        {challengeData && !duelResult && (
          <div style={{
            background: 'linear-gradient(135deg, #fdf2f8, #ffe4e6)',
            border: '2px solid #f43f5e',
            borderRadius: '20px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(244,63,94,0.1)'
          }}>
            <h2 style={{ fontSize: '1.1rem', color: '#881337', fontWeight: 800, margin: '0 0 0.2rem' }}>
              ⚔️💌 {challengeData.creatorName} has challenged you!
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#9f1239', margin: 0 }}>
              Their score to beat: <strong style={{ fontSize: '1.1rem', color: '#be185d' }}>{challengeData.creatorScore} pts</strong>
            </p>
          </div>
        )}

        {/* Main Dedicated Game Interface */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'clamp(20px, 3.5vw, 30px)',
          padding: 'clamp(0.85rem, 2.5vw, 1.75rem)',
          border: '1px solid rgba(254, 205, 211, 0.6)',
          boxShadow: '0 12px 36px rgba(190, 24, 93, 0.07)',
          width: '100%'
        }}>
          <GameComponent
            onGameOver={handleGameOver}
            challengeTargetScore={challengeData ? challengeData.creatorScore : null}
            challengerName={challengeData ? challengeData.creatorName : null}
          />
        </div>


        {/* Challenge Mode: Partner Score Submission & Live Winner Card */}
        {challengeId && latestScore !== null && !duelResult && (
          <div style={{
            background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
            border: '2px solid #f43f5e',
            borderRadius: '24px',
            padding: '1.5rem',
            marginTop: '1.25rem',
            textAlign: 'center',
            animation: 'sorryStepFadeIn 0.4s ease'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#881337', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Submit Your Score for the Duel!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#9f1239', margin: '0 0 1rem' }}>
              You scored <strong>{latestScore} pts</strong> vs {challengeData?.creatorName}&apos;s <strong>{challengeData?.creatorScore} pts</strong>!
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '340px', margin: '0 auto' }}>
              <input
                className="form-input"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Your Name / Nickname"
                maxLength={40}
                style={{ textAlign: 'center', fontWeight: 700 }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={submitPartnerDuelScore}
                disabled={!partnerName.trim() || submittingDuel}
                style={{ whiteSpace: 'nowrap', padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #f43f5e, #be185d)' }}
              >
                {submittingDuel ? 'Submitting…' : '👑 See Winner'}
              </button>
            </div>
          </div>
        )}

        {/* Duel Result Comparison Card */}
        {duelResult && (
          <div style={{
            background: 'linear-gradient(135deg, #ffffff, #fff1f2)',
            border: '3px solid #f43f5e',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            marginTop: '1.25rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(244,63,94,0.18)',
            animation: 'sorryStepFadeIn 0.5s ease'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.25rem' }}>
              {duelResult.winner === 'partner' ? '👑🎉' : duelResult.winner === 'creator' ? '👑🔥' : '🤝✨'}
            </span>
            <h2 style={{ fontSize: '1.6rem', color: '#881337', fontWeight: 900, margin: '0 0 0.5rem' }}>
              {duelResult.winner === 'partner'
                ? `${duelResult.partnerName} Wins the Duel!`
                : duelResult.winner === 'creator'
                ? `${duelResult.creatorName} Defends the Crown!`
                : "It's a Perfect Tie!"}
            </h2>

            {/* Score Comparison Display */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ background: '#fff5f8', padding: '1rem', borderRadius: '16px', border: duelResult.winner === 'creator' ? '2px solid #a64036' : '1px solid #fecdd3' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
                  {duelResult.creatorName} {duelResult.winner === 'creator' && '👑'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#881337', marginTop: '4px' }}>
                  {duelResult.creatorScore} pts
                </div>
              </div>

              <div style={{ background: '#fff5f8', padding: '1rem', borderRadius: '16px', border: duelResult.winner === 'partner' ? '2px solid #a64036' : '1px solid #fecdd3' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
                  {duelResult.partnerName} {duelResult.winner === 'partner' && '👑'}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#881337', marginTop: '4px' }}>
                  {duelResult.partnerScore} pts
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/arcade" className="btn-secondary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}>
                🎮 Try Another Game
              </Link>
              <button
                type="button"
                onClick={() => {
                  const text = `👑 Couple Duel Result on LovelyCrafts:\n${duelResult.creatorName} (${duelResult.creatorScore} pts) vs ${duelResult.partnerName} (${duelResult.partnerScore} pts)!\nWinner: ${duelResult.winner === 'partner' ? duelResult.partnerName : duelResult.creatorName} 🏆✨`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.7rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
                }}
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>Share Duel Result</span>
              </button>
            </div>
          </div>
        )}

        {/* Solo Mode: Challenge Card */}
        {!challengeId && latestScore !== null && (
          <GameDuelCard
            gameId={gameId}
            gameTitle={gameConfig.title}
            score={latestScore}
          />
        )}

      </div>
    </main>
  );
}
