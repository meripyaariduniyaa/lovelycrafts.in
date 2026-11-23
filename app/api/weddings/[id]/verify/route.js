import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifyHmacSha256Signature } from '@/lib/razorpay-security';
import { getAdminDb } from '@/lib/firebase-admin';
import { weddingUser } from '@/lib/weddings';
import { settleWeddingPayment } from '@/lib/wedding-payments';

export async function POST(request, { params }) {
  try {
    const { id } = await params; const user = await weddingUser(request); const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return NextResponse.json({ error: 'Missing Razorpay payment data.' }, { status: 400 });
    const secret = process.env.RAZORPAY_KEY_SECRET; if (!secret) return NextResponse.json({ error: 'Payment verification is not configured.' }, { status: 503 });
    if (!verifyHmacSha256Signature(`${razorpay_order_id}|${razorpay_payment_id}`, razorpay_signature, secret)) return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
    const adminDb = getAdminDb(); const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: secret });
    const [providerOrder, providerPayment, invitationSnap] = await Promise.all([razorpay.orders.fetch(razorpay_order_id), razorpay.payments.fetch(razorpay_payment_id), adminDb.collection('wedding_invitations').doc(id).get()]);
    const weddingOrderId = providerOrder.notes?.weddingOrderId; const orderSnap = weddingOrderId ? await adminDb.collection('wedding_orders').doc(weddingOrderId).get() : null;
    if (!invitationSnap.exists || invitationSnap.data().ownerId !== user.uid || invitationSnap.data().pendingOrderId !== weddingOrderId || !orderSnap?.exists || orderSnap.data().invitation_id !== id || orderSnap.data().customer_uid !== user.uid || providerOrder.notes?.productType !== 'wedding_invitation' || providerOrder.notes?.invitationId !== id || providerOrder.notes?.customerUid !== user.uid || Number(providerOrder.amount) !== orderSnap.data().amount_paise || providerPayment.order_id !== providerOrder.id || providerPayment.status !== 'captured' || providerPayment.amount !== orderSnap.data().amount_paise || providerPayment.currency !== 'INR') return NextResponse.json({ error: 'Payment could not be verified for this wedding invitation.' }, { status: 400 });
    const settled = await settleWeddingPayment({ orderId: providerOrder.id, paymentId: providerPayment.id, amountPaise: providerPayment.amount });
    return NextResponse.json({ ok: true, orderId: settled.id, invitationId: id });
  } catch (error) { return NextResponse.json({ error: error.message || 'Payment verification failed.' }, { status: error.status || 400 }); }
}
