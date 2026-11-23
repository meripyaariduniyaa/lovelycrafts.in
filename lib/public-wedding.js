import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase-admin';
import { publicWeddingData } from '@/lib/weddings';

export async function getPublishedWedding(slug) {
  const db = getAdminDb(); const matches = await db.collection('wedding_invitations').where('slug', '==', slug).limit(1).get();
  if (matches.empty || matches.docs[0].data().status !== 'published') notFound();
  const doc = matches.docs[0]; const invitation = doc.data();
  const revision = invitation.publishedRevisionId ? await db.collection('wedding_revisions').doc(invitation.publishedRevisionId).get() : null;
  const source = revision?.exists ? revision.data().data : invitation;
  return { id: doc.id, ...publicWeddingData(source), slug: invitation.slug, searchable: invitation.searchable === true };
}
