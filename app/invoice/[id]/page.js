import { getAdminDb } from '@/lib/firebase-admin';
import Link from 'next/link';
import InvoiceView from './InvoiceView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';
  return {
    title: `Tax Invoice ${id ? `#${id}` : ''} — LovelyCrafts`,
    description: 'Official Tax Invoice and Purchase Receipt for LovelyCrafts digital experience.',
    robots: { index: false, follow: false },
  };
}

async function fetchInvoiceData(id) {
  if (!id) return null;
  const adminDb = getAdminDb();

  // 1. Direct match on finance_invoices document ID
  try {
    const directSnap = await adminDb.collection('finance_invoices').doc(id).get();
    if (directSnap.exists) {
      return { id: directSnap.id, ...directSnap.data() };
    }
  } catch (err) {
    console.error('Error fetching invoice by doc ID:', err);
  }

  // 2. Match on orderId in finance_invoices
  try {
    const byOrderSnap = await adminDb
      .collection('finance_invoices')
      .where('orderId', '==', id)
      .limit(1)
      .get();
    if (!byOrderSnap.empty) {
      const doc = byOrderSnap.docs[0];
      return { id: doc.id, ...doc.data() };
    }
  } catch (err) {
    console.error('Error fetching invoice by orderId:', err);
  }

  // 3. Match on noteId in finance_invoices
  try {
    const byNoteSnap = await adminDb
      .collection('finance_invoices')
      .where('noteId', '==', id)
      .limit(1)
      .get();
    if (!byNoteSnap.empty) {
      const doc = byNoteSnap.docs[0];
      return { id: doc.id, ...doc.data() };
    }
  } catch (err) {
    console.error('Error fetching invoice by noteId:', err);
  }

  // 4. Fallback lookup in orders collection by order doc ID
  let orderDoc = null;
  try {
    const orderSnap = await adminDb.collection('orders').doc(id).get();
    if (orderSnap.exists) {
      orderDoc = orderSnap;
    }
  } catch (err) {
    console.error('Error checking orders collection by ID:', err);
  }

  // 5. Fallback lookup in orders collection by note_id
  if (!orderDoc) {
    try {
      const ordersByNote = await adminDb
        .collection('orders')
        .where('note_id', '==', id)
        .limit(1)
        .get();
      if (!ordersByNote.empty) {
        orderDoc = ordersByNote.docs[0];
      }
    } catch (err) {
      console.error('Error checking orders collection by note_id:', err);
    }
  }

  // If order document found, synthesize invoice accurately
  if (orderDoc) {
    const order = orderDoc.data();
    const amountPaise = Number(order.final_amount || 0);
    const amountRupees = Number((amountPaise / 100).toFixed(2));
    const discountPercent = Number(order.discount_percent || 0);
    const subtotalRupees = discountPercent > 0
      ? Math.round(amountRupees / (1 - discountPercent / 100))
      : (amountRupees > 0 ? amountRupees : 199);
    const discountRupees = discountPercent > 0
      ? Number((subtotalRupees * (discountPercent / 100)).toFixed(2))
      : 0;

    const templateKey = order.template_id || order.template || 'proposal';
    const templateName = templateKey.charAt(0).toUpperCase() + templateKey.slice(1) + ' Digital Experience';

    const paidDate = order.paid_at?.toDate?.() || (order.paid_at ? new Date(order.paid_at) : new Date());
    const year = paidDate.getFullYear();

    return {
      id: orderDoc.id,
      invoiceNumber: order.invoice_number || `LC-INV-${year}-${orderDoc.id.slice(-6).toUpperCase()}`,
      customerName: order.buyer_name || order.customer_name || 'LovelyCrafts Customer',
      customerEmail: order.buyer_email || order.customer_email || '',
      customerPhone: order.buyer_phone || order.customer_phone || '',
      items: [
        {
          description: templateName,
          quantity: 1,
          unitPrice: subtotalRupees,
          total: subtotalRupees,
        },
      ],
      subtotal: subtotalRupees,
      discount: discountRupees,
      couponCode: order.coupon_code || '',
      discountPercent: discountPercent,
      taxRate: 0,
      taxAmount: 0,
      cgst: 0,
      sgst: 0,
      totalAmount: amountRupees,
      status: order.payment_status || 'paid',
      issuedDate: paidDate.toISOString().split('T')[0],
      orderId: orderDoc.id,
      noteId: order.note_id || '',
      paymentMethod: order.payment_method === 'cashfree' ? 'Cashfree Payments' : (order.payment_method === 'coupon' ? 'VIP Gift Pass' : 'UPI / Razorpay'),
      paidAt: paidDate.toISOString(),
      notes: order.coupon_code ? `Coupon applied: ${order.coupon_code} (${discountPercent}% off)` : 'Thank you for choosing LovelyCrafts!',
      terms: '1. Access to digital interactive experience granted.\n2. Invoiced amount inclusive of applicable digital taxes (CGST 0%, SGST 0%).',
      type: 'auto',
    };
  }

  // 6. Fallback lookup in notes collection if note is paid
  try {
    const noteSnap = await adminDb.collection('notes').doc(id).get();
    if (noteSnap.exists) {
      const note = noteSnap.data();
      if (note.is_paid) {
        const paidDate = note.paid_at?.toDate?.() || (note.created_at?.toDate?.() || new Date());
        const templateKey = note.template || 'proposal';
        const templateName = templateKey.charAt(0).toUpperCase() + templateKey.slice(1) + ' Digital Experience';
        const amountPaise = Number(note.amount_paid || 0);
        const amountRupees = Number((amountPaise / 100).toFixed(2));
        const discountPercent = Number(note.discount_percent || 0);
        const subtotalRupees = discountPercent > 0
          ? Math.round(amountRupees / (1 - discountPercent / 100))
          : (amountRupees > 0 ? amountRupees : 199);
        const discountRupees = discountPercent > 0
          ? Number((subtotalRupees * (discountPercent / 100)).toFixed(2))
          : 0;

        return {
          id: noteSnap.id,
          invoiceNumber: `LC-INV-${paidDate.getFullYear()}-${noteSnap.id.slice(-6).toUpperCase()}`,
          customerName: note.custom_details?.sender_name || note.sender_name || note.author_name || 'LovelyCrafts Customer',
          customerEmail: note.customer_email || note.email || '',
          customerPhone: note.customer_phone || note.phone || '',
          items: [
            {
              description: templateName,
              quantity: 1,
              unitPrice: subtotalRupees,
              total: subtotalRupees,
            },
          ],
          subtotal: subtotalRupees,
          discount: discountRupees,
          couponCode: note.coupon_code || '',
          discountPercent: discountPercent,
          totalAmount: amountRupees,
          status: 'paid',
          issuedDate: paidDate.toISOString().split('T')[0],
          orderId: note.razorpay_order_id || note.cashfree_order_id || noteSnap.id,
          noteId: noteSnap.id,
          paymentMethod: note.payment_method === 'cashfree' ? 'Cashfree Payments' : (note.payment_method === 'coupon' ? 'VIP Gift Pass' : 'UPI / Razorpay'),
          paidAt: paidDate.toISOString(),
          notes: 'Thank you for choosing LovelyCrafts!',
          terms: '1. Access to digital interactive experience granted.\n2. Invoiced amount inclusive of applicable digital taxes (CGST 0%, SGST 0%).',
          type: 'auto',
        };
      }
    }
  } catch (err) {
    console.error('Error checking notes collection for invoice:', err);
  }

  return null;
}

export default async function InvoicePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams?.id || '';
  const autoPrint = resolvedSearchParams?.download === 'true' || resolvedSearchParams?.print === 'true';

  const invoice = await fetchInvoiceData(id);

  if (!invoice) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#fdf4f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(190, 24, 93, 0.08)',
          border: '1px solid #fecdd3'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧾 🔍</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            Invoice Not Found
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            We could not find an invoice matching reference <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{id}</code>. It might still be processing or may have been deleted.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.28)'
              }}
            >
              Return to LovelyCrafts
            </Link>
            <a
              href="mailto:support@lovelycrafts.in"
              style={{
                color: '#be185d',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '4px'
              }}
            >
              Contact Support (support@lovelycrafts.in)
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <InvoiceView invoice={invoice} autoPrint={autoPrint} />;
}
