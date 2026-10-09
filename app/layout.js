import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCtaBar from '@/components/StickyCtaBar';
import Oneko from '@/components/Oneko';
import GoogleAdSenseScript from '@/components/ArcadeAdSenseScript';
import Script from 'next/script';
import { siteMetadata, SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, CONTACT_EMAIL, INSTAGRAM_URL, X_URL } from '@/lib/seo';

// ─── Google Analytics 4 ────────────────────────────────────────────────────
// TODO: Replace GA_MEASUREMENT_ID with your real ID (e.g. G-XXXXXXXXXX)
// Get it at: https://analytics.google.com → Admin → Data Streams → Web stream → Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

export const metadata = siteMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ff4d6d',
};

export default function RootLayout({ children }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/templates?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/lovelycrafts-logo.png`,
    description: DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    sameAs: [INSTAGRAM_URL, X_URL],
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_EMAIL,
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  const siteNavigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    '@id': `${SITE_URL}/#navigation`,
    name: [
      'Virtual Birthday Bash',
      'The Perfect Proposal',
      'Anniversary Special',
      "I'm Sorry",
    ],
    url: [
      `${SITE_URL}/templates/birthday`,
      `${SITE_URL}/templates/proposal`,
      `${SITE_URL}/templates/anniversary`,
      `${SITE_URL}/templates/emotional-apology`,
    ],
  };

  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Fredoka:wght@400;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Header />
          <div className="page-content">{children}</div>
          <Footer />
          <StickyCtaBar />
          <Oneko />
          <GoogleAdSenseScript />
        </AuthProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema).replace(/</g, '\\u003c') }} />

        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
