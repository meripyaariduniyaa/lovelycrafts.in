import { ImageResponse } from 'next/og';
import { getPublishedWedding } from '@/lib/public-wedding';

export const alt = 'Wedding invitation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({ params }) {
  const { slug } = await params; const invitation = await getPublishedWedding(slug); const accent = invitation.appearance?.accent || '#bd914b'; const paper = invitation.appearance?.background || '#fff8e9';
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle at 50% 45%, ${paper}, #f1dfbf)`, color: '#432f24', border: `26px solid ${accent}`, outline: '2px solid #fff4d8', outlineOffset: '-42px', fontFamily: 'Georgia, serif', textAlign: 'center' }}><div style={{ color: accent, fontSize: 64, marginBottom: 22 }}>✦</div><div style={{ fontSize: 24, letterSpacing: 8, textTransform: 'uppercase', color: '#766144' }}>Together with their families</div><div style={{ fontSize: 74, marginTop: 28 }}>{invitation.brideName} &amp; {invitation.groomName}</div><div style={{ fontSize: 30, marginTop: 24 }}>{invitation.weddingDate || 'A wedding celebration'}</div><div style={{ color: accent, fontSize: 24, marginTop: 38 }}>LovelyCrafts Shaadi</div></div>, size);
}
