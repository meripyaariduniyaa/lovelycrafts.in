'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function InvoiceView({ invoice, autoPrint = false }) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const items = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items
    : [{
        description: 'Interactive Digital Experience & Keepsake',
        quantity: 1,
        unitPrice: invoice.subtotal || invoice.totalAmount || 0,
        total: invoice.subtotal || invoice.totalAmount || 0,
      }];

  const subtotal = Number(invoice.subtotal || invoice.totalAmount || 0);
  const discount = Number(invoice.discount || 0);
  const totalAmount = Number(invoice.totalAmount ?? (subtotal - discount));
  const isPaid = (invoice.status || 'paid').toLowerCase() === 'paid';

  return (
    <div className="invoice-page-wrapper">
      <style>{`
        .invoice-page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding: 24px 16px 48px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
        }

        .invoice-actions-bar {
          max-width: 820px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 12px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #be185d;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: -0.02em;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn-print {
          background: linear-gradient(135deg, #f43f5e 0%, #be185d 100%);
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(244, 63, 94, 0.28);
          transition: all 0.2s ease;
        }

        .btn-print:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(244, 63, 94, 0.38);
        }

        .btn-gift {
          background: #fff1f2;
          border: 1.5px solid #fecdd3;
          color: #be185d;
          padding: 9px 18px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-gift:hover {
          background: #ffe4e6;
        }

        .invoice-card {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 40px 48px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid #f43f5e;
          padding-bottom: 24px;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .company-name {
          font-size: 1.75rem;
          font-weight: 900;
          color: #be185d;
          letter-spacing: -0.03em;
          margin: 0 0 4px;
        }

        .company-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0 0 2px;
        }

        .company-contact {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0;
        }

        .invoice-title-block {
          text-align: right;
        }

        .invoice-main-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: 0.05em;
          margin: 0 0 4px;
        }

        .invoice-number-tag {
          font-size: 0.95rem;
          font-weight: 800;
          color: #be185d;
          font-family: monospace;
          margin: 0 0 4px;
        }

        .invoice-date {
          font-size: 0.82rem;
          color: #64748b;
          margin: 0;
        }

        .invoice-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-bottom: 32px;
          background: #fafafa;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 18px 24px;
        }

        .meta-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 6px;
        }

        .meta-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .meta-sub {
          font-size: 0.84rem;
          color: #475569;
          line-height: 1.4;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .status-paid {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .status-pending {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
        }

        .items-table th {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 14px;
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #475569;
          text-align: left;
        }

        .items-table td {
          padding: 14px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.88rem;
        }

        .item-desc {
          font-weight: 700;
          color: #0f172a;
        }

        .item-subdesc {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 2px;
        }

        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }

        .totals-box {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.88rem;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          color: #64748b;
        }

        .totals-row-discount {
          display: flex;
          justify-content: space-between;
          color: #16a34a;
          font-weight: 700;
        }

        .totals-row-final {
          display: flex;
          justify-content: space-between;
          border-top: 2px solid #0f172a;
          padding-top: 10px;
          margin-top: 4px;
          font-size: 1.15rem;
          font-weight: 900;
          color: #0f172a;
        }

        .invoice-footer-block {
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          align-items: flex-end;
        }

        .terms-text {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.6;
          white-space: pre-line;
        }

        .seal-box {
          text-align: right;
          border-left: 2px dashed #fecdd3;
          padding-left: 16px;
        }

        .seal-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #be185d;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .seal-sub {
          font-size: 0.68rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        @media (max-width: 640px) {
          .invoice-card {
            padding: 24px 18px;
          }
          .invoice-meta-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 16px;
          }
          .invoice-title-block {
            text-align: left;
          }
          .totals-box {
            width: 100%;
          }
          .invoice-footer-block {
            grid-template-columns: 1fr;
          }
          .seal-box {
            text-align: left;
            border-left: none;
            border-top: 1px dashed #fecdd3;
            padding-left: 0;
            padding-top: 12px;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .invoice-page-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .invoice-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Top Action Bar (hidden when printing) */}
      <div className="invoice-actions-bar no-print">
        <Link href="/" className="brand-link">
          <span>💖</span>
          <span>LovelyCrafts</span>
        </Link>

        <div className="action-buttons">
          {invoice.noteId && (
            <Link href={`/p/${invoice.noteId}`} className="btn-gift">
              🎁 Open Gift
            </Link>
          )}

          <button onClick={() => window.print()} className="btn-print" id="invoice-download-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* The Printable Invoice Document */}
      <div className="invoice-card" id="printable-invoice">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <h1 className="company-name">LovelyCrafts</h1>
            <p className="company-subtitle">Bespoke Digital Experiences &amp; Crafts</p>
            <p className="company-contact">support@lovelycrafts.in • https://lovelycrafts.in</p>
          </div>

          <div className="invoice-title-block">
            <div className="invoice-main-title">TAX INVOICE / RECEIPT</div>
            <div className="invoice-number-tag">{invoice.invoiceNumber || 'LC-INV-AUTO'}</div>
            <div className="invoice-date">Issued Date: {invoice.issuedDate || new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Customer & Payment Meta Grid */}
        <div className="invoice-meta-grid">
          <div>
            <div className="meta-label">Billed To</div>
            <div className="meta-name">{invoice.customerName || 'LovelyCrafts Customer'}</div>
            {invoice.customerEmail && <div className="meta-sub">📧 {invoice.customerEmail}</div>}
            {invoice.customerPhone && <div className="meta-sub">📞 {invoice.customerPhone}</div>}
            {invoice.orderId && (
              <div className="meta-sub" style={{ marginTop: '4px', fontWeight: 600, color: '#be185d' }}>
                Order Ref: #{invoice.orderId}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="meta-label">Payment Status</div>
            <div style={{ marginBottom: '8px' }}>
              <span className={`status-badge ${isPaid ? 'status-paid' : 'status-pending'}`}>
                {isPaid ? '✓ PAID IN FULL' : 'PAYMENT PENDING'}
              </span>
            </div>
            <div className="meta-sub">Method: <strong>{invoice.paymentMethod || 'UPI / Razorpay'}</strong></div>
            <div className="meta-sub">
              Paid At: {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : (invoice.issuedDate || 'Confirmed')}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Qty</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Rate (₹)</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div className="item-desc">{item.description || 'Digital Experience'}</div>
                  <div className="item-subdesc">Instant online delivery • 90-day active hosting</div>
                </td>
                <td style={{ textAlign: 'center', color: '#475569' }}>{item.quantity || 1}</td>
                <td style={{ textAlign: 'right', color: '#475569' }}>₹{Number(item.unitPrice || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                  ₹{Number(item.total || ((item.quantity || 1) * (item.unitPrice || 0))).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="totals-section">
          <div className="totals-box">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="totals-row-discount">
                <span>Discount {invoice.couponCode ? `(${invoice.couponCode})` : ''}</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="totals-row">
              <span>CGST (0%)</span>
              <span>₹0.00</span>
            </div>

            <div className="totals-row">
              <span>SGST (0%)</span>
              <span>₹0.00</span>
            </div>

            <div className="totals-row-final">
              <span>Total Paid</span>
              <span>{totalAmount === 0 ? 'FREE' : `₹${totalAmount.toFixed(2)}`}</span>
            </div>
          </div>
        </div>

        {/* Footer, Notes, and Stamp */}
        <div className="invoice-footer-block">
          <div className="terms-text">
            <strong>Notes &amp; Terms:</strong><br />
            {invoice.notes || 'Thank you for choosing LovelyCrafts!'}<br />
            {invoice.terms || '1. Access to digital interactive experience granted.\n2. Invoiced amount inclusive of applicable digital taxes (CGST 0%, SGST 0%).'}
          </div>

          <div className="seal-box">
            <div className="seal-title">LovelyCrafts Official</div>
            <div className="seal-sub">Digitally generated tax invoice</div>
            <div className="seal-sub">No physical signature required</div>
            <div className="seal-sub" style={{ marginTop: '4px', color: '#be185d', fontWeight: 700 }}>
              💖 Made with love in India
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
