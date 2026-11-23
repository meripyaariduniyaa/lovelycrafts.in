import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { createSlug, getWeddingTemplates, normalizeWeddingInput, serializeWedding, syncWeddingContentRecords, weddingUser } from '@/lib/weddings';

export async function GET(request) {
  try {
    const user = await weddingUser(request);
    const snapshot = await getAdminDb().collection('wedding_invitations').where('ownerId', '==', user.uid).limit(100).get();
    const invitations = snapshot.docs.map(serializeWedding).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    return NextResponse.json({ invitations });
  } catch (error) { return NextResponse.json({ error: error.message || 'Sign in to view invitations.' }, { status: error.status || 401 }); }
}

export async function POST(request) {
  try {
    const user = await weddingUser(request);
    const body = await request.json();
    const db = getAdminDb();
    const settings = await db.collection('wedding_settings').doc('current').get();
    if (!settings.exists || settings.data().enabled !== true) return NextResponse.json({ error: 'Wedding invitations are not available yet.' }, { status: 503 });
    const templates = await getWeddingTemplates();
    if (!templates.some((template) => template.id === body.templateId && template.enabled)) return NextResponse.json({ error: 'This invitation design is currently unavailable.' }, { status: 400 });
    const ref = db.collection('wedding_invitations').doc();
    const templateId = body.templateId;
    const template = templates.find((item) => item.id === templateId);
    const data = normalizeWeddingInput({ ...body, templateId }, {}, template);
    const invitation = { ...data, ownerId: user.uid, slug: createSlug(), status: 'draft', paymentStatus: 'unpaid', revision: 1, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
    await ref.create(invitation);
    await syncWeddingContentRecords(db, ref.id, invitation);
    return NextResponse.json({ invitation: serializeWedding(await ref.get()) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to create invitation.' }, { status: error.status || 400 }); }
}
