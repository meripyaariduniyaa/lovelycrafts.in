/**
 * Canonical GST Tax Invoice (E-Invoice layout) shared across B2B & B2C,
 * both on-screen preview and A4 print/PDF.
 */

export const HSN_DIGITAL_SERVICES = '998314';

export function formatInr(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Number(num) || 0);
  if (n <= 0) return 'Zero Rupees Only';

  function convertGroup(val) {
    let str = '';
    if (val >= 100) {
      str += a[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 20) {
      str += b[Math.floor(val / 10)] + ' ';
      val %= 10;
    }
    if (val > 0) {
      str += a[val] + ' ';
    }
    return str.trim();
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  let rem = n % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;

  if (crore > 0) words += convertGroup(crore) + ' Crore ';
  if (lakh > 0) words += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) words += convertGroup(thousand) + ' Thousand ';
  if (rem > 0) words += convertGroup(rem) + ' ';

  return words.trim() + ' Rupees Only';
}

/**
 * Normalize any B2B (corporate_invoices) or B2C (finance_invoices / order)
 * invoice into one unified e-invoice view model.
 */
export function normalizeInvoiceForView(inv = {}, companyProfile = {}) {
  const isB2B = inv.invoiceType === 'b2b_corporate' || Boolean(inv.buyerCompanyName);
  const sellerAddressDefault = [
    companyProfile.addressLine1,
    companyProfile.addressLine2,
    companyProfile.city,
    companyProfile.stateName,
    companyProfile.pincode,
  ].filter(Boolean).join(', ');

  const sellerName = inv.sellerName || companyProfile.companyName || 'LovelyCrafts';
  const sellerLegalName = inv.sellerLegalName || companyProfile.legalName || sellerName;
  const sellerGstin = (inv.sellerGstin || companyProfile.gstin || '').toUpperCase();
  const sellerPan = (inv.sellerPan || companyProfile.pan || '').toUpperCase();
  const sellerStateCode = inv.sellerStateCode || companyProfile.stateCode || '06';
  const sellerStateName = inv.sellerStateName || companyProfile.stateName || 'Haryana';
  const sellerAddress = inv.sellerAddress || sellerAddressDefault || 'Gurugram, Haryana';
  const sellerEmail = inv.sellerEmail || companyProfile.email || 'support@lovelycrafts.in';

  const buyerName = inv.buyerCompanyName || inv.customerName || 'LovelyCrafts Customer';
  const buyerGstin = (inv.buyerGstin || inv.customerGstin || '').toUpperCase();
  const buyerPan = (inv.buyerPan || '').toUpperCase();
  const buyerStateCode = inv.buyerStateCode || (isB2B ? '' : '') || '';
  const buyerStateName = inv.buyerStateName || '';
  const buyerEmail = inv.buyerEmail || inv.customerEmail || '';
  const buyerPhone = inv.buyerPhone || inv.customerPhone || '';
  const buyerAddress = inv.buyerAddress || inv.customerAddress || '';

  const placeOfSupply = buyerStateName
    ? `${buyerStateName}${buyerStateCode ? ` (${buyerStateCode})` : ''}`
    : `${sellerStateName} (${sellerStateCode})`;

  const rawItems = Array.isArray(inv.items) && inv.items.length > 0
    ? inv.items
    : [{
        description: 'Interactive Digital Experience',
        hsn: HSN_DIGITAL_SERVICES,
        quantity: 1,
        unitPrice: inv.subtotal || inv.totalAmount || 0,
        total: inv.subtotal || inv.totalAmount || 0,
      }];

  const items = rawItems.map((it) => {
    const qty = Number(it.quantity) || 1;
    const unitPrice = Number(it.unitPrice) || 0;
    const total = Number(it.total ?? (qty * unitPrice));
    return {
      description: it.description || 'Digital Service',
      hsn: it.hsn || HSN_DIGITAL_SERVICES,
      quantity: qty,
      unitPrice,
      total,
    };
  });

  const subtotal = Number(inv.subtotal ?? items.reduce((s, i) => s + i.total, 0));
  const discount = Number(inv.discount || 0);
  const totalAmount = Number(inv.totalAmount ?? Math.max(0, subtotal - discount));
  const taxMode = inv.taxMode === 'inclusive' ? 'inclusive' : (isB2B ? 'exclusive' : 'inclusive');
  const taxRate = Number(inv.taxRate ?? (inv.igstRate || (inv.cgstRate ? inv.cgstRate * 2 : 18)));

  let cgst = Number(inv.cgstAmount ?? inv.cgst ?? 0);
  let sgst = Number(inv.sgstAmount ?? inv.sgst ?? 0);
  let igst = Number(inv.igstAmount ?? inv.igst ?? 0);
  let totalTax = Number(inv.totalTax ?? inv.taxAmount ?? (cgst + sgst + igst));
  let taxableAmount = Number(inv.taxableAmount ?? (taxMode === 'inclusive' ? Number((totalAmount - totalTax).toFixed(2)) : Math.max(0, subtotal - discount)));

  const gstType = inv.gstType || (igst > 0 ? 'igst' : 'intra');

  // Backfill inclusive 18% breakdown for legacy B2C invoices saved with 0 tax
  if (!isB2B && totalTax === 0 && totalAmount > 0 && taxMode === 'inclusive') {
    const rate = taxRate > 0 ? taxRate : 18;
    taxableAmount = Number((totalAmount / (1 + rate / 100)).toFixed(2));
    totalTax = Number((totalAmount - taxableAmount).toFixed(2));
    if (gstType === 'igst') {
      igst = totalTax;
    } else {
      cgst = Number((totalTax / 2).toFixed(2));
      sgst = Number((totalTax - cgst).toFixed(2));
    }
  }

  return {
    id: inv.id || '',
    isB2B,
    invoiceNumber: inv.invoiceNumber || 'LC-INV',
    issuedDate: inv.issuedDate || (inv.createdAt ? String(inv.createdAt).split('T')[0] : ''),
    dueDate: inv.dueDate || inv.issuedDate || '',
    periodLabel: inv.periodLabel || '',
    orderId: inv.orderId || '',
    status: (inv.status || 'paid').toLowerCase(),
    paidAt: inv.paidAt || '',
    paymentMethod: inv.paymentMethod || '',
    couponCode: inv.couponCode || '',
    razorpayPaymentLinkUrl: inv.razorpayPaymentLinkUrl || '',
    sellerName,
    sellerLegalName,
    sellerGstin,
    sellerPan,
    sellerStateCode,
    sellerStateName,
    sellerAddress,
    sellerEmail,
    sellerBankName: inv.sellerBankName || companyProfile.bankName || '',
    sellerBankAccount: inv.sellerBankAccount || companyProfile.bankAccount || '',
    sellerBankIfsc: inv.sellerBankIfsc || companyProfile.bankIfsc || '',
    sellerBankBranch: inv.sellerBankBranch || companyProfile.bankBranch || '',
    buyerName,
    buyerGstin,
    buyerPan,
    buyerStateCode,
    buyerStateName,
    buyerEmail,
    buyerPhone,
    buyerAddress,
    placeOfSupply,
    items,
    subtotal,
    discount,
    taxableAmount,
    taxRate: taxRate > 0 ? taxRate : 18,
    taxMode,
    gstType,
    cgst,
    sgst,
    igst,
    totalTax,
    roundOff: Number(inv.roundOff || 0),
    gatewayFeeAdded: Boolean(inv.gatewayFeeAdded),
    gatewayFeeAmount: Number(inv.gatewayFeeAmount || 0),
    gatewayFeeGst: Number(inv.gatewayFeeGst || 0),
    chargeAmountWithFee: Number(inv.chargeAmountWithFee || totalAmount),
    totalAmount,
    notes: inv.notes || '',
    terms: inv.terms || companyProfile.invoiceTerms || '1. Digital service access granted.\n2. Subject to Indian GST laws.',
    footer: inv.footer || companyProfile.invoiceFooter || 'Thank you for choosing LovelyCrafts. For billing support, write to support@lovelycrafts.in',
  };
}

