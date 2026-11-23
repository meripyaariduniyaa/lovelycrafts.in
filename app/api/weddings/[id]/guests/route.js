import { randomBytes, createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { cleanString, weddingUser } from '@/lib/weddings';

async function ownedInvitation(id, user) { const ref = getAdminDb().collection('wedding_invitations').doc(id); const snap = await ref.get(); if (!snap.exists || snap.data().ownerId !== user.uid) return null; return { ref, data: snap.data() }; }

export async function GET(request, { params }) {
  try { const { id } = await params; const user = await weddingUser(request); if (!await ownedInvitation(id, user)) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 }); const snap = await getAdminDb().collection('wedding_guests').where('invitationId', '==', id).limit(500).get(); return NextResponse.json({ guests: snap.docs.map((doc) => { const { codeHash, ...guest } = doc.data(); return { id: doc.id, ...guest }; }) }); }
  catch (error) { return NextResponse.json({ error: error.message || 'Unable to load guest list.' }, { status: error.status || 401 }); }
}

export async function POST(request, { params }) {
  try { const { id } = await params; const user = await weddingUser(request); const invitation = await ownedInvitation(id, user); if (!invitation) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 }); if (invitation.data.status === 'archived') return NextResponse.json({ error: 'Archived invitations cannot add guests.' }, { status: 409 }); const body = await request.json(); const name = cleanString(body.name, 100); const phone = cleanString(body.phone, 30); if (!name) return NextResponse.json({ error: 'Guest name is required.' }, { status: 400 }); const code = randomBytes(24).toString('base64url'); const codeHash = createHash('sha256').update(code).digest('hex'); const ref = getAdminDb().collection('wedding_guests').doc(); await ref.set({ invitationId: id, name, phone: phone || null, codeHash, status: 'invited', createdAt: FieldValue.serverTimestamp() }); return NextResponse.json({ guest: { id: ref.id, name, phone, status: 'invited' }, code }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error.message || 'Unable to add guest.' }, { status: error.status || 400 }); }
}

export async function DELETE(request, { params }) {
  try { const { id } = await params; const user = await weddingUser(request); if (!await ownedInvitation(id, user)) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 }); const { guestId } = await request.json(); const ref = getAdminDb().collection('wedding_guests').doc(String(guestId || '')); const guest = await ref.get(); if (!guest.exists || guest.data().invitationId !== id) return NextResponse.json({ error: 'Guest not found.' }, { status: 404 }); await ref.delete(); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error.message || 'Unable to remove guest.' }, { status: error.status || 400 }); }
}
