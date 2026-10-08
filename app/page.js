import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TemplatesCatalog from '@/components/TemplatesCatalog';
import EmotionFinder from '@/components/EmotionFinder';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import { templates } from '@/lib/templates';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = {
  title: 'LovelyCrafts — Interactive Digital Gifts & Personalized Surprises India',
  description:
    'Create stunning interactive digital surprises in 3 minutes. Birthday cards, romantic proposals, apology notes, anniversary gifts, and emotional experiences — personalized with your photos & message. Share instantly on WhatsApp.',
  keywords: [
    'personalized digital gift India',
    'interactive birthday card India',
    'send surprise on WhatsApp',
    'online proposal for girlfriend',
    'romantic anniversary gift online',
    'interactive apology card',
    'digital gift for long distance relationship',
    'digital birthday surprise link',
    'emotional digital card India',
    'LovelyCrafts',
    'lovelycrafts.in',
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'LovelyCrafts — Interactive Digital Gifts & Personalized Surprises India',
    description:
      'Create stunning interactive digital surprises in 3 minutes. Birthday cards, proposals, apology notes, anniversary gifts, and emotional experiences.',
    url: SITE_URL,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts — Personalized Digital Surprises' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'LovelyCrafts — Interactive Digital Gifts & Surprises India',
    description: 'Birthday cards, proposals, apology notes & emotional digital experiences. Share on WhatsApp in seconds.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080810] text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Hero Banner */}
        <section className="text-center py-12 px-4 relative overflow-hidden rounded-3xl bg-gradient-to-b from-rose-950/30 via-slate-900/60 to-slate-950 border border-rose-900/20 shadow-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span>✨ Crafted With Love</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Turn Your Memories Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Interactive Digital Moments
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Craft private, emotional interactive web experiences in 3 minutes. Perfect for birthdays, romantic proposals, anniversaries, and heartfelt apologies. Share instantly on WhatsApp.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/create"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-extrabold text-base shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ✨ Create My Experience Now →
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span>⚡ Ready in 3 mins</span>
            <span>•</span>
            <span>📱 Works on all devices</span>
            <span>•</span>
            <span>🔒 Private & Secure</span>
          </div>
        </section>

        <LiveActivityTicker />

        {/* Emotion Finder */}
        <div className="my-8">
          <EmotionFinder />
        </div>

        {/* Templates Catalog */}
        <section className="my-12">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block mb-2">Curated Catalog</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Choose a Template Experience</h2>
          </div>
          <TemplatesCatalog templates={templates} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
