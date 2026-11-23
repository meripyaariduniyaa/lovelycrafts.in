import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWeddingTemplates } from '@/lib/weddings';

export async function generateMetadata({ params }) { const { slug } = await params; const template = (await getWeddingTemplates(true)).find((item) => item.slug === slug); return { title: template ? `${template.name} | LovelyCrafts Shaadi` : 'Wedding Invitations | LovelyCrafts Shaadi', description: template?.description || 'Traditional Indian digital wedding invitations.' }; }

export default async function WeddingTemplateDetail({ params }) {
  const { slug } = await params; const template = (await getWeddingTemplates()).find((item) => item.slug === slug); if (!template) notFound();
  return <main className="shaadi-shell shaadi-template-detail"><div className="shaadi-detail-cover" style={{ '--template-primary': template.colors[0], '--template-gold': template.colors[1], '--template-paper': template.colors[2] }}><span>{template.motif}</span><small>{template.tradition} · {template.language}</small><h1>{template.name}</h1><p>Together with their families</p><strong>Bride &amp; Groom</strong></div><div className="shaadi-detail-content"><div className="shaadi-eyebrow">A family invitation, beautifully brought to life</div><h2>{template.description}</h2><p>Personalize your welcome, ceremony schedule, venue, photographs and RSVP. Preview your invitation before checkout.</p><Link className="shaadi-button" href={`/wedding-invitations/create?template=${template.id}`}>Create with this design</Link><p><Link className="shaadi-text-link" href="/wedding-invitations/templates">← All collections</Link></p></div></main>;
}
