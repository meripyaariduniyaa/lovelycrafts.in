import { NextResponse } from 'next/server';
import { getTemplatePricing } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pricing = await getTemplatePricing();
    return NextResponse.json({ success: true, pricing });
  } catch (error) {
    console.error('Error fetching template pricing:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
