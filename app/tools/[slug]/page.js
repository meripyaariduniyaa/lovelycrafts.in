import Link from 'next/link';
import { notFound } from 'next/navigation';
import { tools, getToolBySlug, getCategoryById } from '@/lib/tools';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';
import ToolCard from '@/components/tools/ToolCard';

// Tool components
import LoveCalculator from '@/components/tools/LoveCalculator';
import CrushCompatibility from '@/components/tools/CrushCompatibility';
import LoveLanguageQuiz from '@/components/tools/LoveLanguageQuiz';
import AgeCalculator from '@/components/tools/AgeCalculator';
import BirthdayCountdown from '@/components/tools/BirthdayCountdown';
import AnniversaryCalculator from '@/components/tools/AnniversaryCalculator';
import BirthdayWishGenerator from '@/components/tools/BirthdayWishGenerator';
import CoupleNickname from '@/components/tools/CoupleNickname';
import GiftIdeaGenerator from '@/components/tools/GiftIdeaGenerator';
import EmojiLoveTranslator from '@/components/tools/EmojiLoveTranslator';
import WhoLovesMore from '@/components/tools/WhoLovesMore';
import RomanticCaptionGen from '@/components/tools/RomanticCaptionGen';

const COMPONENT_MAP = {
  'love-calculator': LoveCalculator,
  'crush-compatibility-calculator': CrushCompatibility,
  'love-language-quiz': LoveLanguageQuiz,
  'age-calculator': AgeCalculator,
  'birthday-countdown-timer': BirthdayCountdown,
  'anniversary-calculator': AnniversaryCalculator,
  'birthday-wish-generator': BirthdayWishGenerator,
  'couple-nickname-generator': CoupleNickname,
  'gift-idea-generator': GiftIdeaGenerator,
  'emoji-love-translator': EmojiLoveTranslator,
  'who-loves-more-calculator': WhoLovesMore,
  'romantic-caption-generator': RomanticCaptionGen,
};

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const category = getCategoryById(tool.category);

  return {
    title: `${tool.title} — Free Online Tool | ${SITE_NAME}`,
    description: tool.description,
    keywords: tool.keywords || [tool.title, 'free tool', 'lovelycrafts'],
    alternates: {
      canonical: `${SITE_URL}/tools/${tool.slug}`,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: `${tool.title} — Free Online Tool | ${SITE_NAME}`,
      description: tool.description,
      url: `${SITE_URL}/tools/${tool.slug}`,
      locale: 'en_IN',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: tool.title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@lovelycraftsin',
      creator: '@lovelycraftsin',
      title: `${tool.title} | ${SITE_NAME}`,
      description: tool.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const ToolComponent = COMPONENT_MAP[tool.slug];
  if (!ToolComponent) notFound();

  const category = getCategoryById(tool.category);

  // Related tools: other tools in same category, or first 3 others
  const relatedTools = tools
    .filter((t) => t.slug !== tool.slug)
    .sort((a, b) => (a.category === tool.category ? -1 : 1))
    .slice(0, 3);

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.title} — ${SITE_NAME}`,
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${SITE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.title,
        item: `${SITE_URL}/tools/${tool.slug}`,
      },
    ],
  };

  return (
    <main className="lc-page-shell tool-detail-page">
      {/* BREADCRUMB */}
      <nav className="tool-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/tools">Tools</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{tool.title}</li>
        </ol>
      </nav>

      {/* TOOL HEADER */}
      <header className="tool-detail-header text-center">
        <div
          className="tool-detail-badge"
          style={{
            background: `${category?.color || '#e11d48'}18`,
            color: category?.color || '#e11d48',
          }}
        >
          <span>{category?.emoji}</span>
          <span>{category?.label}</span>
        </div>

        <div className="tool-detail-emoji" aria-hidden="true">
          {tool.emoji}
        </div>

        <h1 className="tool-detail-title">{tool.title}</h1>
        <p className="tool-detail-desc">{tool.description}</p>

        <div className="tool-detail-meta-pills">
          <span>⚡ Instant</span>
          <span>🔒 100% Private</span>
          <span>🎁 Free to use</span>
        </div>
      </header>

      {/* INTERACTIVE TOOL WRAPPER */}
      <div className="tool-card-container">
        <ToolComponent tool={tool} />
      </div>

      {/* ABOUT THIS TOOL */}
      <section className="tool-info-box">
        <h3>About the {tool.title}</h3>
        <p>
          The <strong>{tool.title}</strong> by LovelyCrafts helps you quickly generate fun, personalized insights for
          your special relationship moments. Once you receive your result, share it directly with friends or your partner on
          WhatsApp, or transform it into an unforgettable interactive digital surprise link.
        </p>
      </section>

      {/* RELATED TOOLS */}
      {relatedTools.length > 0 && (
        <section className="tool-related-section">
          <div className="tool-related-header">
            <h3>You Might Also Like</h3>
            <Link href="/tools" className="tool-related-all">
              View all tools <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="tools-grid">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
    </main>
  );
}

