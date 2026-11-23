import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { weddingUser } from '@/lib/weddings';

function csvCell(value) { const text = String(value ?? '').replace(/^[\s]*([=+@-])/, "'$1"); return `"${text.replaceAll('"', '""')}"`; }

export async function GET(request, { params }) {
  try {
    const { id } = await params; const user = await weddingUser(request); const db = getAdminDb(); const invitation = await db.collection('wedding_invitations').doc(id).get();
    if (!invitation.exists || invitation.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 });
    const [snapshot, analytics] = await Promise.all([db.collection('wedding_rsvps').where('invitationId', '==', id).limit(1000).get(), db.collection('wedding_analytics').doc(id).get()]);
    const responses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null }));
    const summary = { views: analytics.exists ? Number(analytics.data().views) || 0 : 0, attending: responses.filter((r) => r.status === 'attending').length, declined: responses.filter((r) => r.status === 'declined').length, maybe: responses.filter((r) => r.status === 'maybe').length, guests: responses.filter((r) => r.status === 'attending').reduce((sum, r) => sum + (r.guestCount || 0), 0) };
    if (new URL(request.url).searchParams.get('format') === 'csv') {
      const lines = [['Name','Phone','Response','Guests','Events','Message','Submitted'], ...responses.map((r) => [r.guestName, r.phone, r.status, r.guestCount, (r.eventIds || []).join('; '), r.message, r.createdAt])];
      return new NextResponse(lines.map((line) => line.map(csvCell).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="wedding-rsvps-${id}.csv"`, 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ responses, summary });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to load RSVPs.' }, { status: error.status || 401 }); }
}
