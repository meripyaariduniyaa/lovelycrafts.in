import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'node:crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/creator-auth';

export const WEDDING_TEMPLATES = [
  { id: 'royal-hindu', slug: 'royal-hindu', name: 'Royal Hindu Shaadi', tradition: 'Hindu', language: 'Hindi', colors: ['#7e1f2b', '#c99a45', '#fff5dc'], motif: '✦', description: 'A classic maroon and antique gold invitation with a warm family welcome.' },
  { id: 'gujarati-lagna', slug: 'gujarati-lagna', name: 'Gujarati Lagna Patrika', tradition: 'Gujarati', language: 'Gujarati', colors: ['#9d3a22', '#d5a53b', '#fff4d3'], motif: '❋', description: 'Saffron, red and gold for a joyful Lagna Patrika.' },
  { id: 'royal-nikah', slug: 'royal-nikah', name: 'Royal Nikah', tradition: 'Muslim', language: 'Urdu', colors: ['#174b40', '#c6a367', '#f5efdf'], motif: '۞', description: 'An emerald and ivory invitation framed with geometric detail.' },
  { id: 'anand-karaj', slug: 'anand-karaj', name: 'Anand Karaj', tradition: 'Sikh', language: 'Punjabi', colors: ['#243755', '#c5a161', '#fffaf0'], motif: '❀', description: 'A serene ivory, navy and gold celebration of family.' },
  { id: 'christian-wedding', slug: 'christian-wedding', name: 'Christian Wedding', tradition: 'Christian', language: 'English', colors: ['#eee6d4', '#b39265', '#fffdf7'], motif: '❧', description: 'Soft ivory and champagne with a refined floral finish.' },
  { id: 'jain-wedding', slug: 'jain-wedding', name: 'Jain Wedding', tradition: 'Jain', language: 'Hindi', colors: ['#8f332d', '#c7a15c', '#fff7e5'], motif: '❀', description: 'Ivory, deep red and antique gold in a calm traditional style.' },
];

export const EVENT_TYPES = ['Engagement', 'Roka', 'Tilak', 'Haldi', 'Mehendi', 'Sangeet', 'Garba', 'Baraat', 'Wedding Ceremony', 'Pheras', 'Nikah', 'Walima', 'Anand Karaj', 'Reception', 'Custom Event'];

export async function getWeddingTemplates(includeDisabled = false) {
  try {
    const snapshot = await getAdminDb().collection('wedding_templates').limit(20).get(); const saved = new Map(snapshot.docs.map((doc) => [doc.id, doc.data()]));
    return WEDDING_TEMPLATES.map((template) => ({ ...template, ...saved.get(template.id), id: template.id, slug: template.slug, enabled: saved.get(template.id)?.enabled !== false })).filter((template) => includeDisabled || template.enabled);
  } catch { return WEDDING_TEMPLATES.map((template) => ({ ...template, enabled: true })); }
}

