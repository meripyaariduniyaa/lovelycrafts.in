import { getAdminDb } from '@/lib/firebase-admin';

/** Resolve either the Firestore note id or a legacy custom_slug value. */
export async function resolveNoteSlug(slug) {
  if (typeof slug !== 'string' || !slug.trim()) return null;

  const trimmed = slug.trim();
  const decoded = decodeURIComponent(trimmed);

  const notes = getAdminDb().collection('notes');
  const directMatch = await notes.doc(trimmed).get();
  if (directMatch.exists) {
    return { id: directMatch.id, data: directMatch.data() };
  }
  if (decoded !== trimmed) {
    const directDecoded = await notes.doc(decoded).get();
    if (directDecoded.exists) {
      return { id: directDecoded.id, data: directDecoded.data() };
    }
  }

  const slugMatch = await notes.where('custom_slug', '==', trimmed).limit(1).get();
  if (!slugMatch.empty) {
    const match = slugMatch.docs[0];
    return { id: match.id, data: match.data() };
  }

  if (decoded !== trimmed) {
    const decodedSlugMatch = await notes.where('custom_slug', '==', decoded).limit(1).get();
    if (!decodedSlugMatch.empty) {
      const match = decodedSlugMatch.docs[0];
      return { id: match.id, data: match.data() };
    }
  }

  return null;
}
