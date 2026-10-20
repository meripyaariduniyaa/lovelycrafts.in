import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getCheckoutQuote } from '@/lib/checkout-quote';

export const dynamic = 'force-dynamic';

function cashfreeConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const mode = process.env.CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    mode,
    apiBase: mode === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg',
    apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
  };
}

export async function POST(request) {
  try {
    const { noteId, couponCode = '', phone = '', buyerName = '', buyerEmail = '' } = await request.json();
    if (typeof noteId !== 'string' || !noteId.trim()) {
      return NextResponse.json({ error: 'Gift identifier is required.' }, { status: 400 });
    }
    const quote = await getCheckoutQuote({
      noteId: noteId.trim(),
      couponCode,
      referralCookie: request.cookies.get('lc_ref')?.value,
    });
    if (quote.error) return NextResponse.json(quote, { status: quote.status || 400 });
    if (quote.free) return NextResponse.json({ free: true, couponCode: quote.couponCode });
    const normalizedPhone = String(phone).replace(/\D/g, '');
    if (!/^\d{10}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit mobile number for Cashfree checkout.' }, { status: 400 });
    }

    const config = cashfreeConfig();
    if (!config) return NextResponse.json({ error: 'Cashfree is not configured yet.' }, { status: 503 });

    const origin = new URL(request.url).origin;
    const orderId = `lc_${nanoid(24)}`;
    const sanitizedCustomerId = noteId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || `cust_${nanoid(10)}`;

    const tags = {
      note_id: noteId.trim().slice(0, 100),
      coupon_code: (quote.couponCode || '').slice(0, 100),
      coupon_id: (quote.couponId || '').slice(0, 100),
      creator_id: (quote.creatorId || '').slice(0, 100),
      attribution_source: (quote.attributionSource || '').slice(0, 100),
      discount_percent: String(quote.discountPercent || 0),
      buyer_name: (buyerName || '').slice(0, 100),
      buyer_email: (buyerEmail || '').slice(0, 100),
      buyer_phone: normalizedPhone,
    };
    const response = await fetch(`${config.apiBase}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
        'x-api-version': config.apiVersion,
        'x-idempotency-key': nanoid(32),
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number((quote.amount / 100).toFixed(2)),
        order_currency: 'INR',
        customer_details: {
          customer_id: sanitizedCustomerId,
          customer_phone: normalizedPhone,
          customer_name: (buyerName || quote.note.recipient_name || 'LovelyCrafts customer').slice(0, 100),
          ...(buyerEmail ? { customer_email: buyerEmail.trim().slice(0, 100) } : {}),
        },
        order_note: `LovelyCrafts gift ${noteId.trim()}`,
        order_tags: tags,
        order_meta: {
          return_url: `${origin}/checkout?id=${encodeURIComponent(noteId.trim())}&cashfree_order_id={order_id}`,
          notify_url: `${origin}/api/cashfree/webhook`,
        },
      }),
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.payment_session_id) {
      console.error('Cashfree order creation failed:', data.message || data.type || response.status, data);
      return NextResponse.json({ error: data.message || 'Cashfree could not start checkout. Please try Razorpay or retry.' }, { status: 502 });
    }

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      amount: quote.amount,
      currency: 'INR',
      mode: config.mode,
      couponCode: quote.couponCode,
      discountPercent: quote.discountPercent,
    });
  } catch (error) {
    console.error('Cashfree create-order error:', error);
    return NextResponse.json({ error: 'Unable to start Cashfree checkout.' }, { status: 500 });
  }
}
