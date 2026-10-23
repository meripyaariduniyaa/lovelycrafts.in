import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = {
  title: 'Couple & Friends Mini-Game Arcade — Play & Duel | LovelyCrafts',
  description: 'Play quick couple and best-friend games online, compare scores, and send a WhatsApp challenge. Try LovelyCrafts mini-games together on any device.',
  keywords: [
    'couples games online',
    'partner challenge games',
    'romantic mini games online India',
    'couple duel games WhatsApp',
    'fun games for long distance relationships',
    'LovelyCrafts arcade',
  ],
  alternates: { canonical: `${SITE_URL}/arcade` },
  openGraph: {
    title: 'Couples & Besties Mini-Game Arcade | LovelyCrafts',
    description: 'Play free couple and best-friend mini-games online, then share a WhatsApp challenge link.',
    url: `${SITE_URL}/arcade`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts Arcade' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'Couples & Besties Mini-Game Arcade | LovelyCrafts',
    description: 'Play 30s games, set high scores, and challenge your partner on WhatsApp!',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function ArcadeLayout({ children }) {
  return <>{children}</>;
}

