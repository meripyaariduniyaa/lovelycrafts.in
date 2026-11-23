import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { cleanString } from '@/lib/weddings';

export async function POST(request, { params }) {
  try {
    const { slug } = await params; const body = await request.json(); const db = getAdminDb();
    const found = await db.collection('wedding_invitations').where('slug', '==', slug).limit(1).get();
    if (found.empty || found.docs[0].data().status !== 'published') return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    const invitationDoc = found.docs[0]; const invitation = invitationDoc.data();
    if (!invitation.rsvpEnabled) return NextResponse.json({ error: 'RSVP is not available for this invitation.' }, { status: 403 });
    const name = cleanString(body.name, 100); const phone = cleanString(body.phone, 30); const status = ['attending', 'declined', 'maybe'].includes(body.status) ? body.status : '';
    const guestCount = Math.min(20, Math.max(1, Number.parseInt(body.guestCount, 10) || 1)); const message = cleanString(body.message, 500);
    const eventIds = Array.isArray(body.eventIds) ? body.eventIds.filter((id) => invitation.events?.some((event) => event.id === id)).slice(0, 50) : [];
    if (!name || !status || (invitation.rsvpPhoneRequired && !phone)) return NextResponse.json({ error: 'Please enter your name, attendance, and required contact details.' }, { status: 400 });
    let guestDoc = null; let guestHash = null;
    if (invitation.rsvpMode === 'restricted') {
      const guestCode = cleanString(body.guestCode, 100);
      if (!guestCode) return NextResponse.json({ error: 'Use the personal invitation link from the family to RSVP.' }, { status: 403 });
      guestHash = createHash('sha256').update(guestCode).digest('hex');
      const matches = await db.collection('wedding_guests').where('codeHash', '==', guestHash).limit(1).get();
      if (matches.empty || matches.docs[0].data().invitationId !== invitationDoc.id) return NextResponse.json({ error: 'This personal invitation link is invalid.' }, { status: 403 });
      guestDoc = matches.docs[0];
    }
    if (cleanString(body.website, 120)) return NextResponse.json({ ok: true }, { status: 201 });
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) {
      const limiterId = createHash('sha256').update(ip).digest('hex'); const limiterRef = db.collection('wedding_rsvp_rate_limits').doc(limiterId); const now = Date.now();
      const allowed = await db.runTransaction(async (tx) => { const previous = await tx.get(limiterRef); const data = previous.exists ? previous.data() : {}; const inWindow = Number(data.windowStartedAt) > now - 10 * 60 * 1000; if (inWindow && Number(data.count) >= 10) return false; tx.set(limiterRef, { windowStartedAt: inWindow ? data.windowStartedAt : now, count: inWindow ? Number(data.count || 0) + 1 : 1, updatedAt: FieldValue.serverTimestamp() }); return true; });
      if (!allowed) return NextResponse.json({ error: 'Please wait a little before submitting another RSVP.' }, { status: 429 });
    }
    const identity = `${invitationDoc.id}:${guestHash || (phone || name).toLowerCase()}`;
    const responseId = createHash('sha256').update(identity).digest('hex'); const responseRef = db.collection('wedding_rsvps').doc(responseId);
    const result = await db.runTransaction(async (tx) => {
      const previous = await tx.get(responseRef); if (previous.exists) return false;
      if (guestDoc) { const currentGuest = await tx.get(guestDoc.ref); if (!currentGuest.exists || currentGuest.data().status === 'responded') return false; tx.update(guestDoc.ref, { status: 'responded', responseId, respondedAt: FieldValue.serverTimestamp() }); }
      tx.create(responseRef, { invitationId: invitationDoc.id, guestName: name, phone: phone || null, status, guestCount: status === 'attending' ? guestCount : 0, eventIds, message, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      return true;
    });
    if (!result) return NextResponse.json({ error: 'An RSVP has already been received for these details.' }, { status: 409 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Unable to submit RSVP.' }, { status: 500 }); }
}
