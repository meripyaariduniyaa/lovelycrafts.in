import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { weddingUser } from '@/lib/weddings';

export async function DELETE(request, { params }) {
  try { const { id, responseId } = await params; const user = await weddingUser(request); const db = getAdminDb(); const invitation = await db.collection('wedding_invitations').doc(id).get(); if (!invitation.exists || invitation.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 }); const ref = db.collection('wedding_rsvps').doc(responseId); const response = await ref.get(); if (!response.exists || response.data().invitationId !== id) return NextResponse.json({ error: 'RSVP not found.' }, { status: 404 }); const guestSnapshot = await db.collection('wedding_guests').where('responseId', '==', responseId).limit(1).get(); const batch = db.batch(); batch.delete(ref); if (!guestSnapshot.empty) batch.update(guestSnapshot.docs[0].ref, { status: 'invited', responseId: FieldValue.delete(), respondedAt: FieldValue.delete() }); await batch.commit(); await db.collection('wedding_audit_logs').add({ actorUid: user.uid, action: 'rsvp_removed', invitationId: id, responseId, createdAt: FieldValue.serverTimestamp() }); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error.message || 'Unable to remove RSVP.' }, { status: error.status || 401 }); }
}
