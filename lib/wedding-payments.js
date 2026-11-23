import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';

export function weddingSettlementId(paymentId) { return createHash('sha256').update(`wedding:${paymentId}`).digest('hex'); }

export async function settleWeddingPayment({ orderId, paymentId, amountPaise, paymentStatus = 'captured' }) {
  if (!orderId || !paymentId || !Number.isSafeInteger(Number(amountPaise)) || paymentStatus !== 'captured') throw new Error('Payment settlement details are invalid.');
  const db = getAdminDb(); const orderQuery = await db.collection('wedding_orders').where('razorpay_order_id', '==', orderId).limit(1).get();
  if (orderQuery.empty) throw new Error('Wedding payment order was not found.');
  const orderRef = orderQuery.docs[0].ref; const invitationRef = db.collection('wedding_invitations').doc(orderQuery.docs[0].data().invitation_id);
  const settlementRef = db.collection('wedding_payment_settlements').doc(weddingSettlementId(paymentId));
  const outcome = await db.runTransaction(async (tx) => {
    const [orderSnap, invitationSnap, settlementSnap] = await Promise.all([tx.get(orderRef), tx.get(invitationRef), tx.get(settlementRef)]);
    if (settlementSnap.exists) return { duplicate: true, id: settlementRef.id };
    if (!orderSnap.exists || !invitationSnap.exists) throw new Error('Wedding order or invitation is missing.');
    const order = orderSnap.data();
    if (Number(order.amount_paise) !== Number(amountPaise)) throw new Error('Payment amount does not match the wedding order.');
    if (order.payment_status === 'paid' && order.razorpay_payment_id !== paymentId) throw new Error('Wedding order has already been paid with another payment.');
    const now = FieldValue.serverTimestamp();
    tx.create(settlementRef, { wedding_order_id: orderRef.id, invitation_id: invitationRef.id, customer_uid: order.customer_uid, amount_paise: Number(amountPaise), currency: 'INR', payment_status: 'paid', razorpay_order_id: orderId, razorpay_payment_id: paymentId, product_type: 'wedding_invitation', creator_id: null, attribution_source: null, paid_at: now, created_at: now });
    tx.update(orderRef, { payment_status: 'paid', razorpay_payment_id: paymentId, paid_at: now, updated_at: now });
    tx.update(invitationRef, { paymentStatus: 'paid', orderId: settlementRef.id, updatedAt: now });
    return { duplicate: false, id: settlementRef.id, invitationId: invitationRef.id };
  });
  if (!outcome.duplicate) await db.collection('admin_payment_ledger').doc(outcome.id).set({ order_id: outcome.id, wedding_order_id: orderRef.id, invitation_id: outcome.invitationId, customer_uid: orderQuery.docs[0].data().customer_uid, final_amount: Number(amountPaise), amount_in_rupees: Number((Number(amountPaise) / 100).toFixed(2)), payment_method: 'razorpay', payment_provider: 'razorpay', payment_status: 'paid', razorpay_order_id: orderId, razorpay_payment_id: paymentId, product_type: 'wedding_invitation', creator_id: null, attribution_source: null, created_at: FieldValue.serverTimestamp(), paid_at: FieldValue.serverTimestamp(), immutable_permanent_lock: true }, { merge: true });
  return outcome;
}