/**
 * Render the single canonical Tax Invoice HTML body (used by both A4 Print and inline preview).
 */
export function renderTaxInvoiceBodyHtml(rawInv, companyProfile = {}) {
  const n = normalizeInvoiceForView(rawInv, companyProfile);

  const itemsRows = n.items.map((it, idx) => `
    <tr>
      <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:12px">${idx + 1}</td>
      <td style="padding:10px 12px;font-weight:600;color:#0f172a;border-bottom:1px solid #f1f5f9;font-size:12.5px">${it.description}</td>
      <td style="padding:10px 12px;text-align:center;font-family:monospace;border-bottom:1px solid #f1f5f9;font-size:12px;color:#334155">${it.hsn}</td>
      <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #f1f5f9;font-size:12.5px">${it.quantity}</td>
      <td style="padding:10px 12px;text-align:right;border-bottom:1px solid #f1f5f9;font-size:12.5px">₹${formatInr(it.unitPrice)}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:1px solid #f1f5f9;font-size:12.5px">₹${formatInr(it.total)}</td>
    </tr>
  `).join('');

  const statusBg = n.status === 'paid' ? '#dcfce7' : n.status === 'void' || n.status === 'refunded' ? '#f1f5f9' : '#fef3c7';
  const statusColor = n.status === 'paid' ? '#15803d' : n.status === 'void' || n.status === 'refunded' ? '#475569' : '#b45309';
  const statusLabel = n.status === 'paid' ? 'PAID IN FULL' : n.status === 'void' ? 'VOID' : n.status === 'refunded' ? 'REFUNDED' : 'PAYMENT PENDING';

  const halfRate = Number((n.taxRate / 2).toFixed(1));
  const taxRows = n.gstType === 'igst'
    ? `<div style="display:flex;justify-content:space-between;color:#475569;font-size:12.5px"><span>IGST (${n.taxRate}%)</span><span>₹${formatInr(n.igst)}</span></div>`
    : `<div style="display:flex;justify-content:space-between;color:#475569;font-size:12.5px"><span>CGST (${halfRate}%)</span><span>₹${formatInr(n.cgst)}</span></div>
       <div style="display:flex;justify-content:space-between;color:#475569;font-size:12.5px"><span>SGST (${halfRate}%)</span><span>₹${formatInr(n.sgst)}</span></div>`;

  const discountRow = n.discount > 0
    ? `<div style="display:flex;justify-content:space-between;color:#16a34a;font-size:12.5px"><span>Discount ${n.couponCode ? `(${n.couponCode})` : ''}</span><span>-₹${formatInr(n.discount)}</span></div>`
    : '';

  const roundOffRow = n.roundOff !== 0
    ? `<div style="display:flex;justify-content:space-between;color:#64748b;font-size:12px"><span>Round Off</span><span>${n.roundOff > 0 ? '+' : ''}₹${n.roundOff.toFixed(2)}</span></div>`
    : '';

  const gatewayFeeRow = n.gatewayFeeAdded
    ? `<div style="display:flex;justify-content:space-between;color:#64748b;font-size:12px"><span>Payment Gateway Fee + GST (2.36%)</span><span>₹${formatInr(n.gatewayFeeAmount + n.gatewayFeeGst)}</span></div>`
    : '';

  const bankBlock = n.sellerBankAccount ? `
    <div>
      <div style="font-weight:700;color:#0f172a;margin-bottom:4px">Bank Account Details:</div>
      ${n.sellerBankName ? `<div>Bank: ${n.sellerBankName}</div>` : ''}
      <div>Account Name: ${n.sellerLegalName}</div>
      <div>Account No: ${n.sellerBankAccount}</div>
      ${n.sellerBankIfsc ? `<div>IFSC: ${n.sellerBankIfsc}</div>` : ''}
      ${n.sellerBankBranch ? `<div>Branch: ${n.sellerBankBranch}</div>` : ''}
    </div>` : `
    <div>
      <div style="font-weight:700;color:#0f172a;margin-bottom:4px">Payment Information:</div>
      <div>Method: ${n.paymentMethod || 'UPI / Razorpay'}</div>
      ${n.orderId ? `<div>Order Ref: #${n.orderId}</div>` : ''}
      <div>Tax Mode: ${n.taxMode === 'inclusive' ? 'GST Inclusive' : 'GST Exclusive'}</div>
    </div>`;

  return `
  <div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#0f172a;background:#ffffff;font-size:12.5px;line-height:1.5">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #ec4899;padding-bottom:16px;margin-bottom:18px;gap:16px;flex-wrap:wrap">
      <div>
        <div style="font-size:21px;font-weight:900;color:#ec4899;letter-spacing:-0.02em">${n.sellerName}</div>
        ${n.sellerLegalName !== n.sellerName ? `<div style="font-size:11px;color:#64748b">(${n.sellerLegalName})</div>` : ''}
        <div style="font-size:11px;color:#64748b;margin-top:2px">Digital Interactive Experiences &amp; Bespoke Crafts</div>
        <div style="font-size:11px;color:#475569;margin-top:6px;line-height:1.45">
          <div>${n.sellerAddress}</div>
          <div><strong>GSTIN:</strong> ${n.sellerGstin || 'Unregistered / Pending'}${n.sellerPan ? ` &nbsp;|&nbsp; <strong>PAN:</strong> ${n.sellerPan}` : ''}</div>
          <div>State: ${n.sellerStateName} (Code: ${n.sellerStateCode})</div>
          <div>Email: ${n.sellerEmail}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="display:inline-block;background:#0f172a;color:#ffffff;font-size:10px;font-weight:800;letter-spacing:0.1em;padding:3px 10px;border-radius:4px;margin-bottom:4px">TAX INVOICE</div>
        <div style="font-size:15px;font-weight:800;color:#0f172a">${n.invoiceNumber}</div>
        <div style="font-size:11.5px;color:#64748b;margin-top:2px"><strong>Date:</strong> ${n.issuedDate}</div>
        ${n.dueDate ? `<div style="font-size:11.5px;color:#64748b"><strong>Due Date:</strong> ${n.dueDate}</div>` : ''}
        ${n.periodLabel ? `<div style="font-size:11.5px;color:#64748b"><strong>Period:</strong> ${n.periodLabel}</div>` : ''}
        <div style="font-size:11.5px;color:#64748b"><strong>Place of Supply:</strong> ${n.placeOfSupply}</div>
        <div style="font-size:11.5px;color:#64748b"><strong>Reverse Charge:</strong> No</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px;padding:12px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin-bottom:4px">Billed To (Buyer)</div>
        <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3px">${n.buyerName}</div>
        <div style="font-size:11.5px;color:#475569"><strong>GSTIN:</strong> ${n.buyerGstin || 'Unregistered / Consumer'}</div>
        ${n.buyerPan ? `<div style="font-size:11.5px;color:#475569"><strong>PAN:</strong> ${n.buyerPan}</div>` : ''}
        <div style="font-size:11.5px;color:#475569"><strong>Place of Supply:</strong> ${n.placeOfSupply}</div>
        ${n.buyerEmail ? `<div style="font-size:11.5px;color:#475569"><strong>Email:</strong> ${n.buyerEmail}</div>` : ''}
        ${n.buyerPhone ? `<div style="font-size:11.5px;color:#475569"><strong>Phone:</strong> ${n.buyerPhone}</div>` : ''}
        ${n.buyerAddress ? `<div style="font-size:11.5px;color:#475569"><strong>Address:</strong> ${n.buyerAddress}</div>` : ''}
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;margin-bottom:4px">Payment Status</div>
        <div style="display:inline-block;padding:4px 12px;border-radius:6px;font-size:11.5px;font-weight:800;background:${statusBg};color:${statusColor}">${statusLabel}</div>
        ${n.status === 'paid' && n.paidAt ? `<div style="font-size:11.5px;color:#166534;margin-top:6px">Paid: ${String(n.paidAt).split('T')[0]}</div>` : ''}
        ${n.paymentMethod ? `<div style="font-size:11px;color:#64748b;margin-top:2px">Method: ${n.paymentMethod}</div>` : ''}
        ${n.orderId ? `<div style="font-size:11px;color:#be185d;font-weight:600;margin-top:2px">Order Ref: #${n.orderId}</div>` : ''}
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
      <thead>
        <tr style="background:#f1f5f9;border-top:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1">
          <th style="padding:9px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;color:#475569;text-align:center;width:36px">#</th>
          <th style="padding:9px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;color:#475569;text-align:left">Description of Service</th>
          <th style="padding:9px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;color:#475569;text-align:center;width:80px">HSN/SAC</th>
          <th style="padding:9px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;color:#475569;text-align:center;width:50px">Qty</th>
          <th style="padding:9px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;color:#475569;text-align:right;width:110px">Rate (₹)</th>
          <th style="padding:9px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;color:#475569;text-align:right;width:120px">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
      <div style="width:290px;display:flex;flex-direction:column;gap:5px">
        ${discountRow}
        <div style="display:flex;justify-content:space-between;color:#475569;font-size:12.5px">
          <span>Taxable Value</span>
          <span>₹${formatInr(n.taxableAmount)}</span>
        </div>
        ${taxRows}
        ${roundOffRow}
        ${gatewayFeeRow}
        <div style="display:flex;justify-content:space-between;border-top:2px solid #0f172a;padding-top:7px;margin-top:3px;font-size:15px;font-weight:800;color:#0f172a">
          <span>Total Payable${n.taxMode === 'inclusive' ? ' (Incl. GST)' : ''}</span>
          <span>₹${formatInr(n.totalAmount)}</span>
        </div>
      </div>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;font-size:11.5px;color:#334155;margin-bottom:16px">
      <strong>Amount in Words:</strong> ${numberToWords(n.totalAmount)}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:12px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:14px;font-size:11.5px;color:#475569">
      ${bankBlock}
      <div>
        <div style="font-weight:700;color:#0f172a;margin-bottom:4px">Terms &amp; Conditions:</div>
        <div style="white-space:pre-line">${n.terms}</div>
        ${n.notes ? `<div style="margin-top:6px;font-style:italic">Notes: ${n.notes}</div>` : ''}
      </div>
    </div>

    <div style="border-top:1px solid #f1f5f9;padding-top:10px;font-size:10.5px;color:#94a3b8;text-align:center">
      ${n.footer}
      <div style="margin-top:3px">${n.sellerName} &nbsp;•&nbsp; Computer Generated GST Tax Invoice &nbsp;•&nbsp; lovelycrafts.in</div>
    </div>
  </div>`;
}

export function renderTaxInvoicePrintDocument(rawInv, companyProfile = {}) {
  const n = normalizeInvoiceForView(rawInv, companyProfile);
  const bodyHtml = renderTaxInvoiceBodyHtml(rawInv, companyProfile);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tax Invoice ${n.invoiceNumber} — ${n.sellerName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #ffffff; width: 210mm; min-height: 297mm; padding: 12mm 14mm; }
    @media print { body { width: 100%; padding: 0; } button { display: none !important; } }
  </style>
</head>
<body>
  ${bodyHtml}
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}
