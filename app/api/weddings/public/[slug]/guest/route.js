import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  try { const { slug } = await params; const code = new URL(request.url).searchParams.get('code') || ''; if (!code || code.length > 100) return NextResponse.json({ error: 'Personal invitation not found.' }, { status: 404 }); const db = getAdminDb(); const invitations = await db.collection('wedding_invitations').where('slug', '==', slug).limit(1).get(); if (invitations.empty || invitations.docs[0].data().status !== 'published' || invitations.docs[0].data().rsvpMode !== 'restricted') return NextResponse.json({ error: 'Personal invitation not found.' }, { status: 404 }); const tokenHash = createHash('sha256').update(code).digest('hex'); const guests = await db.collection('wedding_guests').where('codeHash', '==', tokenHash).limit(1).get(); if (guests.empty || guests.docs[0].data().invitationId !== invitations.docs[0].id) return NextResponse.json({ error: 'Personal invitation not found.' }, { status: 404 }); return NextResponse.json({ name: guests.docs[0].data().name, status: guests.docs[0].data().status }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Unable to verify this personal invitation.' }, { status: 500 }); }
}
