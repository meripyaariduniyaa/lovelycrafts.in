import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/seo';

export const metadata = {
  title: 'Cookie Policy — LovelyCrafts',
  description:
    'LovelyCrafts Cookie Policy: Learn how we use cookies for referral attribution, authentication, analytics, and advertising. Understand your choices and how to manage cookies.',
  alternates: { canonical: `${SITE_URL}/cookies` },
  openGraph: {
    title: 'Cookie Policy | LovelyCrafts',
    description:
      'How LovelyCrafts uses cookies for referral tracking, authentication, analytics, and ads — and how you can manage your preferences.',
    url: `${SITE_URL}/cookies`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    site: '@lovelycraftsin',
    title: 'Cookie Policy | LovelyCrafts',
    description: 'How LovelyCrafts uses cookies and how you can manage your preferences.',
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 13, 2026';

export default function CookiePolicyPage() {
  return (
    <main className="shell lc-page-shell" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ color: '#ec4899', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <span style={{ fontWeight: 600 }}>Cookie Policy</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍪</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#111', marginBottom: '0.5rem' }}>
            Cookie Policy
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            <strong>Effective Date:</strong> {EFFECTIVE_DATE} &nbsp;|&nbsp;
            <strong>Platform:</strong> {SITE_NAME} ({SITE_URL})
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#43332b' }}>
            🍪 This policy explains what cookies and similar tracking technologies we use on {SITE_NAME}, why we use them, and how you can control them.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files placed on your device (computer, phone, or tablet) when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              We also use similar technologies such as <strong>browser local storage</strong> to store small pieces of data on your device for specific functional purposes described below.
            </p>
          </Section>

          <Section title="2. Cookies We Use">
            <p style={{ marginBottom: '1.25rem' }}>
              {SITE_NAME} uses the following categories of cookies:
            </p>

            <CookieCard
              category="Essential / Functional"
              badge="Always Active"
              badgeColor="#16a34a"
              badgeBg="#f0fdf4"
              icon="🔒"
              cookies={[
                {
                  name: 'Firebase Auth Session',
                  purpose: 'Maintains your login session after signing in with Google. Without this, you would be logged out on every page visit.',
                  duration: 'Session / up to 1 year (managed by Firebase)',
                  thirdParty: 'Google Firebase',
                },
                {
                  name: 'Device Identifier (localStorage)',
                  purpose: 'An anonymous token stored in browser local storage to link unpaid gift drafts to your device so you can return and complete your purchase.',
                  duration: 'Up to 90 days',
                  thirdParty: 'First-party (LovelyCrafts)',
                },
              ]}
            />

            <CookieCard
              category="Referral Attribution"
              badge="Functional"
              badgeColor="#9f1239"
              badgeBg="#fff1f2"
              icon="🔗"
              cookies={[
                {
                  name: 'lp_ref',
                  purpose: 'Set when you arrive at LovelyCrafts via a Creator Club referral link (e.g. /c/creatorname). Allows us to attribute qualifying purchases to the correct creator and calculate their commission.',
                  duration: '30 days',
                  thirdParty: 'First-party (LovelyCrafts)',
                },
              ]}
            />

            <CookieCard
              category="Analytics"
              badge="Optional"
              badgeColor="#1d4ed8"
              badgeBg="#eff6ff"
              icon="📊"
              cookies={[
                {
                  name: 'Google Analytics (_ga, _gid, _ga_*)',
                  purpose: 'Collects anonymized data about how visitors use our website — such as pages visited, time spent, and traffic sources — to help us improve the platform.',
                  duration: '_ga: 2 years · _gid: 24 hours',
                  thirdParty: 'Google Analytics 4',
                },
              ]}
            />

            <CookieCard
              category="Advertising"
              badge="Optional"
              badgeColor="#7c3aed"
              badgeBg="#f5f3ff"
              icon="📢"
              cookies={[
                {
                  name: 'Google AdSense / DoubleClick',
                  purpose: 'Non-intrusive ads may be served on public discovery and blog pages to help support the platform. Google uses cookies to serve ads based on your prior visits to our website or other websites.',
                  duration: 'Varies (set by Google)',
                  thirdParty: 'Google AdSense',
                },
              ]}
            />

          </Section>

          <Section title="3. Third-Party Cookies">
            <p>
              Some cookies on our platform are set by trusted third-party services we use. These third parties have their own privacy and cookie policies which govern how they use such information:
            </p>
            <Table rows={[
              ['Google Firebase', 'Authentication & session management', 'https://firebase.google.com/support/privacy'],
              ['Google Analytics', 'Usage analytics', 'https://policies.google.com/technologies/cookies'],
              ['Google AdSense', 'Advertising', 'https://policies.google.com/technologies/ads'],
              ['Razorpay', 'Payment processing (checkout session)', 'https://razorpay.com/privacy/'],
              ['Cashfree Payments', 'Payment processing (checkout session)', 'https://www.cashfree.com/privacy-policy/'],
            ]} />
          </Section>

          <Section title="4. How to Manage & Disable Cookies">
            <p>You have several options to control or limit how cookies are used:</p>

            <ul style={{ marginTop: '0.75rem' }}>
              <li>
                <strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies via their Settings or Privacy menus. Note that blocking essential cookies may break login functionality and some features of the platform.
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <strong>Google Analytics Opt-Out:</strong> Install the{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899' }}>
                  Google Analytics Opt-out Browser Add-on ↗
                </a>{' '}
                to prevent your data from being included in Google Analytics reports.
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <strong>Google Ad Preferences:</strong> Customize personalized ad settings at{' '}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899' }}>
                  Google Ads Settings ↗
                </a>.
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <strong>Local Storage:</strong> You can clear browser local storage via your browser&apos;s developer tools (Settings → Privacy → Clear site data).
              </li>
            </ul>
          </Section>

          <Section title="5. Do Not Track">
            <p>
              Some browsers transmit a &quot;Do Not Track&quot; (DNT) signal to websites. At this time, {SITE_NAME} does not alter its data collection practices in response to DNT signals, as there is no universally accepted standard for how websites should respond. We will continue to monitor developments in this area.
            </p>
          </Section>

          <Section title="6. Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. When we do, we will revise the Effective Date at the top of this page. Continued use of {SITE_NAME} after such changes constitutes your acceptance of the updated policy.
            </p>
          </Section>

          <Section title="7. Contact Us">
            <p>If you have any questions or concerns about how we use cookies, please contact us:</p>
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.8, border: '1px solid #e5e7eb' }}>
              <strong>LovelyCrafts</strong><br />
              📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a><br />
              🌐 Website: <a href={SITE_URL} style={{ color: '#ec4899' }}>{SITE_URL}</a>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/privacy" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            🔐 Privacy Policy
          </Link>
          <Link href="/terms" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            📄 Terms of Service
          </Link>
          <Link href="/" className="btn-primary" style={{ fontSize: '0.9rem' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.75rem 1.5rem', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#9f1239', marginBottom: '1rem', marginTop: 0 }}>{title}</h2>
      <div style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function CookieCard({ category, badge, badgeColor, badgeBg, icon, cookies }) {
  return (
    <div style={{ border: '1px solid #f3f4f6', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{ padding: '0.75rem 1.25rem', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <strong style={{ fontSize: '0.95rem', color: '#111' }}>{category}</strong>
        <span style={{ marginLeft: 'auto', padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: badgeBg, color: badgeColor, border: `1px solid ${badgeColor}33` }}>{badge}</span>
      </div>
      {cookies.map((c, i) => (
        <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: i < cookies.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
            <strong style={{ fontSize: '0.875rem', color: '#111' }}>{c.name}</strong>
            {c.thirdParty && (
              <span style={{ fontSize: '0.75rem', color: '#43332b', background: '#f3f4f6', borderRadius: '4px', padding: '0.1rem 0.4rem' }}>{c.thirdParty}</span>
            )}
          </div>
          <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.875rem', color: '#374151' }}>{c.purpose}</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>⏱ Duration: {c.duration}</p>
        </div>
      ))}
    </div>
  );
}

function Table({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#fff1f2' }}>
            {['Service', 'Purpose', 'Cookie Policy'].map((h) => (
              <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#9f1239', fontWeight: 700, borderBottom: '2px solid #ffe4e6' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([service, purpose, link], i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{service}</td>
              <td style={{ padding: '0.6rem 0.75rem', color: '#6b7280' }}>{purpose}</td>
              <td style={{ padding: '0.6rem 0.75rem' }}>
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899', fontSize: '0.8rem' }}>View Policy ↗</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
