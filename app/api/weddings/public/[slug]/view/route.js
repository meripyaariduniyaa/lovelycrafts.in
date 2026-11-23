import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(request, { params }) {
  try { const { slug } = await params; const db = getAdminDb(); const matches = await db.collection('wedding_invitations').where('slug', '==', slug).limit(1).get(); if (matches.empty || matches.docs[0].data().status !== 'published') return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 }); await db.collection('wedding_analytics').doc(matches.docs[0].id).set({ invitationId: matches.docs[0].id, views: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true }); return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Unable to record view.' }, { status: 500 }); }
}
