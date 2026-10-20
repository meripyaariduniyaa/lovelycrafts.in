import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/seo';

export const metadata = {
  title: 'Privacy Policy — How We Protect Your Data | LovelyCrafts',
  description: 'Read the LovelyCrafts Privacy Policy to understand how we collect, store, and protect your personal data, uploaded photos, user-generated content, and Creator Club affiliate data.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | LovelyCrafts',
    description: 'Read how LovelyCrafts collects, uses, and protects your personal data when you create, share personalized digital gift experiences, or participate in the Creator Club.',
    url: `${SITE_URL}/privacy`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    site: '@lovelycraftsin',
    title: 'Privacy Policy | LovelyCrafts',
    description: 'How LovelyCrafts protects your personal data, user-generated content, and Creator Club details.',
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 8, 2026';

export default function PrivacyPolicyPage() {
  return (
    <main className="shell lc-page-shell" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ color: '#ec4899', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <span style={{ fontWeight: 600 }}>Privacy Policy</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#111', marginBottom: '0.5rem' }}>Privacy Policy</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            <strong>Effective Date:</strong> {EFFECTIVE_DATE} &nbsp;|&nbsp;
            <strong>Platform:</strong> {SITE_NAME} ({SITE_URL})
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#43332b' }}>
            ⚠️ <strong>Important:</strong> Please read this policy carefully before using {SITE_NAME} or applying for the Creator Club. By accessing or using our service, you agree to the practices described below.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="1. Who We Are">
            <p>{SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is a digital gifting and interactive surprise platform operated from India. We empower users (&ldquo;you&rdquo;) to create personalized, interactive digital gift experiences for personal use, share them with recipients via private links, and provide a partner program (&ldquo;Creator Club&rdquo;) for creative collaborators.</p>
            <p style={{ marginTop: '0.75rem' }}>For privacy-related queries, contact us at: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a></p>
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>2.1 Information You Provide as a Gift Creator</SubHeading>
            <ul>
              <li><strong>Account Information:</strong> When you sign in via Google OAuth, we collect your name, email address, and Google profile picture provided by Google.</li>
              <li><strong>Gift Content:</strong> Recipient names, custom messages, promises, event dates, and other personal text entered into our templates.</li>
              <li><strong>Photos & Media:</strong> Images you upload to personalize gifts are securely stored on Cloudinary, our third-party media delivery infrastructure.</li>
              <li><strong>Voice Notes:</strong> Audio recordings optionally added to surprises are stored securely for interactive playback by your recipient.</li>
              <li><strong>Payment Information:</strong> Transactions are securely processed via Razorpay or Cashfree. If you choose Cashfree, the mobile number you enter is sent to Cashfree to initiate checkout and is not stored in your gift record. We do not store card numbers, UPI PINs, or net banking credentials on our servers.</li>
              <li><strong>Custom Share Links:</strong> Any customized short link or slug you choose for your note.</li>
            </ul>

            <SubHeading>2.2 Information Collected for the Creator Club (Affiliates & Partners)</SubHeading>
            <ul>
              <li><strong>Creator Profile Data:</strong> Creator name, handle, public Instagram / YouTube URLs, follower counts, and bio submitted in applications.</li>
              <li><strong>Payout & Financial Details:</strong> UPI ID (e.g. name@upi) or bank account details submitted by approved creators exclusively for processing commission payouts.</li>
              <li><strong>Referral Performance Data:</strong> Click counts, coupon redemption counts, commission earnings, and payout transaction history.</li>
            </ul>

            <SubHeading>2.3 Information Collected Automatically & Cookies</SubHeading>
            <ul>
              <li><strong>Referral & Attribution Cookie (<code>lp_ref</code>):</strong> When a user visits via a creator referral link (e.g. <code>/c/creatorname</code>), a secure tracking cookie with a 30-day lifespan is stored to attribute qualifying purchases to that creator.</li>
              <li><strong>Device Identifier:</strong> An anonymous token in browser local storage associates unpaid drafts with your device for up to 90 days.</li>
              <li><strong>Usage & Server Logs:</strong> Standard server logs including IP address, browser user-agent, referring URL, and page interactions for fraud prevention and performance monitoring.</li>
              <li><strong>Google AdSense & Cookies:</strong> Non-intrusive ads may be served on public discovery pages. You can customize ad settings at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899' }}>Google Ads Settings</a>.</li>
            </ul>
          </Section>

          <Section title="3. AI Assistant & Message Generator">
            <p>LovelyCrafts offers Anya, an optional AI gift helper. When you chat with Anya, the recent chat text you submit is sent to Hugging Face Inference Providers to generate a response. Anya receives the chat text and public catalog and policy information only; it does not receive private gift notes, photos, account information, or order records. Anya conversations are held in your browser session and are not saved to a LovelyCrafts chat-history database. Hugging Face processes requests under its own <a href="https://huggingface.co/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899' }}>privacy policy</a>. LovelyCrafts does not use your private messages or photos to train third-party models.</p>
          </Section>

          <Section title="4. How We Use Your Information">
            <ul>
              <li>To create, host, encrypt, and deliver your interactive digital surprise experiences.</li>
              <li>To process payments and verify unlock status via Razorpay or Cashfree.</li>
              <li>To track creator referrals, calculate tiered commissions (10% to 18%), and disburse payouts.</li>
              <li>To authenticate users and creators via Google Sign-In (Firebase Authentication).</li>
              <li>To maintain platform security, prevent fraudulent multi-accounting, and enforce terms.</li>
            </ul>
            <p style={{ marginTop: '0.75rem', color: '#374151' }}>We <strong>never</strong> sell, rent, or trade personal data or private gift contents to third parties for external marketing purposes.</p>
          </Section>

          <Section title="5. Data Retention & Expiry">
            <ul>
              <li><strong>Gift Notes:</strong> Created gift experiences remain accessible via their private link for <strong>90 days</strong> from creation unless renewed or permanently saved.</li>
              <li><strong>Unpaid Drafts:</strong> Notes not unlocked within 90 days are automatically purged.</li>
              <li><strong>Creator Accounts:</strong> Creator Club profiles and referral records are maintained while the creator remains active in the program.</li>
              <li><strong>Financial & Payment Records:</strong> Transaction logs are retained in compliance with Indian financial and tax laws (minimum 5 years).</li>
            </ul>
          </Section>

          <Section title="6. Third-Party Service Providers">
            <p>We work with industry-leading third-party services that comply with strict data security standards:</p>
            <Table rows={[
              ['Razorpay', 'Payment processing and UPI verification', 'https://razorpay.com/privacy/'],
              ['Cashfree Payments', 'Payment processing and payment status verification', 'https://www.cashfree.com/privacy-policy/'],
              ['Firebase (Google)', 'Authentication and cloud database', 'https://firebase.google.com/support/privacy'],
              ['Cloudinary', 'Encrypted media storage & CDN delivery', 'https://cloudinary.com/privacy'],
              ['Hugging Face', 'AI gift-assistant inference', 'https://huggingface.co/privacy'],
              ['Google AdSense', 'Monetization on public pages', 'https://policies.google.com/technologies/ads'],
              ['Vercel', 'Edge hosting and compute infrastructure', 'https://vercel.com/legal/privacy-policy'],
            ]} />
          </Section>

          <Section title="7. Data Security">
            <p>We apply robust technical and organizational security measures:</p>
            <ul>
              <li>All web traffic is transmitted strictly over HTTPS/TLS 1.3 encryption.</li>
              <li>Access to private notes is gated by Firebase Firestore security rules and unique unguessable slugs.</li>
              <li>Payment credentials never touch our servers; payment details are handled by the selected payment provider.</li>
            </ul>
          </Section>

          <Section title="8. Your Rights">
            <p>Under Indian data protection standards, you have the right to request access to your personal data, request correction of inaccurate data, or request complete deletion of your account and notes by writing to <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a>.</p>
          </Section>

          <Section title="9. Contact Us">
            <p>If you have any questions or feedback regarding this Privacy Policy, please contact our privacy desk:</p>
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.8, border: '1px solid #e5e7eb' }}>
              <strong>LovelyCrafts</strong><br />
              📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a><br />
              🌐 Website: <a href={SITE_URL} style={{ color: '#ec4899' }}>{SITE_URL}</a>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/terms" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            📄 Read Terms of Service
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

function SubHeading({ children }) {
  return <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: '1rem 0 0.4rem 0' }}>{children}</h3>;
}

function Table({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#fff1f2' }}>
            {['Service', 'Purpose', 'Privacy Policy'].map((h) => (
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
