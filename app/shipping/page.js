import Link from 'next/link';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/seo';

export const metadata = {
  title: 'Shipping Policy — LovelyCrafts',
  description:
    'LovelyCrafts Shipping Policy: All our gifts are 100% digital and delivered instantly via a private link — no physical shipping required.',
  alternates: { canonical: `${SITE_URL}/shipping` },
  openGraph: {
    title: 'Shipping Policy | LovelyCrafts',
    description:
      'LovelyCrafts gifts are digital — no physical shipping. Your personalized surprise is ready the moment payment is complete.',
    url: `${SITE_URL}/shipping`,
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary',
    site: '@lovelycraftsin',
    title: 'Shipping Policy | LovelyCrafts',
    description: 'No shipping needed. All LovelyCrafts gifts are digital and delivered instantly via a private link.',
  },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = 'September 13, 2026';

export default function ShippingPolicyPage() {
  return (
    <main className="shell lc-page-shell" style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ color: '#ec4899', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <span style={{ fontWeight: 600 }}>Shipping Policy</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#111', marginBottom: '0.5rem' }}>
            Shipping Policy
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            <strong>Effective Date:</strong> {EFFECTIVE_DATE} &nbsp;|&nbsp;
            <strong>Platform:</strong> {SITE_NAME} ({SITE_URL})
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', fontSize: '0.9rem', color: '#43332b' }}>
            ✅ <strong>Good news!</strong> {SITE_NAME} delivers 100% digital gifts — no physical shipping is required. Your surprise is ready the moment payment is confirmed.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <Section title="1. We Are a Digital-Only Platform">
            <p>
              {SITE_NAME} is exclusively an <strong>online digital gifting platform</strong>. Every product we offer — interactive birthday cards, proposals, anniversary experiences, apology cards, arcade games, and all other templates — is a <strong>digital experience delivered via a private web link</strong>.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              No physical item, printed card, package, or parcel is ever dispatched. There is <strong>no shipping address, no courier, and no delivery wait time</strong>.
            </p>
          </Section>

          <Section title="2. How Your Gift Is Delivered">
            <p style={{ marginBottom: '1rem' }}>Here is how the delivery process works:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <DeliveryStep step="1" icon="🎨" label="You personalize" description="Choose a template, add photos, write your message, and optionally record a voice note." />
              <DeliveryStep step="2" icon="💳" label="You pay" description="Complete secure checkout via Razorpay or Cashfree (UPI, card, net banking, wallet)." />
              <DeliveryStep step="3" icon="⚡" label="Instant generation" description="Your interactive gift page is generated immediately after payment is confirmed — no waiting." />
              <DeliveryStep step="4" icon="🔗" label="Share the link" description="You receive a private, shareable link. Send it to your recipient on WhatsApp, Instagram, or any messaging platform." />
              <DeliveryStep step="5" icon="🎁" label="They open it anywhere" description="Your recipient opens the link on any device, anywhere in the world, and experiences the surprise in real time." />
            </div>
          </Section>

          <Section title="3. No Shipping Fees">
            <p>
              Because all gifts are digital, there are absolutely <strong>no shipping charges, delivery fees, or handling costs</strong> ever added to your order. The price you see at checkout is the total you pay — nothing more.
            </p>
          </Section>

          <Section title="4. Availability">
            <p>
              Since our gifts are digital, they are available <strong>worldwide, 24/7</strong>, with no geographical restrictions. Whether your recipient is in the same city or across the globe, they can receive and open their surprise instantly.
            </p>
          </Section>

          <Section title="5. Contact Us">
            <p>If you have any questions about how your gift is delivered, we are happy to help:</p>
            <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.8, border: '1px solid #e5e7eb' }}>
              <strong>LovelyCrafts Support</strong><br />
              📧 Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#ec4899' }}>{CONTACT_EMAIL}</a><br />
              🌐 Website: <a href={SITE_URL} style={{ color: '#ec4899' }}>{SITE_URL}</a>
            </div>
          </Section>

        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/refund" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            💳 Refund Policy
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

function DeliveryStep({ step, icon, label, description }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1.25rem', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '0.75rem' }}>
      <div style={{ width: '28px', height: '28px', background: '#ec4899', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
        {step}
      </div>
      <div>
        <strong style={{ color: '#9f1239' }}>{icon} {label}</strong>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>{description}</p>
      </div>
    </div>
  );
}
