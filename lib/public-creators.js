import { getAdminDb } from '@/lib/firebase-admin';
import { normalizeSlug } from '@/lib/creator-club';

export async function getPublicCreatorBySlug(slug) {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  const snapshot = await getAdminDb().collection('creators').where('slug', '==', normalized).limit(1).get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  if (!['active', 'approved'].includes(data.status)) return null;
  return {
    name: String(data.name || normalized),
    slug: normalized,
    bio: typeof data.bio === 'string' ? data.bio.trim() : '',
  };
}

export async function getPublicCreatorSitemapEntries() {
  const snapshot = await getAdminDb().collection('creators').where('status', 'in', ['active', 'approved']).get();
  return snapshot.docs.flatMap((doc) => {
    const data = doc.data();
    const slug = normalizeSlug(data.slug);
    if (!slug) return [];
    const modified = data.updated_at?.toDate?.() || data.updatedAt?.toDate?.() || null;
    return [{ slug, ...(modified ? { lastModified: modified } : {}) }];
  });
}