export function cleanString(value, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function serializeWedding(snapshot) {
  if (!snapshot?.exists) return null;
  const data = snapshot.data();
  return { id: snapshot.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString() || null, updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null, publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null };
}

export async function weddingUser(request) {
  const user = await requireUser(request);
  return { uid: user.uid, email: user.email || '' };
}

export function assertWeddingOwner(invitation, uid) {
  if (!invitation || invitation.ownerId !== uid) throw Object.assign(new Error('Wedding invitation not found.'), { status: 404 });
}

export function createSlug() {
  return `wedding-${randomBytes(12).toString('hex')}`;
}

export function normalizeWeddingInput(input = {}, previous = {}, templateConfig = null) {
  const templateId = WEDDING_TEMPLATES.some((item) => item.id === input.templateId) ? input.templateId : previous.templateId || 'royal-hindu';
  const template = templateConfig || WEDDING_TEMPLATES.find((item) => item.id === templateId);
  const events = Array.isArray(input.events) ? input.events.slice(0, 50).map((event, index) => ({
    id: cleanString(event.id, 80) || `event-${index + 1}`,
    type: cleanString(event.type, 80) || 'Custom Event', title: cleanString(event.title, 120), description: cleanString(event.description, 600),
    date: safeDate(event.date), startTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(event.startTime || '') ? event.startTime : '', endTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(event.endTime || '') ? event.endTime : '', timezone: safeTimeZone(event.timezone),
    venueName: cleanString(event.venueName, 160), venueAddress: cleanString(event.venueAddress, 500), mapsUrl: safeMapsUrl(event.mapsUrl), dressCode: cleanString(event.dressCode, 120), displayOrder: index,
  })) : previous.events || [];
  return {
    templateId,
    tradition: cleanString(input.tradition, 80) || WEDDING_TEMPLATES.find((item) => item.id === templateId).tradition,
    language: cleanString(input.language, 40) || WEDDING_TEMPLATES.find((item) => item.id === templateId).language,
    brideName: cleanString(input.brideName, 100), groomName: cleanString(input.groomName, 100),
    coupleIntro: cleanString(input.coupleIntro, 1000), bridePhoto: safeImageUrl(input.bridePhoto), groomPhoto: safeImageUrl(input.groomPhoto), couplePhoto: safeImageUrl(input.couplePhoto),
    brideFamily: cleanString(input.brideFamily, 400), groomFamily: cleanString(input.groomFamily, 400), brideParents: cleanString(input.brideParents, 240), groomParents: cleanString(input.groomParents, 240), grandparents: cleanString(input.grandparents, 400), familyMessage: cleanString(input.familyMessage, 1200),
    invocationEnabled: input.invocationEnabled === true, invocationText: cleanString(input.invocationText, 500),
    weddingDate: safeDate(input.weddingDate), timezone: safeTimeZone(input.timezone),
    events, venueName: cleanString(input.venueName, 160), venueAddress: cleanString(input.venueAddress, 500), mapsUrl: safeMapsUrl(input.mapsUrl),
    parkingInfo: cleanString(input.parkingInfo, 400), accommodationInfo: cleanString(input.accommodationInfo, 400), contactInfo: cleanString(input.contactInfo, 160),
    closingMessage: cleanString(input.closingMessage, 1000), musicUrl: safeAudioUrl(input.musicUrl), gallery: Array.isArray(input.gallery) ? input.gallery.slice(0, 20).map(safeImageUrl).filter(Boolean) : (previous.gallery || []),
    appearance: { primary: safeColor(input.appearance?.primary) || template.colors[0], accent: safeColor(input.appearance?.accent) || template.colors[1], background: safeColor(input.appearance?.background) || template.colors[2], font: ['serif', 'sans', 'script'].includes(input.appearance?.font) ? input.appearance.font : 'serif' },
    enabledScenes: Array.isArray(input.enabledScenes) ? ['welcome', 'family', 'couple', 'events', 'venue', 'gallery', 'rsvp', 'closing'].filter((scene) => input.enabledScenes.includes(scene)) : ['welcome', 'family', 'couple', 'events', 'venue', 'gallery', 'rsvp', 'closing'],
    rsvpEnabled: input.rsvpEnabled !== false, rsvpPhoneRequired: input.rsvpPhoneRequired === true, rsvpMode: input.rsvpMode === 'restricted' ? 'restricted' : 'open', searchable: input.searchable === true,
  };
}

function safeImageUrl(value) {
  const text = cleanString(value, 1000);
  return /^https:\/\/(res\.cloudinary\.com|images\.lovelycrafts\.in)\//i.test(text) ? text : '';
}
function safeDate(value) {
  const text = cleanString(value, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '';
  const [year, month, day] = text.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === text ? text : '';
}
function safeTimeZone(value) {
  const timezone = cleanString(value, 80) || 'Asia/Kolkata';
  try { new Intl.DateTimeFormat('en-IN', { timeZone: timezone }); return timezone; } catch { return 'Asia/Kolkata'; }
}
function safeAudioUrl(value) { const text = cleanString(value, 1000); return /^https:\/\//i.test(text) ? text : ''; }
function safeMapsUrl(value) { const text = cleanString(value, 600); return /^https:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\//i.test(text) ? text : ''; }
function safeColor(value) { return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : ''; }

export async function createWeddingRevision(db, id, invitation, actorUid) {
  const revisionRef = db.collection('wedding_revisions').doc();
  await revisionRef.set({ invitationId: id, revision: invitation.revision || 1, data: invitation, createdBy: actorUid, createdAt: FieldValue.serverTimestamp() });
  return revisionRef.id;
}

export async function syncWeddingContentRecords(db, invitationId, invitation) {
  const existingEvents = await db.collection('wedding_events').where('invitationId', '==', invitationId).limit(100).get();
  const batch = db.batch();
  existingEvents.docs.forEach((doc) => batch.delete(doc.ref));
  (invitation.events || []).forEach((event) => batch.set(db.collection('wedding_events').doc(), { invitationId, ...event, updatedAt: FieldValue.serverTimestamp() }));
  batch.set(db.collection('wedding_families').doc(invitationId), { invitationId, brideFamily: invitation.brideFamily || '', groomFamily: invitation.groomFamily || '', brideParents: invitation.brideParents || '', groomParents: invitation.groomParents || '', grandparents: invitation.grandparents || '', familyMessage: invitation.familyMessage || '', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
}

export function publicWeddingData(invitation) {
  const { ownerId, ownerEmail, createdAt, updatedAt, revision, paymentStatus, orderId, pendingOrderId, publishedRevisionId, status, ...publicData } = invitation;
  return publicData;
}
