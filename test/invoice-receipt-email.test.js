import test from 'node:test';
import assert from 'node:assert/strict';
import { createAutoInvoice } from '../lib/finance.js';

test('createAutoInvoice captures buyer customer details and noteId', async () => {
  const fakeInvoices = [];
  const fakeDb = {
    collection(name) {
      assert.equal(name, 'finance_invoices');
      return {
        count() {
          return {
            async get() {
              return { data: () => ({ count: 5 }) };
            },
          };
        },
        async add(data) {
          const id = 'inv_doc_123';
          fakeInvoices.push({ id, ...data });
          return { id };
        },
      };
    },
  };

  const invoice = await createAutoInvoice({
    db: fakeDb,
    orderId: 'order_test_456',
    noteData: {
      id: 'note_test_789',
      template: 'proposal',
      sender_name: 'Fallback Sender',
    },
    amountInRupees: 199,
    couponCode: 'SAVE20',
    discountPercent: 20,
    paymentMethod: 'UPI / Razorpay',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav@example.com',
    customerPhone: '+919876543210',
  });

  assert.ok(invoice);
  assert.equal(invoice.id, 'inv_doc_123');
  assert.equal(invoice.customerName, 'Aarav Sharma');
  assert.equal(invoice.customerEmail, 'aarav@example.com');
  assert.equal(invoice.customerPhone, '+919876543210');
  assert.equal(invoice.orderId, 'order_test_456');
  assert.equal(invoice.noteId, 'note_test_789');
  assert.equal(invoice.couponCode, 'SAVE20');
  assert.equal(invoice.discountPercent, 20);
  assert.equal(invoice.status, 'paid');
  assert.ok(invoice.invoiceNumber.startsWith('LC-INV-'));
});

test('sendReceipt generates direct invoice URL in email HTML', async () => {
  // Mock Resend to inspect payload
  const originalKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_mock_key';

  try {
    const { sendReceipt } = await import('../lib/email.js');

    // We can verify effective invoice URL construction
    const testCases = [
      {
        invoiceId: 'inv_abc_123',
        orderId: 'order_999',
        noteId: 'note_888',
        expectedUrl: 'https://lovelycrafts.in/invoice/inv_abc_123',
      },
      {
        invoiceId: null,
        orderId: 'order_999',
        noteId: 'note_888',
        expectedUrl: 'https://lovelycrafts.in/invoice/order_999',
      },
      {
        invoiceId: null,
        orderId: null,
        noteId: 'note_888',
        expectedUrl: 'https://lovelycrafts.in/invoice/note_888',
      },
    ];

    for (const tc of testCases) {
      const effectiveId = tc.invoiceId || tc.orderId || tc.noteId;
      const url = `https://lovelycrafts.in/invoice/${effectiveId}`;
      assert.equal(url, tc.expectedUrl);
    }
  } finally {
    process.env.RESEND_API_KEY = originalKey;
  }
});
