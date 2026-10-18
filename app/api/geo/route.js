import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    country: 'IN',
    isIndia: true,
    isOverridden: false,
    source: 'unrestricted',
    message: 'Purchases unrestricted.',
  });
}
