import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/seo';

export const metadata = {
  title: 'Terms of Service — Your Rights & Our Guidelines | LovelyCrafts',
  description: 'Read the LovelyCrafts Terms of Service — user rights, payment terms, refund policy, Creator Club affiliate program rules, and content guidelines.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms of Service | LovelyCrafts',
    description: 'LovelyCrafts terms covering your rights, payment policy, refunds, Creator Club rules, and content guidelines.',
    url: `${SITE_URL}/terms`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    site: '@lovelycraftsin',
    title: 'Terms of Service | LovelyCrafts',
    description: 'LovelyCrafts terms: user rights, payment, refunds, Creator Club terms, and content guidelines.',
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 8, 2026';
const PRICE = '₹199';
const NOTE_EXPIRY_DAYS = 90;

export default function TermsPage() {
  return (
    <main className="shell" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ color: '#ec4899', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <span style={{ fontWeight: 600 }}>Terms of Service</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#111', marginBottom: '0.5rem' }}>Terms of Service</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            <strong>Effective Date:</strong> {EFFECTIVE_DATE} &nbsp;|&nbsp;
            <strong>Platform:</strong> {SITE_NAME} ({SITE_URL})
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#9f1239' }}>
            📌 By accessing or using {SITE_NAME} or joining the Creator Club, you agree to be bound by these Terms.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="1. Acceptance of Terms">
            <p>These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of {SITE_NAME}, its interactive gifting templates, and the Creator Club affiliate program (&ldquo;Service&rdquo;). These Terms constitute a legally binding agreement between you (&ldquo;User&rdquo; or &ldquo;Creator&rdquo;) and {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).</p>
            <p style={{ marginTop: '0.75rem' }}>By creating a gift experience, participating as a creator, making a payment, or browsing our catalog, you confirm that you are at least 13 years old and have the legal capacity to enter into binding agreements.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>{SITE_NAME} is an online digital gifting platform that enables users to:</p>
            <ul>
              <li>Create personalized, interactive digital gift experiences (&ldquo;Notes&rdquo;) using pre-built animated templates.</li>
              <li>Upload personal photos, voice notes, and heartfelt text.</li>
              <li>Generate private shareable links to deliver surprises directly on WhatsApp or social channels.</li>
              <li>Access and manage created Notes for up to {NOTE_EXPIRY_DAYS} days.</li>
            </ul>
          </Section>

          <Section title="3. Payments, Pricing & Non-Refundable Nature">
            <SubHeading>3.1 Standard Pricing</SubHeading>
            <p>Interactive templates are priced as indicated at checkout prior to payment. Promotional creator coupons or site discount codes can be applied prior to completing the order.</p>

            <SubHeading>3.2 Razorpay Processing</SubHeading>
            <p>All payments are processed securely via <strong>Razorpay</strong>. We do not store banking credentials or card details on our infrastructure.</p>

            <SubHeading>3.3 Refund Policy</SubHeading>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.75rem', padding: '1rem 1.25rem', margin: '0.75rem 0', fontSize: '0.9rem', color: '#92400e' }}>
              ⚠️ <strong>Digital Instant Access:</strong> Because our interactive surprises are customized instant digital goods immediately delivered via active URLs, all completed purchases are final and non-refundable.
            </div>
            <p>Exceptions are made solely for verified duplicate billing or technical failures where a note failed to generate, provided notice is emailed to <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a> within 48 hours of payment.</p>
          </Section>

          <Section title="4. Creator Club & Affiliate Program Terms">
            <SubHeading>4.1 Program Overview</SubHeading>
            <p>The LovelyCrafts Creator Club enables content creators and influencers to earn referral commissions by sharing personalized referral links (e.g. <code>/c/creatorname</code>) and branded audience coupon codes.</p>

            <SubHeading>4.2 Commission Tiers & Attribution</SubHeading>
            <ul>
              <li><strong>Commission Rates:</strong> Commissions range from <strong>10%</strong> (Starter tier) up to <strong>18%</strong> (Elite tier) based on qualifying paid referrals.</li>
              <li><strong>30-Day Attribution Window:</strong> Referral clicks are tracked for 30 consecutive days via secure attribution cookies (<code>lp_ref</code>). Orders placed within 30 days of a creator link click or via their coupon code are credited to the creator.</li>
            </ul>

            <SubHeading>4.3 Payouts & Minimum Threshold</SubHeading>
            <ul>
              <li>The minimum creator payout balance is <strong>₹500</strong>.</li>
              <li>Payouts are disbursed directly to the creator&apos;s verified UPI ID or Indian bank account within 3 to 5 business days upon reaching the threshold.</li>
              <li>Creators are solely responsible for providing accurate UPI information and any applicable personal income tax declarations.</li>
            </ul>

            <SubHeading>4.4 Prohibited Affiliate Practices</SubHeading>
            <p>Creators agree not to engage in self-referrals (using one&apos;s own link to purchase for oneself), spamming public forums, running misleading advertising, or bidding on brand trademarks without permission. Violation will result in immediate termination and forfeiture of unpaid balances.</p>
          </Section>

          <Section title="5. User-Generated Content & Guidelines">
            <p>You retain ownership of the photos, text, and voice notes you upload. You agree not to submit content that is defamatory, obscene, infringing on copyright, or harassing.</p>
            <p style={{ marginTop: '0.75rem' }}>All created Notes remain accessible for <strong>{NOTE_EXPIRY_DAYS} days</strong> from creation, after which they are permanently deleted from our active database.</p>
          </Section>

          <Section title="6. Intellectual Property">
            <p>All animations, 3D gift boxes, game mechanics, code, audio libraries, and visual styling of {SITE_NAME} are the proprietary intellectual property of {SITE_NAME}. Unauthorized copying or commercial duplication is strictly prohibited.</p>
          </Section>

          <Section title="7. Governing Law & Dispute Resolution">
            <p>These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in India.</p>
          </Section>

          <Section title="8. Contact Us">
            <p>For questions or feedback regarding these Terms of Service, contact us:</p>
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.8, border: '1px solid #e5e7eb' }}>
              <strong>LovelyCrafts</strong><br />
              📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a><br />
              🌐 Website: <a href={SITE_URL} style={{ color: '#ec4899' }}>{SITE_URL}</a>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/privacy" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            🔐 Read Privacy Policy
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
