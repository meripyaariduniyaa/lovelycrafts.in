# LovelyCrafts digital experiences

The LovelyCrafts customer app creates interactive digital gifts and the LovelyCrafts Shaadi wedding invitation experience. It uses Next.js, Firebase, Cloudinary and Razorpay.

## Run locally

1. Copy `.env.example` to `.env.local` and fill in Firebase, Cloudinary, Razorpay, and Firebase Admin values.
2. Create a Cloudinary unsigned upload preset matching `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
3. Install dependencies and run `npm run dev`.
4. Deploy `firestore.rules` with the Firebase CLI before production use.

The public recipient route reads through Firebase Admin so creator/payment fields are never exposed to the browser. Razorpay verification is performed server-side with the webhook signature formula.

## LovelyCrafts Shaadi

Shaadi adds Indian wedding invitation templates, a customer editor, versioned publishing, public invitation pages, RSVPs and private guest links. Its customer and guest routes live under `/wedding-invitations`, `/dashboard/weddings` and `/w/[slug]`. Wedding administration, price settings, moderation and refunds are managed only in the separate `admin.lovelycrafts.in` app.

The module is disabled until an administrator saves a wedding price and enables Shaadi from the Wedding Invitations page in the admin portal. The public browser never reads or writes wedding records directly; server routes verify Firebase ID tokens and use Firebase Admin. Configure the existing Firebase Admin credentials, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in both app deployments. Do not expose the Cloudinary API secret as a `NEXT_PUBLIC_*` variable.

Wedding data is stored in server-only Firestore collections (`wedding_invitations`, published `wedding_revisions`, `wedding_templates`, `wedding_families`, `wedding_events`, `wedding_media`, `wedding_guests`, `wedding_rsvps`, `wedding_orders`, `wedding_payment_settlements`, `wedding_analytics`, and wedding audit/rate-limit collections). The invitation record is the editor's source of truth; family and event collections are synchronized records, while a published revision is the guest-facing snapshot. Deploy the updated `firestore.rules` to staging before enabling Shaadi. Wedding orders are kept out of the existing Creator Club commission path. Razorpay's signed webhook must be configured with `RAZORPAY_WEBHOOK_SECRET` for wedding payment and refund settlement.

For staging, start the customer and admin apps with their usual Next.js commands, configure both deployments to the same Firebase project, set the payment and upload secrets, deploy Firestore rules, then save a staging price and enable Shaadi in the admin portal. Test payment and refund events using the matching Razorpay environment. Keep the setting disabled until the staging journey and existing gift regression checks pass.
