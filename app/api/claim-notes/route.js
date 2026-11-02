import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const bearer = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!bearer) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(bearer);
    const body = await request.json().catch(() => ({}));
    const { deviceId, noteIds } = body;

    // Strict deviceId format validation (nanoid length 21-64)
    if (!deviceId || typeof deviceId !== 'string' || !/^[a-zA-Z0-9_-]{21,64}$/.test(deviceId)) {
      return NextResponse.json({ ok: true, message: 'Invalid or missing device ID' });
    }

    const adminDb = getAdminDb();
    
    // Find all notes created by this deviceId
    const snapshot = await adminDb.collection('notes').where('creator_uid', '==', deviceId).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ ok: true, message: 'No notes to claim' });
    }

    const batch = adminDb.batch();
    const allowedNoteIds = Array.isArray(noteIds) ? new Set(noteIds.filter(id => typeof id === 'string')) : null;
    let claimedCount = 0;
    
    snapshot.forEach(doc => {
      // If noteIds were specified by browser storage, scope to those specific notes
      if (allowedNoteIds && !allowedNoteIds.has(doc.id)) {
        return;
      }
      const data = doc.data();
      // Safety: Never steal notes that have already been claimed by a user account
      if (data.creator_uid && data.creator_uid !== deviceId) {
        return;
      }
      batch.update(doc.ref, {
        creator_uid: decoded.uid,
        claimed_at: new Date().toISOString(),
      });
      claimedCount++;
    });

    if (claimedCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({ ok: true, count: claimedCount });
  } catch (error) {
    console.error('Error claiming notes:', error);
    return NextResponse.json({ error: error.message || 'Unable to claim notes.' }, { status: 500 });
  }
}
