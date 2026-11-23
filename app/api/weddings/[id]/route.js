import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { getWeddingTemplates, normalizeWeddingInput, serializeWedding, syncWeddingContentRecords, weddingUser } from '@/lib/weddings';

export async function GET(request, { params }) {
  try {
    const { id } = await params; const user = await weddingUser(request); const snap = await getAdminDb().collection('wedding_invitations').doc(id).get();
    if (!snap.exists || snap.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 });
    return NextResponse.json({ invitation: serializeWedding(snap) });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to load invitation.' }, { status: error.status || 401 }); }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params; const user = await weddingUser(request); const db = getAdminDb(); const ref = db.collection('wedding_invitations').doc(id); const snap = await ref.get();
    if (!snap.exists || snap.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 });
    const current = snap.data(); const body = await request.json(); const template = (await getWeddingTemplates(true)).find((item) => item.id === body.templateId) || null; const normalized = normalizeWeddingInput(body, current, template);
    await ref.update({ ...normalized, revision: (current.revision || 0) + 1, updatedAt: FieldValue.serverTimestamp() });
    await syncWeddingContentRecords(db, id, normalized);
    return NextResponse.json({ invitation: serializeWedding(await ref.get()) });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to save invitation.' }, { status: error.status || 400 }); }
}
