let cachedGetTemplatePrice = null;

async function resolveTemplatePrice(templateId) {
  try {
    if (!cachedGetTemplatePrice) {
      const pricingMod = await import('./pricing.js').catch(() => null);
      if (pricingMod?.getTemplatePrice) {
        cachedGetTemplatePrice = pricingMod.getTemplatePrice;
      }
    }
    if (cachedGetTemplatePrice) {
      return await cachedGetTemplatePrice(templateId);
    }
  } catch {
    // Graceful fallback to default pricing
  }
  return null;
}

export function computeInclusiveGst(inclusiveTotal, taxRate = 18, gstType = 'intra') {
  const totalAmount = Math.max(0, Number(Number(inclusiveTotal || 0).toFixed(2)));
  const rate = Math.max(0, Number(taxRate || 0));

  if (totalAmount === 0 || rate === 0) {
    return {
      taxableAmount: totalAmount,
      taxRate: rate,
      taxAmount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      gstType,
      taxMode: 'inclusive',
      totalAmount,
    };
  }

  const taxableAmount = Number((totalAmount / (1 + rate / 100)).toFixed(2));
  const taxAmount = Number((totalAmount - taxableAmount).toFixed(2));

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstType === 'igst') {
    igst = taxAmount;
  } else {
    cgst = Number((taxAmount / 2).toFixed(2));
    sgst = Number((taxAmount - cgst).toFixed(2));
  }

  return {
    taxableAmount,
    taxRate: rate,
    taxAmount,
    cgst,
    sgst,
    igst,
    gstType: gstType === 'igst' ? 'igst' : 'intra',
    taxMode: 'inclusive',
    totalAmount,
  };
}

export async function generateInvoiceNumber(db) {
  const year = new Date().getFullYear();
  const counterRef = db.doc('platform_counters/b2c_invoice_seq');
  try {
    let seq;
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(counterRef);
      const current = doc.exists ? (doc.data()[String(year)] || 0) : 0;
      seq = current + 1;
      tx.set(counterRef, { [String(year)]: seq }, { merge: true });
    });
    return `LC-INV-${year}-${String(seq).padStart(4, '0')}`;
  } catch {
    const seq = String(Date.now()).slice(-5);
    return `LC-INV-${year}-${seq}`;
  }
}

const TEMPLATE_NAMES = {
  proposal: 'Proposal Interactive Experience',
  birthday: 'Birthday Interactive Experience',
  anniversary: 'Anniversary Interactive Experience',
  'emotional-apology': 'Apology Interactive Letter',
};

