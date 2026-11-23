import { randomBytes } from 'node:crypto';

export const WEDDING_TEMPLATES = [
  { id: 'royal-hindu', slug: 'royal-hindu', name: 'Royal Hindu Shaadi', tradition: 'Hindu', language: 'Hindi', colors: ['#7e1f2b', '#c99a45', '#fff5dc'], motif: '✦', description: 'A classic maroon and antique gold invitation with a warm family welcome.' },
  { id: 'gujarati-lagna', slug: 'gujarati-lagna', name: 'Gujarati Lagna Patrika', tradition: 'Gujarati', language: 'Gujarati', colors: ['#9d3a22', '#d5a53b', '#fff4d3'], motif: '❋', description: 'Saffron, red and gold for a joyful Lagna Patrika.' },
  { id: 'royal-nikah', slug: 'royal-nikah', name: 'Royal Nikah', tradition: 'Muslim', language: 'Urdu', colors: ['#174b40', '#c6a367', '#f5efdf'], motif: '۞', description: 'An emerald and ivory invitation framed with geometric detail.' },
  { id: 'anand-karaj', slug: 'anand-karaj', name: 'Anand Karaj', tradition: 'Sikh', language: 'Punjabi', colors: ['#243755', '#c5a161', '#fffaf0'], motif: '❀', description: 'A serene ivory, navy and gold celebration of family.' },
  { id: 'christian-wedding', slug: 'christian-wedding', name: 'Christian Wedding', tradition: 'Christian', language: 'English', colors: ['#eee6d4', '#b39265', '#fffdf7'], motif: '❧', description: 'Soft ivory and champagne with a refined floral finish.' },
  { id: 'jain-wedding', slug: 'jain-wedding', name: 'Jain Wedding', tradition: 'Jain', language: 'Hindi', colors: ['#8f332d', '#c7a15c', '#fff7e5'], motif: '❀', description: 'Ivory, deep red and antique gold in a calm traditional style.' },
];

export const EVENT_TYPES = ['Engagement', 'Roka', 'Tilak', 'Haldi', 'Mehendi', 'Sangeet', 'Garba', 'Baraat', 'Wedding Ceremony', 'Pheras', 'Nikah', 'Walima', 'Anand Karaj', 'Reception', 'Custom Event'];

export function cleanString(value, max = 2000) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
export function createSlug() { return `wedding-${randomBytes(12).toString('hex')}`; }

export function normalizeWeddingInput(input = {}, previous = {}, templateConfig = null) {
  const source = { ...previous, ...input, appearance: { ...previous.appearance, ...input.appearance } };
  const templateId = WEDDING_TEMPLATES.some((item) => item.id === source.templateId) ? source.templateId : 'royal-hindu';
  const template = templateConfig || WEDDING_TEMPLATES.find((item) => item.id === templateId);
  const events = Array.isArray(source.events) ? source.events.slice(0, 50).map((event, index) => ({
    id: cleanString(event.id, 80) || `event-${index + 1}`, type: cleanString(event.type, 80) || 'Custom Event', title: cleanString(event.title, 120), description: cleanString(event.description, 600),
    date: safeDate(event.date), startTime: safeTime(event.startTime), endTime: safeTime(event.endTime), timezone: safeTimeZone(event.timezone),
    venueName: cleanString(event.venueName, 160), venueAddress: cleanString(event.venueAddress, 500), mapsUrl: safeMapsUrl(event.mapsUrl), dressCode: cleanString(event.dressCode, 120), displayOrder: index,
  })) : [];
  return {
    templateId, tradition: cleanString(source.tradition, 80) || template.tradition, language: cleanString(source.language, 40) || template.language,
    brideName: cleanString(source.brideName, 100), groomName: cleanString(source.groomName, 100), coupleIntro: cleanString(source.coupleIntro, 1000),
    bridePhoto: safeImageUrl(source.bridePhoto), groomPhoto: safeImageUrl(source.groomPhoto), couplePhoto: safeImageUrl(source.couplePhoto),
    brideFamily: cleanString(source.brideFamily, 400), groomFamily: cleanString(source.groomFamily, 400), brideParents: cleanString(source.brideParents, 240), groomParents: cleanString(source.groomParents, 240), grandparents: cleanString(source.grandparents, 400), familyMessage: cleanString(source.familyMessage, 1200),
    invocationEnabled: source.invocationEnabled === true, invocationText: cleanString(source.invocationText, 500), weddingDate: safeDate(source.weddingDate), timezone: safeTimeZone(source.timezone), events,
    venueName: cleanString(source.venueName, 160), venueAddress: cleanString(source.venueAddress, 500), mapsUrl: safeMapsUrl(source.mapsUrl), parkingInfo: cleanString(source.parkingInfo, 400), accommodationInfo: cleanString(source.accommodationInfo, 400), contactInfo: cleanString(source.contactInfo, 160),
    closingMessage: cleanString(source.closingMessage, 1000), musicUrl: safeAudioUrl(source.musicUrl), gallery: Array.isArray(source.gallery) ? source.gallery.slice(0, 20).map(safeImageUrl).filter(Boolean) : [],
    appearance: { primary: safeColor(source.appearance?.primary) || template.colors[0], accent: safeColor(source.appearance?.accent) || template.colors[1], background: safeColor(source.appearance?.background) || template.colors[2], font: ['serif', 'sans', 'script'].includes(source.appearance?.font) ? source.appearance.font : 'serif' },
    enabledScenes: Array.isArray(source.enabledScenes) ? ['welcome', 'family', 'couple', 'events', 'venue', 'gallery', 'rsvp', 'closing'].filter((scene) => source.enabledScenes.includes(scene)) : ['welcome', 'family', 'couple', 'events', 'venue', 'gallery', 'rsvp', 'closing'],
    rsvpEnabled: source.rsvpEnabled !== false, rsvpPhoneRequired: source.rsvpPhoneRequired === true, rsvpMode: source.rsvpMode === 'restricted' ? 'restricted' : 'open', searchable: source.searchable === true,
  };
}

function safeDate(value) { const text = cleanString(value, 40); if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return ''; const [year, month, day] = text.split('-').map(Number); return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === text ? text : ''; }
function safeTime(value) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '') ? value : ''; }
function safeTimeZone(value) { const timezone = cleanString(value, 80) || 'Asia/Kolkata'; try { new Intl.DateTimeFormat('en-IN', { timeZone: timezone }); return timezone; } catch { return 'Asia/Kolkata'; } }
function safeImageUrl(value) { const text = cleanString(value, 1000); return /^https:\/\/(res\.cloudinary\.com|images\.lovelycrafts\.in)\//i.test(text) ? text : ''; }
function safeAudioUrl(value) { const text = cleanString(value, 1000); return /^https:\/\//i.test(text) ? text : ''; }
function safeMapsUrl(value) { const text = cleanString(value, 600); return /^https:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\//i.test(text) ? text : ''; }
function safeColor(value) { return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : ''; }

export function publicWeddingData(invitation) {
  const { ownerId, ownerEmail, createdAt, updatedAt, revision, paymentStatus, orderId, pendingOrderId, publishedRevisionId, status, ...publicData } = invitation;
  return publicData;
}
