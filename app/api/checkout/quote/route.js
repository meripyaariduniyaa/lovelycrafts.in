import { NextResponse } from 'next/server';
import { getCheckoutQuote } from '@/lib/checkout-quote';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { noteId, couponCode = '' } = await request.json();
    if (typeof noteId !== 'string' || !noteId.trim()) {
      return NextResponse.json({ error: 'Gift identifier is required.' }, { status: 400 });
    }
    const quote = await getCheckoutQuote({
      noteId: noteId.trim(),
      couponCode,
      referralCookie: request.cookies.get('lc_ref')?.value,
    });
    if (quote.error) return NextResponse.json(quote, { status: quote.status || 400 });
    return NextResponse.json({
      amount: quote.amount,
      baseAmount: quote.baseAmount,
      currency: 'INR',
      discountPercent: quote.discountPercent,
      free: quote.free,
      couponCode: quote.couponCode,
      couponId: quote.couponId,
      couponLabel: quote.couponLabel,
      creatorId: quote.creatorId,
      attributionSource: quote.attributionSource,
    });
  } catch (error) {
    console.error('Checkout quote error:', error);
    return NextResponse.json({ error: 'Unable to calculate checkout amount.' }, { status: 500 });
  }
}
