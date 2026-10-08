import Link from 'next/link';
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
    'couple arcade games online',
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
    <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col items-center">
      {/* ========================================================================= */}
      {/* 1. PLAYFUL EMOTIONAL HERO BANNER */}
      {/* ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(135deg, rgba(255, 241, 242, 0.98) 0%, rgba(255, 245, 248, 0.92) 50%, rgba(245, 243, 255, 0.98) 100%)',
          border: '1.5px solid rgba(244, 63, 94, 0.2)',
          boxShadow: '0 20px 50px -15px rgba(225, 29, 72, 0.12)',
        }}
        className="w-full text-center py-10 sm:py-16 px-5 sm:px-12 relative overflow-hidden rounded-3xl mb-8"
      >
        {/* Playful Floating Ambient Pill Accents */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-100 text-rose-600 text-xs font-bold shadow-sm animate-float">
          <span>💌 Instant WhatsApp Link</span>
        </div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-purple-100 text-purple-600 text-xs font-bold shadow-sm animate-float-reverse">
          <span>🎵 Plays Your Song</span>
        </div>

        {/* Hero Top Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-5">
          <span className="animate-heartbeat">💖</span>
          <span>Crafted To Bring Happy Tears &amp; Big Smiles</span>
        </div>

        {/* Hero Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
          Turn Real Emotions Into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Magical Interactive Surprises
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
          Create a private, unskippable digital experience in 3 minutes. Perfect for birthdays, proposals, anniversaries, apologies, and long-distance lovers.
        </p>

        {/* Hero Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
          <Link
            href="/templates"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            ✨ Craft a Surprise Now (From ₹199) →
          </Link>
          <Link
            href="/arcade"
            className="px-6 py-4 rounded-full bg-white text-purple-700 border border-purple-200 font-bold text-sm sm:text-base shadow-sm hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            🎮 Play Couple Arcade
          </Link>
        </div>

        {/* Corporate Link Subtext */}
        <div className="mb-6">
          <Link
            href="/business"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-800 underline decoration-rose-300 underline-offset-4"
          >
            💼 Planning company celebrations? Explore LovelyCrafts for Business →
          </Link>
        </div>

        {/* Trust Highlight Chips */}
        <div className="pt-6 border-t border-rose-200/60 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-700 font-bold">
          <span className="flex items-center gap-1.5">⚡ Ready in 3 mins</span>
          <span className="text-rose-300">•</span>
          <span className="flex items-center gap-1.5">📱 1-Click WhatsApp Share</span>
          <span className="text-rose-300">•</span>
          <span className="flex items-center gap-1.5">🔒 100% Private &amp; Safe</span>
          <span className="text-rose-300">•</span>
          <span className="flex items-center gap-1.5">🎵 Audio &amp; Confetti Included</span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LIVE REACTION ACTIVITY TICKER */}
      {/* ========================================================================= */}
      <div className="w-full flex justify-center mb-10">
        <LiveActivityTicker />
      </div>

      {/* ========================================================================= */}
      {/* 3. EMOTIONAL MOOD / INTENT MATCHER */}
      {/* ========================================================================= */}
      <section className="w-full mb-14">
        <EmotionFinder />
      </section>

      {/* ========================================================================= */}
      {/* 4. THREE SIMPLE STEPS (HOW IT WORKS) */}
      {/* ========================================================================= */}
      <section className="w-full mb-16 px-2">
        <div className="text-center mb-10">
          <span className="text-xs font-black text-rose-600 uppercase tracking-widest block mb-2">Simple &amp; Fast</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">How The Magic Unfolds in 3 Steps</h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-lg mx-auto font-medium">
            No design skills needed. Just your genuine feelings and a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-100/90 shadow-md shadow-rose-500/5 flex flex-col items-center text-center relative hover:translate-y-[-4px] transition-transform duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-100 to-pink-50 border border-rose-200 flex items-center justify-center text-2xl mb-5 shadow-inner">
              🎨
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-wider mb-2">
              Step 1
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Pick an Experience</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Choose from interactive proposals, birthday bashes, sentimental anniversaries, distance bridges, or sincere apologies.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-pink-100/90 shadow-md shadow-pink-500/5 flex flex-col items-center text-center relative hover:translate-y-[-4px] transition-transform duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-50 border border-pink-200 flex items-center justify-center text-2xl mb-5 shadow-inner">
              📸
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-pink-50 text-pink-600 font-black text-xs uppercase tracking-wider mb-2">
              Step 2
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Add Photos &amp; Words</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Drop in your favorite photos, secret letter, inside jokes, and pick a heartwarming background melody.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100/90 shadow-md shadow-purple-500/5 flex flex-col items-center text-center relative hover:translate-y-[-4px] transition-transform duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200 flex items-center justify-center text-2xl mb-5 shadow-inner">
              💌
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-purple-50 text-purple-600 font-black text-xs uppercase tracking-wider mb-2">
              Step 3
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Share on WhatsApp</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Get an instant private link. When they open it, confetti pops, music plays, and your surprise unfolds!
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE TEMPLATES CATALOG */}
      {/* ========================================================================= */}
      <section className="w-full my-6">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest block mb-2">Curated Surprises</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Choose a Template Experience</h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-lg mx-auto font-medium">
            Every template is custom crafted with smooth animations, audio player, interactive games, and private photo galleries.
          </p>
        </div>
        <TemplatesCatalog templates={templates} />
      </section>

      {/* ========================================================================= */}
      {/* 6. COUPLE & BESTIE MINI-GAMES ARCADE SHOWCASE */}
      {/* ========================================================================= */}
      <section className="w-full my-12 bg-gradient-to-br from-purple-50/90 via-pink-50/60 to-rose-50/90 border border-purple-200/70 rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-extrabold uppercase tracking-wider mb-2">
              🎮 Couple &amp; Friends Arcade
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Play Cute 30s Games Together
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl font-medium">
              Want something fun right now? Play interactive couple quizzes, scratch surprise vouchers, and spin the date wheel!
            </p>
          </div>
          <Link
            href="/arcade"
            className="px-6 py-3 rounded-full bg-purple-600 text-white font-extrabold text-sm shadow-md hover:bg-purple-700 transition-all duration-200 whitespace-nowrap"
          >
            🎮 Open Arcade Games →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/arcade"
            className="bg-white p-4 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group block text-left"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💖</div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">Love Compatibility</h4>
            <p className="text-slate-500 text-xs font-medium">Test your couple synergy &amp; unlock sweet verdict cards.</p>
          </Link>

          <Link
            href="/arcade"
            className="bg-white p-4 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group block text-left"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎰</div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">Date Night Wheel</h4>
            <p className="text-slate-500 text-xs font-medium">Spin to decide what to eat, watch, or do this weekend.</p>
          </Link>

          <Link
            href="/arcade"
            className="bg-white p-4 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group block text-left"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎟️</div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">Scratch Coupons</h4>
            <p className="text-slate-500 text-xs font-medium">Scratch to reveal redeemable love coupons &amp; hugs.</p>
          </Link>

          <Link
            href="/arcade"
            className="bg-white p-4 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200 group block text-left"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧠</div>
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">Memory Match Duel</h4>
            <p className="text-slate-500 text-xs font-medium">Flip cute couple icons &amp; beat each other’s high scores.</p>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. "HAPPY TEARS & SMILES" WALL OF LOVE (TESTIMONIALS) */}
      {/* ========================================================================= */}
      <section className="w-full my-12">
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest block mb-2">Real Stories</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Happy Tears &amp; Unforgettable Smiles</h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-lg mx-auto font-medium">
            See how thousands of partners, besties, and families made someone feel extraordinary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Review 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  Long Distance Anniversary
                </span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium italic">
                &ldquo;He lives in Germany and I&apos;m in Bangalore. When he opened the starry night letter at midnight with our song playing, he literally called me crying with happiness. Best ₹199 I have ever spent!&rdquo;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">Priya &amp; Rohan</span>
              <span className="text-slate-400 font-medium">Bangalore → Berlin</span>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  21st Birthday Surprise
                </span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium italic">
                &ldquo;Her reaction video when the balloon pops revealed our secret college photos was priceless! She said it was 100x more emotional and meaningful than any generic gift card.&rdquo;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">Aarav M.</span>
              <span className="text-slate-400 font-medium">Mumbai</span>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  Heartfelt Apology
                </span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium italic">
                &ldquo;We had a terrible argument and I was struggling to find the right words. The interactive apology note gave us both a gentle moment to breathe and talk with open hearts. Truly grateful.&rdquo;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">Neha &amp; Vikram</span>
              <span className="text-slate-400 font-medium">Delhi</span>
            </div>
          </div>

          {/* Review 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-pink-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  Romantic Proposal
                </span>
              </div>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium italic">
                &ldquo;The cheeky runaway &apos;NO&apos; button made her giggle so hard while tears welled up in her eyes. When the &apos;YES&apos; burst into heart confetti, it was pure movie magic.&rdquo;
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900">Tanvi &amp; Sameer</span>
              <span className="text-slate-400 font-medium">Pune</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. TRUST & PEACE OF MIND RIBBON */}
      {/* ========================================================================= */}
      <section className="w-full my-8 bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🔒</span>
            <strong className="text-xs sm:text-sm text-slate-900 font-bold mb-1">100% Private Links</strong>
            <span className="text-slate-500 text-xs">Only those with your unique URL can view</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">📱</span>
            <strong className="text-xs sm:text-sm text-slate-900 font-bold mb-1">Zero App Download</strong>
            <span className="text-slate-500 text-xs">Opens instantly in any mobile browser</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🎵</span>
            <strong className="text-xs sm:text-sm text-slate-900 font-bold mb-1">Music &amp; Audio Ready</strong>
            <span className="text-slate-500 text-xs">Plays romantic soundtracks or voice notes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">⚡</span>
            <strong className="text-xs sm:text-sm text-slate-900 font-bold mb-1">Instant Delivery</strong>
            <span className="text-slate-500 text-xs">Created in 3 mins, ready right when you need it</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL PLAYFUL CTA CARD */}
      {/* ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
          boxShadow: '0 20px 45px -10px rgba(244, 63, 94, 0.4)',
        }}
        className="w-full rounded-3xl py-12 px-6 sm:px-12 text-center text-white my-8 relative overflow-hidden"
      >
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="text-3xl sm:text-4xl block mb-3 animate-heartbeat">💖✨</span>
          <h2 className="text-2xl sm:text-4xl font-black mb-4 tracking-tight leading-snug">
            Ready to Make Someone Feel Deeply Special Today?
          </h2>
          <p className="text-rose-100 text-sm sm:text-base mb-8 font-medium leading-relaxed">
            Don&apos;t just send a plain text message. Give them an interactive digital memory they will bookmark and smile at for years to come.
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-white text-rose-700 font-black text-sm sm:text-base shadow-2xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span>✨ Start Crafting Now (Starting at ₹199)</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
