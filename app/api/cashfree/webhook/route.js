import { NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree-security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature');
  const timestamp = request.headers.get('x-webhook-timestamp');
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  if (!secret) return NextResponse.json({ error: 'Cashfree webhook verification is not configured.' }, { status: 503 });
  if (!verifyCashfreeWebhookSignature(rawBody, timestamp, signature, secret)) {
    return NextResponse.json({ error: 'Invalid Cashfree webhook signature.' }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const payment = payload?.data?.payment || {};
  const order = payload?.data?.order || {};
  if (payment.payment_status !== 'SUCCESS') return NextResponse.json({ ok: true, ignored: true });
  if (!order.order_id || !order.order_tags?.note_id) {
    return NextResponse.json({ error: 'Cashfree event is missing its order metadata.' }, { status: 400 });
  }

  // The verifier fetches the order and successful payment directly from Cashfree,
  // then executes the same idempotent settlement used by the browser return flow.
  const verifyUrl = new URL('/api/cashfree/verify', request.url);
  const result = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'cashfree',
      apologyId: order.order_tags.note_id,
      cashfree_order_id: order.order_id,
    }),
    cache: 'no-store',
  });
  const responseBody = await result.json().catch(() => ({}));
  if (!result.ok) {
    console.error('Cashfree webhook settlement verification failed:', result.status);
    return NextResponse.json({ error: 'Cashfree payment is not yet verified.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, orderId: responseBody.orderId, duplicate: responseBody.duplicate || false });
}
