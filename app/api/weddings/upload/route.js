import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { weddingUser } from '@/lib/weddings';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
const MAX_BYTES = 10 * 1024 * 1024;

function imageType(buffer) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return 'image/png';
  if (buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(request) {
  try {
    const user = await weddingUser(request); const form = await request.formData(); const file = form.get('file'); const invitationId = String(form.get('invitationId') || '');
    if (!file || typeof file.arrayBuffer !== 'function' || file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: 'Choose an image under 10 MB.' }, { status: 400 });
    const invitation = await getAdminDb().collection('wedding_invitations').doc(invitationId).get();
    if (!invitation.exists || invitation.data().ownerId !== user.uid) return NextResponse.json({ error: 'Wedding invitation not found.' }, { status: 404 });
    const bytes = Buffer.from(await file.arrayBuffer()); const detectedType = imageType(bytes);
    if (!detectedType || detectedType !== file.type) return NextResponse.json({ error: 'Only valid JPG, PNG and WebP images are accepted.' }, { status: 415 });
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; const apiKey = process.env.CLOUDINARY_API_KEY; const secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !apiKey || !secret) return NextResponse.json({ error: 'Photo uploads are not configured.' }, { status: 503 });
    const timestamp = Math.floor(Date.now() / 1000); const folder = `wedding-invitations/${user.uid}/${invitationId}`;
    const transformation = 'q_auto:good,f_auto';
    const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}&transformation=${transformation}${secret}`).digest('hex');
    const cloudForm = new FormData(); cloudForm.append('file', new Blob([bytes], { type: detectedType }), file.name || 'wedding-photo'); cloudForm.append('api_key', apiKey); cloudForm.append('timestamp', String(timestamp)); cloudForm.append('folder', folder); cloudForm.append('signature', signature); cloudForm.append('transformation', transformation);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: cloudForm, cache: 'no-store' }); const payload = await response.json();
    if (!response.ok || !payload.secure_url) return NextResponse.json({ error: 'Photo upload failed.' }, { status: 502 });
    await getAdminDb().collection('wedding_media').add({ invitationId, ownerId: user.uid, publicId: payload.public_id, url: payload.secure_url, format: payload.format, bytes: payload.bytes, createdAt: new Date() });
    return NextResponse.json({ url: payload.secure_url, assetId: payload.public_id, format: payload.format, bytes: payload.bytes });
  } catch (error) { return NextResponse.json({ error: error.message || 'Unable to upload photo.' }, { status: error.status || 400 }); }
}
