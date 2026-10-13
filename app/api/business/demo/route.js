import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      company_name,
      contact_name,
      business_email,
      phone,
      employee_count = '10-50',
      preferred_time = '',
      notes = '',
    } = body;

    // Basic Validation
    if (!company_name?.trim()) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }
    if (!contact_name?.trim()) {
      return NextResponse.json({ error: 'Contact person name is required.' }, { status: 400 });
    }
    if (!business_email?.trim() || !/^\S+@\S+\.\S+$/.test(business_email.trim())) {
      return NextResponse.json({ error: 'A valid work email is required.' }, { status: 400 });
    }
    if (!phone?.trim() || phone.trim().length < 7) {
      return NextResponse.json({ error: 'A valid contact phone or WhatsApp number is required.' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('business_demo_queries').doc();

    const queryData = {
      id: docRef.id,
      company_name: company_name.trim(),
      contact_name: contact_name.trim(),
      business_email: business_email.trim().toLowerCase(),
      phone: phone.trim(),
      employee_count: String(employee_count).trim(),
      preferred_time: String(preferred_time).trim(),
      notes: String(notes).trim(),
      status: 'new', // 'new' | 'contacted' | 'scheduled' | 'completed' | 'closed'
      admin_notes: '',
      source: 'website_demo_modal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await docRef.set(queryData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Demo query registered successfully. Our team will contact you shortly.',
    });
  } catch (error) {
    console.error('Business Demo Query API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit demo request. Please try again.' },
      { status: 500 }
    );
  }
}
