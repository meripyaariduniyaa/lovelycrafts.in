import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getWeddingTemplates } from '@/lib/weddings';

export async function GET() {
  try {
    const snap = await getAdminDb().collection('wedding_settings').doc('current').get(); const data = snap.exists ? snap.data() : {}; const templates = await getWeddingTemplates();
    return NextResponse.json({ enabled: data.enabled === true, pricePaise: Number(data.pricePaise) || null, templates }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ enabled: false, pricePaise: null, templates: WEDDING_TEMPLATES }, { status: 200 }); }
}
