import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { createWeddingRevision, publicWeddingData, weddingUser } from '@/lib/weddings';

export async function POST(request, { params }) {
  try {
    const { id } = await params; const user = await weddingUser(request); const db = getAdminDb(); const ref = db.collection('wedding_invitations').doc(id); const snap = await ref.get();
    if (!snap.exists || snap.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 });
    const invitation = snap.data();
    if (invitation.paymentStatus !== 'paid') return NextResponse.json({ error: 'Complete payment before publishing.' }, { status: 402 });
    if (!invitation.brideName || !invitation.groomName || !/^\d{4}-\d{2}-\d{2}$/.test(invitation.weddingDate || '') || !invitation.events?.some((event) => event.title || event.type)) return NextResponse.json({ error: 'Add both names, a valid wedding date, and at least one named celebration before publishing.' }, { status: 400 });
    const revisionId = await createWeddingRevision(db, id, publicWeddingData(invitation), user.uid);
    await ref.update({ status: 'published', publishedRevisionId: revisionId, publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ ok: true, invitation: { id, slug: invitation.slug, url: `/w/${invitation.slug}` } });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to publish invitation.' }, { status: error.status || 400 }); }
}
