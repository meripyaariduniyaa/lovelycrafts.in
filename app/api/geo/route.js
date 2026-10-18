import { NextResponse } from 'next/server';
import { getClientCountry } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const geo = getClientCountry(request);

    return NextResponse.json({
      success: true,
      country: geo.country,
      isIndia: geo.isIndia,
      isOverridden: geo.isOverridden || false,
      source: geo.source,
      message: geo.isIndia
        ? 'Purchases enabled for India.'
        : `Purchases are currently restricted to clients located in India. Detected country: ${geo.country}`,
    }, {
      headers: {
        'Cache-Control': 'private, no-transform, max-age=1800',
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      country: 'IN',
      isIndia: true,
      error: error.message,
    }, { status: 500 });
  }
}
