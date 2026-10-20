import { getAdminDb } from '@/lib/firebase-admin';

/** Resolve either the Firestore note id or a legacy custom_slug value. */
export async function resolveNoteSlug(slug) {
  if (typeof slug !== 'string' || !slug.trim()) return null;

  const notes = getAdminDb().collection('notes');
  const directMatch = await notes.doc(slug).get();
  if (directMatch.exists) {
    return { id: directMatch.id, data: directMatch.data() };
  }

  const slugMatch = await notes.where('custom_slug', '==', slug).limit(1).get();
  if (slugMatch.empty) return null;

  const match = slugMatch.docs[0];
  return { id: match.id, data: match.data() };
}
