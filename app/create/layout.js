import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = {
  title: 'Create a Personalized Digital Surprise — 3 Minutes | LovelyCrafts',
  description: 'Create your own interactive digital gift in 3 minutes. Choose from templates, add your photos and heartfelt message, set a custom link, and share instantly on WhatsApp.',
  keywords: [
    'create personalized digital gift India',
    'make interactive birthday card online',
    'create surprise link WhatsApp',
    'online gift creator India',
    'make apology card online',
    'create anniversary digital card',
    'LovelyCrafts creator',
    'personalized gift maker India',
  ],
  alternates: { canonical: `${SITE_URL}/create` },
  openGraph: {
    title: 'Create Your Personalized Digital Surprise | LovelyCrafts',
    description: 'Choose from our templates, add photos & your message, get a private shareable link. Send an unforgettable digital gift on WhatsApp in minutes.',
    url: `${SITE_URL}/create`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts — Create Your Digital Surprise' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lovelycraftsin',
    creator: '@lovelycraftsin',
    title: 'Create Your Personalized Digital Surprise | LovelyCrafts',
    description: 'Make a personalized digital gift in 3 minutes. Share on WhatsApp instantly.',
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function CreateLayout({ children }) {
  return children;
}
