import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { publicWeddingData } from '@/lib/weddings';

export async function GET(request, { params }) {
  try {
    const { slug } = await params; const db = getAdminDb();
    const found = await db.collection('wedding_invitations').where('slug', '==', slug).limit(1).get();
    if (found.empty || found.docs[0].data().status !== 'published') return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    const doc = found.docs[0]; const invitation = doc.data();
    const revision = invitation.publishedRevisionId ? await db.collection('wedding_revisions').doc(invitation.publishedRevisionId).get() : null;
    const data = revision?.exists ? revision.data().data : invitation;
    return NextResponse.json({ invitation: { id: doc.id, ...publicWeddingData(data) } }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch { return NextResponse.json({ error: 'Unable to load invitation.' }, { status: 500 }); }
}
