import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/creator-club';

export async function requireUser(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new Error('Sign in required.');
  return getAdminAuth().verifyIdToken(token);
}

export async function requireAdmin(request) {
  const user = await requireUser(request);
  if (!user.email_verified) throw new Error('Email must be verified for admin access.');
  if (!isAdminEmail(user.email)) throw new Error('Admin access required.');
  return user;
}

export async function requireCreator(request, options = {}) {
  const user = await requireUser(request);
  if (!user.email_verified) throw new Error('Email must be verified for creator access.');
  const db = getAdminDb();
  
  // 1. Try lookup by user.uid
  let creatorSnap = await db.collection('creators').doc(user.uid).get();
  
  // 2. Fallback: Try lookup by user.email if doc ID doesn't match uid
  if (!creatorSnap.exists && user.email) {
    const byEmail = await db.collection('creators').where('email', '==', user.email.toLowerCase().trim()).limit(1).get();
    if (!byEmail.empty) {
      creatorSnap = byEmail.docs[0];
    }
  }

  if (!creatorSnap || !creatorSnap.exists || !['active', 'approved'].includes(creatorSnap.data().status)) {
    throw new Error('Creator access required.');
  }

  if (options.requireAdmin && !isAdminEmail(user.email)) {
    throw new Error('Admin access required.');
  }

  return { user, creator: { id: creatorSnap.id, ...creatorSnap.data() } };
}
