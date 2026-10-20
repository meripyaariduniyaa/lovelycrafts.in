import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/seo';

export const metadata = {
  title: 'Refund Policy — LovelyCrafts',
  description:
    'LovelyCrafts Refund Policy: Digital gifts are non-refundable. Exceptions apply only for verified duplicate payments or technical failures where a note was not generated. Submit requests within 48 hours of purchase.',
  alternates: { canonical: `${SITE_URL}/refund` },
  openGraph: {
    title: 'Refund Policy | LovelyCrafts',
    description:
      'All purchases on LovelyCrafts are final. Refunds are processed only for duplicate payments or ungenerated pages, if reported within 48 hours.',
    url: `${SITE_URL}/refund`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    site: '@lovelycraftsin',
    title: 'Refund Policy | LovelyCrafts',
    description:
      'Refunds only for duplicate payments or ungenerated pages, within 48 hours of purchase.',
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 13, 2026';

export default function RefundPolicyPage() {
  return (
    <main className="shell lc-page-shell" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ color: '#ec4899', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <span style={{ fontWeight: 600 }}>Refund Policy</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💳</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#111', marginBottom: '0.5rem' }}>
            Refund Policy
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            <strong>Effective Date:</strong> {EFFECTIVE_DATE} &nbsp;|&nbsp;
            <strong>Platform:</strong> {SITE_NAME} ({SITE_URL})
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#43332b' }}>
            ⚠️ <strong>Please read carefully:</strong> Because {SITE_NAME} delivers instant digital experiences, all sales are generally final. Refunds are issued only in the two specific cases described below.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="1. General Policy — All Sales Are Final">
            <p>
              {SITE_NAME} provides <strong>instantly delivered digital gift experiences</strong>. Once a payment is completed and your interactive surprise is generated and accessible via its private link, the purchase is considered fulfilled and is <strong>non-refundable</strong>.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              We do not offer refunds for reasons such as change of mind, gifting to the wrong person, choosing a different template, or dissatisfaction with the personalized content you submitted.
            </p>
          </Section>

          <Section title="2. Eligible Refund Cases">
            <p style={{ marginBottom: '1rem' }}>
              We will process a full refund <strong>only</strong> in the following two verified scenarios:
            </p>

            <RefundCase
              icon="🔁"
              title="Case 1 — Duplicate / Double Payment"
              description="If your account was charged more than once for the same order due to a payment gateway error or network failure, and you did not receive multiple distinct gift links in return, you are entitled to a refund for the duplicate charge."
            />

            <RefundCase
              icon="⚠️"
              title="Case 2 — Gift Page Failed to Generate"
              description="If your payment was successfully deducted but no shareable gift link or experience page was created and delivered to you (i.e., a confirmed technical failure on our end), you are entitled to a full refund or a re-generation of your gift at no extra cost."
            />

            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#43332b' }}>
              ✅ <strong>In all other cases</strong>, purchases are final and no refund will be issued.
            </div>
          </Section>

          <Section title="3. How to Submit a Refund Request">
            <p>To request a refund under one of the eligible cases above, you must:</p>
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.75rem', lineHeight: 2 }}>
              <li>
                <strong>Submit your request within 48 hours of your purchase.</strong> Requests received after 48 hours will not be entertained, regardless of the reason.
              </li>
              <li>
                Email us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>
                  {CONTACT_EMAIL}
                </a>{' '}
                with the subject line: <strong>&quot;Refund Request — [Your Order ID]&quot;</strong>.
              </li>
              <li>
                Include your <strong>payment provider and payment/order ID</strong>, the email address used during checkout, and a brief description of the issue (duplicate charge or failed page generation).
              </li>
            </ol>

            <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#43332b' }}>
              ⏰ <strong>48-Hour Window:</strong> Refund requests must be submitted within <strong>48 hours</strong> of the original purchase timestamp. No exceptions will be made after this window, even for otherwise eligible cases.
            </div>
          </Section>

          <Section title="4. Refund Processing">
            <ul>
              <li>Once your request is verified, approved refunds are typically processed within <strong>5–7 business days</strong>.</li>
              <li>Refunds are credited back to the original payment method (UPI, card, net banking, wallet) through the provider used at checkout: Razorpay or Cashfree.</li>
              <li>We will send a confirmation email once the refund has been initiated.</li>
              <li>{SITE_NAME} does not issue cash refunds, gift cards, or credits in place of monetary refunds.</li>
            </ul>
          </Section>

          <Section title="5. Contact Us">
            <p>For refund inquiries, reach our support team:</p>
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.8, border: '1px solid #e5e7eb' }}>
              <strong>LovelyCrafts Support</strong><br />
              📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a><br />
              🌐 Website: <a href={SITE_URL} style={{ color: '#ec4899' }}>{SITE_URL}</a>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/terms" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            📄 Terms of Service
          </Link>
          <Link href="/shipping" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            📦 Shipping Policy
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

function RefundCase({ icon, title, description }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.25rem', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <strong style={{ display: 'block', color: '#9f1239', marginBottom: '0.25rem' }}>{title}</strong>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>{description}</p>
      </div>
    </div>
  );
}
