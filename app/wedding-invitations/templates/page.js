import Link from 'next/link';
import { getWeddingTemplates } from '@/lib/weddings';

export const metadata = { title: 'Indian Wedding Invitation Designs | LovelyCrafts Shaadi', description: 'Browse traditional Indian digital wedding invitations for Hindu, Gujarati, Muslim, Sikh, Christian and Jain celebrations.' };

export default async function WeddingTemplatesPage() {
  const WEDDING_TEMPLATES = await getWeddingTemplates();
  return <main className="shaadi-shell"><div className="shaadi-eyebrow">The wedding collections</div><h1 className="shaadi-title">A design rooted in your celebration</h1><p className="shaadi-copy">Each collection shares one easy invitation builder, with its own color, ornament and cultural character.</p><div className="shaadi-template-grid">{WEDDING_TEMPLATES.map((template) => <article key={template.id} className="shaadi-template-card" style={{ '--template-primary': template.colors[0], '--template-gold': template.colors[1], '--template-paper': template.colors[2] }}><div className="shaadi-template-art"><span>{template.motif}</span><small>{template.tradition}</small></div><div><h2>{template.name}</h2><p>{template.description}</p><div className="shaadi-template-meta">{template.language} · Family welcome · Ceremonies · RSVP</div><Link className="shaadi-text-link" href={`/wedding-invitations/templates/${template.slug}`}>See this collection →</Link></div></article>)}</div><div className="shaadi-center-cta"><Link className="shaadi-button" href="/wedding-invitations/create">Create your invitation</Link></div></main>;
}
