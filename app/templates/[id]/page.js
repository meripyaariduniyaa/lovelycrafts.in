import Link from 'next/link';
import { notFound } from 'next/navigation';
import { templates } from '@/lib/templates';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';
import PreviewDemoButton from '@/components/PreviewDemoButton';

export async function generateStaticParams() {
  return templates.map((t) => ({
    id: t.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const template = templates.find((t) => t.id === id);

  if (!template) {
    return { title: 'Template Not Found | LovelyCrafts', robots: { index: false } };
  }

  const canonicalUrl = `${SITE_URL}/templates/${template.id}`;
  const title = `${template.title} — Interactive Digital ${template.bestFor[0] || 'Gift'} Experience | ${SITE_NAME}`;
  const description = `${template.description} Personalize with your own photos, heartfelt messages, and share a private link instantly on WhatsApp. Takes only 3 minutes to create.`;
  const keywords = [
    ...template.bestFor,
    template.title,
    'digital gift India',
    'personalized digital card',
    'send on WhatsApp',
    'online surprise link',
    'LovelyCrafts',
    'interactive greeting India',
    `${template.title.toLowerCase()} online India`,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${template.title} — ${SITE_NAME}` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@lovelycraftsin',
      creator: '@lovelycraftsin',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default async function TemplateDetailPage({ params }) {
  const { id } = await params;
  const template = templates.find((t) => t.id === id);

  if (!template) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/templates/${template.id}`;

  // Use CreativeWork schema (accurate for digital experiences, not a physical product)
  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: template.title,
    description: template.description,
    url: canonicalUrl,
    inLanguage: 'en-IN',
    datePublished: '2026-08-09',
    dateModified: '2026-08-28',
    audience: {
      '@type': 'PeopleAudience',
      audienceType: template.bestFor.join(', '),
      geographicArea: {
        '@type': 'Country',
        name: 'India',
      },
    },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: template.price || 199,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    },
  };

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Templates', item: `${SITE_URL}/templates` },
      { '@type': 'ListItem', position: 3, name: template.title, item: canonicalUrl },
    ],
  };

  return (
    <main className="shell lc-page-shell">
      <JsonLd data={creativeWorkSchema} />
      <JsonLd data={breadcrumbsLd} />

      <div className="main-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
          <Link href="/" style={{ color: '#ec4899', textDecoration: 'none' }}>Home</Link>
          {' > '}
          <Link href="/templates" style={{ color: '#ec4899', textDecoration: 'none' }}>Templates</Link>
          {' > '}
          <span style={{ fontWeight: 600 }}>{template.title}</span>
        </nav>

        {/* Hero Section */}
        <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '2.5rem 2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{template.icon}</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', marginBottom: '0.75rem', color: '#111' }}>
            {template.title}
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {template.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
            {template.bestFor.map((tag) => (
              <span key={tag} className="template-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem', background: '#ffe4e6', color: '#a64036' }}>
                ✨ {tag}
              </span>
            ))}
            <span className="template-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem', background: '#f3f4f6', color: '#43332b' }}>
              ⏱ {template.time} setup time
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={`/create?template=${template.id}`} className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}>
              ✨ Create {template.title} Now
            </Link>
            <PreviewDemoButton templateId={template.id} className="btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              👁️ Play Live Interactive Demo
            </PreviewDemoButton>
            <Link href="/templates" className="btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}>
              ← View All Templates
            </Link>
          </div>
        </div>

        {/* Details & Photo Requirements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#e11d48' }}>📸 Photo Requirements</h2>
            <p style={{ fontSize: '0.95rem', color: '#444', marginBottom: '0.5rem' }}>
              <strong>Recommended photos:</strong> {template.photoRequirement.recommended} (Min {template.photoRequirement.min}, Max {template.photoRequirement.max})
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic', lineHeight: 1.5 }}>
              💡 {template.photoRequirement.tip}
            </p>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#e11d48' }}>📝 What You&apos;ll Need</h2>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 1.7 }}>
              {(template.detailsNeeded || template.steps?.map((s) => s.label) || []).map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#111' }}>⚡ How It Works</h2>
          <ol style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 2 }}>
            <li>Choose the <strong>{template.title}</strong> experience</li>
            <li>Add the recipient&apos;s name and your personalized message</li>
            <li>Upload {template.photoRequirement.recommended} cherished memory photos</li>
            <li>Customize any template-specific details (promises, dates, names)</li>
            <li>Get a private shareable link — send on WhatsApp in seconds</li>
          </ol>
        </div>

        {/* Sample Prompt Ideas */}
        {template.prompts && template.prompts.length > 0 && (
          <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#111' }}>💬 Sample Message Prompts & Ideas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {template.prompts.map((prompt, i) => (
                <div key={i} style={{ background: '#fff1f2', padding: '0.9rem 1.2rem', borderRadius: '0.75rem', borderLeft: '4px solid #a64036', fontSize: '0.95rem', color: '#43332b', fontStyle: 'italic' }}>
                  &ldquo;{prompt}&rdquo;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creator Tip */}
        {template.tips && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem 1.5rem', borderRadius: '1rem', marginTop: '2rem', color: '#43332b', fontSize: '0.95rem' }}>
            <strong>💡 Creator Tip:</strong> {template.tips}
          </div>
        )}

        {/* Other Templates */}
        <div style={{ background: '#fff', padding: '1.8rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#111' }}>🎁 Explore Other Popular Experiences</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {templates
              .filter((t) => t.id !== template.id)
              .slice(0, 6)
              .map((other) => (
                <Link key={other.id} href={`/templates/${other.id}`} className="template-tag" style={{ textDecoration: 'none', fontSize: '0.88rem', padding: '0.45rem 0.9rem', background: '#fff1f2', color: '#a64036', borderRadius: '999px', fontWeight: 600 }}>
                  {other.icon} {other.title}
                </Link>
              ))}
            <Link href="/templates" className="template-tag" style={{ textDecoration: 'none', fontSize: '0.88rem', padding: '0.45rem 0.9rem', background: '#f3f4f6', color: '#43332b', borderRadius: '999px', fontWeight: 600 }}>
              ✨ View All Templates →
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '3rem', padding: '2.5rem', background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', borderRadius: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#9f1239' }}>Ready to send a memory they&apos;ll cherish forever?</h2>
          <p style={{ color: '#be123c', marginBottom: '1.5rem' }}>Takes less than 3 minutes to customize and share securely on WhatsApp or message.</p>
          <Link href={`/create?template=${template.id}`} className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
            Make {template.title} →
          </Link>
        </div>
      </div>
    </main>
  );
}
