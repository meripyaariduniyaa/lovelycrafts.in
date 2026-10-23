import { SITE_NAME, SITE_URL } from '@/lib/seo';

const GAMES = {
  'heart-rush': { title: 'Heart Rush', description: 'Play Heart Rush, a quick reflex game for couples and friends. Catch the hearts, beat your score, and share a challenge.' },
  'memory-match': { title: 'Memory Match', description: 'Play a memory matching game with your partner or best friend. Match every pair and compare your score.' },
  'speed-tap': { title: '10-Second Hug Frenzy', description: 'Play a fast tapping challenge with your partner or best friend, then share your result.' },
  'love-quiz': { title: 'Couple Chemistry Quiz', description: 'Answer a playful couples quiz, compare your chemistry score, and share the result.' },
  'word-scramble': { title: 'Love Word Scramble', description: 'Unscramble playful love and relationship words in this quick game for couples and friends.' },
};

export async function generateMetadata({ params }) {
  const { gameId } = await params;
  const game = GAMES[gameId];
  if (!game) return { title: `Game Not Found | ${SITE_NAME}`, robots: { index: false, follow: false } };
  const url = `${SITE_URL}/arcade/${gameId}`;
  return {
    title: `${game.title} — Play Online | ${SITE_NAME}`,
    description: game.description,
    alternates: { canonical: url },
    openGraph: { title: `${game.title} — Play Online | ${SITE_NAME}`, description: game.description, url, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary', title: `${game.title} — Play Online | ${SITE_NAME}`, description: game.description },
  };
}

export default function ArcadeGameLayout({ children }) {
  return children;
}
