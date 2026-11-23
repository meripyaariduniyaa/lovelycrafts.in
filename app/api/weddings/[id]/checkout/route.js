import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { weddingUser } from '@/lib/weddings';

export async function POST(request, { params }) {
  try {
    const { id } = await params; const user = await weddingUser(request); const db = getAdminDb();
    const [invitationSnap, settingsSnap] = await Promise.all([db.collection('wedding_invitations').doc(id).get(), db.collection('wedding_settings').doc('current').get()]);
    if (!invitationSnap.exists || invitationSnap.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 });
    const invitation = invitationSnap.data(); const settings = settingsSnap.exists ? settingsSnap.data() : {};
    if (settings.enabled !== true) return NextResponse.json({ error: 'Wedding invitations are not available yet.' }, { status: 503 });
    if (invitation.paymentStatus === 'paid') return NextResponse.json({ error: 'This invitation is already paid.' }, { status: 409 });
    if (!Number.isSafeInteger(settings.pricePaise) || settings.pricePaise < 100) return NextResponse.json({ error: 'Wedding pricing is not configured.' }, { status: 503 });
    if (invitation.pendingOrderId) {
      const existing = await db.collection('wedding_orders').doc(invitation.pendingOrderId).get();
      if (existing.exists && existing.data().payment_status === 'pending' && existing.data().amount_paise === settings.pricePaise && existing.data().customer_uid === user.uid) {
        return NextResponse.json({ orderId: existing.data().razorpay_order_id, amount: settings.pricePaise, currency: 'INR', keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, weddingOrderId: existing.id });
      }
    }
    const keyId = process.env.RAZORPAY_KEY_ID; const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return NextResponse.json({ error: 'Payment creation is not configured.' }, { status: 503 });
    const orderRef = db.collection('wedding_orders').doc(); const order = await new Razorpay({ key_id: keyId, key_secret: keySecret }).orders.create({ amount: settings.pricePaise, currency: 'INR', receipt: `w_${orderRef.id.slice(0, 24)}`, notes: { productType: 'wedding_invitation', weddingOrderId: orderRef.id, invitationId: id, customerUid: user.uid } });
    await orderRef.set({ invitation_id: id, customer_uid: user.uid, amount_paise: settings.pricePaise, currency: 'INR', payment_status: 'pending', payment_provider: 'razorpay', razorpay_order_id: order.id, product_type: 'wedding_invitation', creator_id: null, attribution_source: null, created_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() });
    await db.collection('wedding_invitations').doc(id).update({ paymentStatus: 'pending', pendingOrderId: orderRef.id, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: 'INR', keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, weddingOrderId: orderRef.id });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to start checkout.' }, { status: error.status || 400 }); }
}
