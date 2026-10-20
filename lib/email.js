import { Resend } from 'resend';

// ponytail: using Resend's shared domain for now; swap FROM_EMAIL to receipts@lovelycrafts.in
// once the domain is verified in the Resend dashboard.
// Keep local builds and payment verification routes usable without email
// credentials. The sender already skips receipt delivery when the key is absent.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send a purchase receipt to the buyer.
 * Fire-and-forget — caller should wrap in try/catch.
 *
 * @param {{
 *   to: string,
 *   buyerName: string,
 *   orderId: string,
 *   templateId: string,
 *   amountRupees: number,
 *   paymentMethod: string,
 *   noteId: string,
 *   discountPercent?: number,
 * }} opts
 */
export async function sendReceipt({
  to,
  buyerName,
  orderId,
  templateId,
  amountRupees,
  paymentMethod,
  noteId,
  discountPercent = 0,
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping receipt email.');
    return;
  }

  const giftUrl = `https://lovelycrafts.in/p/${noteId}`;
  const formattedAmount = amountRupees === 0 ? 'FREE (Coupon Applied)' : `₹${amountRupees.toFixed(2)}`;
  const discountLine = discountPercent > 0 ? `<p style="color:#16a34a;margin:0 0 6px">✅ Discount applied: ${discountPercent}% off</p>` : '';

  await resend.emails.send({
    from: FROM,
    to,
    subject: '🎁 Your LovelyCrafts Gift is Unlocked!',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(190,24,93,0.08);max-width:560px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f43f5e,#be185d);padding:32px 32px 24px;text-align:center">
            <p style="margin:0 0 8px;font-size:2.5rem">🎁</p>
            <h1 style="margin:0;color:#ffffff;font-size:1.5rem;font-weight:900;letter-spacing:-0.02em">
              Payment Confirmed!
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.88);font-size:0.9rem">
              Your gift has been unlocked on LovelyCrafts
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 20px;color:#374151;font-size:0.95rem;line-height:1.6">
              Hi <strong>${buyerName || 'there'}</strong> 💖<br>
              Thank you for your purchase! Here's your receipt:
            </p>

            <!-- Receipt Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f8;border:1.5px solid #fecdd3;border-radius:14px;overflow:hidden;margin-bottom:20px">
              <tr><td style="padding:20px">
                <table width="100%" cellpadding="6" cellspacing="0">
                  <tr>
                    <td style="color:#9f1239;font-size:0.8rem;font-weight:700;text-transform:uppercase;width:140px">Order ID</td>
                    <td style="color:#1f2937;font-size:0.85rem;font-family:monospace">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="color:#9f1239;font-size:0.8rem;font-weight:700;text-transform:uppercase">Gift Template</td>
                    <td style="color:#1f2937;font-size:0.85rem;text-transform:capitalize">${templateId}</td>
                  </tr>
                  <tr>
                    <td style="color:#9f1239;font-size:0.8rem;font-weight:700;text-transform:uppercase">Payment Method</td>
                    <td style="color:#1f2937;font-size:0.85rem">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="color:#9f1239;font-size:0.8rem;font-weight:700;text-transform:uppercase">Amount Paid</td>
                    <td style="color:#1f2937;font-size:1.1rem;font-weight:900">${formattedAmount}</td>
                  </tr>
                </table>
                ${discountLine}
              </td></tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <tr><td align="center">
                <a href="${giftUrl}" style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#be185d);color:#ffffff;text-decoration:none;font-weight:900;font-size:0.95rem;padding:14px 32px;border-radius:999px;box-shadow:0 6px 20px rgba(244,63,94,0.35)">
                  🎁 View Your Gift
                </a>
              </td></tr>
            </table>

            <p style="margin:0;color:#6b7280;font-size:0.82rem;line-height:1.6;border-top:1px solid #fce7f3;padding-top:16px">
              Your gift link is valid for <strong>90 days</strong>. Keep this email safe as your proof of purchase.<br>
              Need help? Reply to this email or contact us at <a href="mailto:support@lovelycrafts.in" style="color:#be185d">support@lovelycrafts.in</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fff1f2;padding:16px 32px;text-align:center;border-top:1px solid #fce7f3">
            <p style="margin:0;color:#be185d;font-size:0.78rem">© LovelyCrafts · Made with 💖 in India</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
