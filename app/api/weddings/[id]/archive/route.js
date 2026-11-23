import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { weddingUser } from '@/lib/weddings';

export async function POST(request, { params }) {
  try { const { id } = await params; const user = await weddingUser(request); const ref = getAdminDb().collection('wedding_invitations').doc(id); const snap = await ref.get(); if (!snap.exists || snap.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 }); await ref.update({ status: 'archived', updatedAt: FieldValue.serverTimestamp() }); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error.message || 'Unable to archive invitation.' }, { status: error.status || 401 }); }
}
