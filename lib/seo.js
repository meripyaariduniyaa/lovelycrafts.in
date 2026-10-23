export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovelycrafts.in';
export const SITE_NAME = 'LovelyCrafts';
export const DEFAULT_DESCRIPTION =
  'Send a personalized digital surprise on WhatsApp in minutes. Interactive birthday cards, romantic proposals, anniversary gifts, apology cards, and festive experiences. Made with love in India.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-banner.jpg`;

// Bing Webmaster Tools — used by /BingSiteAuth.xml and meta tag verification
export const BING_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '6F3EE38778236173560CD34F16ABDC65';

// Contact & social
export const CONTACT_EMAIL = 'meri.pyaari.duniyaa@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/lovely.crafts.in/';
export const X_URL = 'https://x.com/lovelycraftsin';

export const siteMetadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `LovelyCrafts — Personalized Digital Gifts & Surprises India`,
    template: `%s | ${SITE_NAME}`,
  },

  description: DEFAULT_DESCRIPTION,

  applicationName: SITE_NAME,

  keywords: [
    // Core product
    'personalized digital gift India',
    'interactive digital card',
    'online surprise link',
    'digital surprise WhatsApp',
    'send surprise on WhatsApp',
    'digital greeting card India',
    'emotional experience card',
    // Birthday
    'birthday surprise link',
    'virtual birthday card India',
    'interactive birthday gift online',
    'birthday surprise for boyfriend',
    'birthday surprise for girlfriend',
    'midnight birthday surprise',
    'birthday card with music',
    // Romantic
    'online proposal for girlfriend',
    'proposal website India',
    'romantic digital surprise',
    'love letter website',
    'will you be my girlfriend link',
    'romantic anniversary gift online',
    'anniversary digital card India',
    // Apology
    'interactive apology card',
    'sorry card online India',
    'apology website for boyfriend',
    'apology website for girlfriend',
    // Family
    'letter to dad online India',
    "father's day digital gift India",
    'letter to mom online India',
    "mother's day digital card India",
    // Get well soon
    'get well soon digital card India',
    'warm hug digital card',
    'recovery wish online India',
    // Festive / Indian
    'Raksha Bandhan digital gift',
    'Raksha Bandhan surprise link',
    'digital diwali card',
    'wedding invitation online India',
    'digital wedding card WhatsApp',
    // Emotional
    'things i never said online',
    'open when letters online',
    'just because digital card India',
    'emotional digital surprise',
    // Gift intent
    'personalized gift for her India',
    'unique gift ideas online India',
    'cheap digital gift India',
    'interactive photo puzzle gift',
    'friendship day digital card',
    // Brand
    'LovelyCrafts',
    'lovelycrafts.in',
  ],

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,

  // Geo targeting for India
  other: {
    'geo.region': 'IN',
    'geo.placename': 'India',
    'geo.position': '20.5937;78.9629',
    'ICBM': '20.5937, 78.9629',
  },

  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Send a Digital Surprise on WhatsApp`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_IN',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Personalized Digital Surprises`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: `${SITE_NAME} — Send a Digital Surprise on WhatsApp`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    }),
    other: {
      'msvalidate.01': BING_SITE_VERIFICATION,
      'google-adsense-account': process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-8921431202323090',
    },
  },
};
