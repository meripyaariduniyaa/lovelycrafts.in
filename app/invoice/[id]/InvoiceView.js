'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { renderTaxInvoiceBodyHtml } from '@/lib/invoice-template';

export default function InvoiceView({ invoice, companyProfile = {}, autoPrint = false }) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const invoiceHtml = useMemo(
    () => renderTaxInvoiceBodyHtml(invoice, companyProfile),
    [invoice, companyProfile]
  );

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
          border-radius: 14px;
          padding: 12px 20px;
        }
        .brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #be185d;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .action-buttons { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .btn-print {
          background: #ec4899;
          color: #ffffff;
          border: none;
          padding: 9px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-gift {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be185d;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .invoice-card {
          max-width: 820px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          padding: 36px 40px;
        }
        @media print {
          .invoice-actions-bar { display: none !important; }
          .invoice-page-wrapper { background: #ffffff; padding: 0; }
          .invoice-card { border: none; border-radius: 0; padding: 0; max-width: 100%; }
        }
      `}</style>

      <div className="invoice-actions-bar">
        <Link href="/" className="brand-link">LovelyCrafts</Link>
        <div className="action-buttons">
          {invoice?.noteId && (
            <Link href={`/n/${invoice.noteId}`} className="btn-gift">View Your Gift</Link>
          )}
          <button type="button" onClick={() => window.print()} className="btn-print">
            Print / Download PDF
          </button>
        </div>
      </div>

      <div className="invoice-card" dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
    </div>
  );
}
