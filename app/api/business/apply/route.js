import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { validateApplicationInput, APPLICATION_STATUSES, normalizeSlug, buildAuditLog } from '@/lib/business';

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = validateApplicationInput(body);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(' ') || 'Invalid submission data.' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const { sanitized } = validation;

    // Check for duplicate pending applications with the same business email
    const existingSnap = await db
      .collection('business_applications')
      .where('business_email', '==', sanitized.business_email)
      .where('status', 'in', [APPLICATION_STATUSES.PENDING, APPLICATION_STATUSES.UNDER_REVIEW])
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json(
        {
          error: 'An application for this business email is already under review. Our team will get in touch shortly.',
        },
        { status: 409 }
      );
    }

    // Generate a suggested clean slug from company name
    const suggestedSlug = normalizeSlug(sanitized.company_name);

    const newAppRef = db.collection('business_applications').doc();
    const appData = {
      id: newAppRef.id,
      company_name: sanitized.company_name,
      website: sanitized.website,
      business_email: sanitized.business_email,
      contact_name: sanitized.contact_name,
      designation: sanitized.designation,
      employee_count: sanitized.employee_count,
      use_cases: sanitized.use_cases,
      estimated_frequency: sanitized.estimated_frequency,
      message: sanitized.message,
      suggested_slug: suggestedSlug,
      status: APPLICATION_STATUSES.PENDING,
      review_notes: null,
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await newAppRef.set(appData);

    // Record system audit log
    await db.collection('business_audit_logs').add(
      buildAuditLog({
        businessId: null,
        actorUid: 'system',
        actorEmail: sanitized.business_email,
        action: 'BUSINESS_APPLICATION_SUBMITTED',
        details: {
          application_id: newAppRef.id,
          company_name: sanitized.company_name,
          employee_count: sanitized.employee_count,
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Your LovelyCrafts for Business application has been received! Our team will review your application and send an activation invitation.',
      application_id: newAppRef.id,
    });
  } catch (error) {
    console.error('Business Application API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your application. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