export async function createAutoInvoice({
  db,
  orderId,
  noteData = {},
  amountInRupees = 0,
  couponCode = '',
  discountPercent = 0,
  paymentMethod = 'UPI / Razorpay',
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  buyerStateCode = '',
  buyerStateName = '',
}) {
  try {
    const invoiceNumber = await generateInvoiceNumber(db);
    const templateId = noteData.template || 'proposal';
    const templateName = TEMPLATE_NAMES[templateId] || `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Digital Experience`;
    
    // User name from note creator or buyer input
    const resolvedCustomerName = (
      customerName ||
      noteData.custom_details?.sender_name ||
      noteData.sender_name ||
      noteData.author_name ||
      noteData.recipient_name ||
      'LovelyCrafts Customer'
    ).trim();

    // Resolve dynamic template price configured in settings/pricing
    let templateBasePrice = 199;
    try {
      const priceInfo = await resolveTemplatePrice(templateId);
      if (priceInfo?.priceRupees) {
        templateBasePrice = priceInfo.priceRupees;
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic template price, using fallback:', err);
    }

    // Determine subtotal and discount accurately
    let subtotal;
    let discountAmount = 0;
    let finalAmount = 0;

    if (discountPercent === 100) {
      subtotal = templateBasePrice;
      discountAmount = templateBasePrice;
      finalAmount = 0;
    } else if (discountPercent > 0) {
      subtotal = templateBasePrice > 0 ? templateBasePrice : (amountInRupees > 0 ? Math.round(amountInRupees / (1 - discountPercent / 100)) : 199);
      discountAmount = Number((subtotal * (discountPercent / 100)).toFixed(2));
      finalAmount = Number((amountInRupees > 0 ? amountInRupees : (subtotal - discountAmount)).toFixed(2));
    } else {
      subtotal = amountInRupees > 0 ? amountInRupees : templateBasePrice;
      discountAmount = 0;
      finalAmount = subtotal;
    }

    // Resolve seller details from company profile (default Haryana '06')
    let sellerProfile = {};
    try {
      const profileSnap = await db.doc('platform_settings/company_profile').get();
      if (profileSnap.exists) sellerProfile = profileSnap.data() || {};
    } catch { }
    const sellerStateCode = String(sellerProfile.stateCode || '06').padStart(2, '0');

    const resolvedBuyerState = String(buyerStateCode || noteData.buyer_state_code || '').padStart(2, '0');
    const gstType = resolvedBuyerState && resolvedBuyerState !== '00'
      ? (resolvedBuyerState === sellerStateCode ? 'intra' : 'igst')
      : 'intra';
    const gst = computeInclusiveGst(finalAmount, 18, gstType);

    const today = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const invoiceData = {
      invoiceNumber,
      sellerName: sellerProfile.companyName || 'LovelyCrafts',
      sellerLegalName: sellerProfile.legalName || sellerProfile.companyName || 'LovelyCrafts',
      sellerGstin: (sellerProfile.gstin || '').toUpperCase(),
      sellerPan: (sellerProfile.pan || '').toUpperCase(),
      sellerStateCode,
      sellerStateName: sellerProfile.stateName || 'Haryana',
      sellerAddress: [sellerProfile.addressLine1, sellerProfile.addressLine2, sellerProfile.city, sellerProfile.stateName, sellerProfile.pincode].filter(Boolean).join(', '),
      sellerEmail: sellerProfile.email || 'support@lovelycrafts.in',
      customerName: resolvedCustomerName,
      customerEmail: customerEmail || noteData.customer_email || noteData.email || '',
      customerPhone: customerPhone || noteData.customer_phone || noteData.phone || '',
      customerAddress: buyerStateName ? `${buyerStateName} (${resolvedBuyerState})` : '',
      customerGstin: '',
      buyerStateCode: resolvedBuyerState !== '00' ? resolvedBuyerState : '',
      buyerStateName: buyerStateName || noteData.buyer_state_name || '',
      items: [
        {
          description: templateName,
          hsn: '998314',
          quantity: 1,
          unitPrice: subtotal,
          total: subtotal,
        },
      ],
      subtotal,
      discount: discountAmount,
      couponCode: couponCode || '',
      discountPercent: discountPercent || 0,
      taxableAmount: gst.taxableAmount,
      taxRate: gst.taxRate,
      taxAmount: gst.taxAmount,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      gstType: gst.gstType,
      taxMode: 'inclusive',
      totalAmount: gst.totalAmount,
      currency: 'INR',
      status: 'paid',
      type: 'auto',
      issuedDate: today,
      dueDate: today,
      notes: couponCode ? `Coupon applied: ${couponCode} (${discountPercent}% off)` : 'Thank you for choosing LovelyCrafts!',
      terms: `1. Access to digital interactive experience granted.\n2. Invoiced amount is inclusive of ${gst.taxRate}% GST (${gst.gstType === 'intra' ? 'CGST 9% + SGST 9%' : 'IGST 18%'}).`,
      orderId,
      noteId: noteData.id || noteData.noteId || '',
      paymentMethod,
      paidAt: nowIso,
      createdAt: nowIso,
      createdBy: 'system_auto',
    };

    const docRef = await db.collection('finance_invoices').add(invoiceData);
    return { id: docRef.id, ...invoiceData };
  } catch (error) {
    console.error('Failed to create auto invoice:', error);
    return null;
  }
}
