'use client';

import { useEffect, useMemo, useState } from 'react';

const sections = ['welcome', 'family', 'couple', 'events', 'venue', 'gallery', 'rsvp', 'closing'];

function countdownTarget(dateValue, timezone) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number); const utcGuess = Date.UTC(year, month - 1, day);
  try { const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(utcGuess)); const values = Object.fromEntries(parts.map((part) => [part.type, part.value])); const localAsUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second)); return utcGuess - (localAsUtc - utcGuess); }
  catch { return utcGuess; }
}

function displayDate(dateValue) {
  if (!dateValue) return '';
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function toUtc(date, time, timezone) {
  if (!date || !time) return null;
  const [year, month, day] = date.split('-').map(Number); const [hour, minute] = time.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute); let instant = desired;
  try {
    for (let i = 0; i < 2; i += 1) {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone || 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
      const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      instant += desired - Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second));
    }
  } catch { return new Date(desired); }
  return new Date(instant);
}

function calendarDates(event, timezone) {
  if (!event.date) return null;
  if (!event.startTime) {
    const start = event.date.replaceAll('-', ''); const nextDay = new Date(`${event.date}T12:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    return { allDay: true, start, end: nextDay.toISOString().slice(0, 10).replaceAll('-', '') };
  }
  const start = toUtc(event.date, event.startTime, event.timezone || timezone);
  let end = event.endTime ? toUtc(event.date, event.endTime, event.timezone || timezone) : new Date(start.getTime() + 60 * 60 * 1000);
  if (end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  return { allDay: false, start: start.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), end: end.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') };
}

function eventLocation(event, invitation) { return [event.venueName || invitation.venueName, event.venueAddress || invitation.venueAddress].filter(Boolean).join(', '); }
function directionsUrl(event, invitation) { return event.mapsUrl || invitation.mapsUrl || (eventLocation(event, invitation) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation(event, invitation))}` : ''); }
function googleCalendarUrl(event, invitation) {
  const dates = calendarDates(event, invitation.timezone); if (!dates) return '';
  const params = new URLSearchParams({ action: 'TEMPLATE', text: `${event.title || event.type} — ${invitation.brideName} & ${invitation.groomName}`, dates: `${dates.start}/${dates.end}`, details: event.description || `You are invited to celebrate ${invitation.brideName} and ${invitation.groomName}.`, location: eventLocation(event, invitation), ctz: event.timezone || invitation.timezone || 'Asia/Kolkata' });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function downloadCalendar(event, invitation) {
  const dates = calendarDates(event, invitation.timezone); if (!dates) return;
  const uid = `${encodeURIComponent(event.id || event.date)}@lovelycrafts.in`;
  const escapeIcs = (value = '') => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const dateLines = dates.allDay ? `DTSTART;VALUE=DATE:${dates.start}\r\nDTEND;VALUE=DATE:${dates.end}` : `DTSTART:${dates.start}\r\nDTEND:${dates.end}`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LovelyCrafts//Shaadi//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, dateLines, `SUMMARY:${escapeIcs(`${event.title || event.type} — ${invitation.brideName} & ${invitation.groomName}`)}`, `DESCRIPTION:${escapeIcs(event.description || `You are invited to celebrate ${invitation.brideName} and ${invitation.groomName}.`)}`, `LOCATION:${escapeIcs(eventLocation(event, invitation))}`, directionsUrl(event, invitation) ? `URL:${escapeIcs(directionsUrl(event, invitation))}` : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${(event.title || event.type || 'wedding-event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`; anchor.click(); URL.revokeObjectURL(url);
}

function WeddingCountdown({ date, timezone }) {
  const [now, setNow] = useState(0);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(timer); }, []);
  const target = countdownTarget(date, timezone); if (!target || !now) return null; const remaining = Math.max(0, target - now); const days = Math.floor(remaining / 86_400_000); const hours = Math.floor((remaining % 86_400_000) / 3_600_000); const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return <div className="shaadi-countdown" aria-label={`${days} days until the wedding`}><span><strong>{days}</strong>days</span><span><strong>{hours}</strong>hours</span><span><strong>{minutes}</strong>minutes</span></div>;
}

export default function PublicWedding({ invitation, initialGuestCode = '' }) {
  const [showInvitation, setShowInvitation] = useState(false); const [musicOn, setMusicOn] = useState(false); const [rsvp, setRsvp] = useState({ name: '', phone: '', status: 'attending', guestCount: 1, eventIds: [], message: '', guestCode: initialGuestCode }); const [rsvpState, setRsvpState] = useState(''); const [rsvpBusy, setRsvpBusy] = useState(false);
  const template = useMemo(() => ({ 'royal-hindu': { motif: '✦', name: 'An auspicious celebration' }, 'gujarati-lagna': { motif: '❋', name: 'Lagna Patrika' }, 'royal-nikah': { motif: '۞', name: 'Nikah Mubarak' }, 'anand-karaj': { motif: '❀', name: 'Anand Karaj' }, 'christian-wedding': { motif: '❧', name: 'A celebration of love' }, 'jain-wedding': { motif: '❀', name: 'A blessed union' } }[invitation.templateId] || { motif: '✦', name: 'A celebration of love' }), [invitation.templateId]);
  const scenes = invitation.enabledScenes?.length ? invitation.enabledScenes : sections;
  const languageCode = ({ Hindi: 'hi', Gujarati: 'gu', Urdu: 'ur', Punjabi: 'pa', English: 'en' })[invitation.language] || 'en';
  const dateLabel = displayDate(invitation.weddingDate);
  async function submitRsvp(event) { event.preventDefault(); setRsvpBusy(true); setRsvpState(''); try { const response = await fetch(`/api/weddings/public/${invitation.slug}/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rsvp) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setRsvpState('Your response has been sent to the family. Thank you!'); } catch (error) { setRsvpState(error.message); } finally { setRsvpBusy(false); } }
  const hasScene = (id) => scenes.includes(id);
  useEffect(() => { fetch(`/api/weddings/public/${invitation.slug}/view`, { method: 'POST', keepalive: true }).catch(() => {}); }, [invitation.slug]);
  useEffect(() => { if (initialGuestCode) fetch(`/api/weddings/public/${invitation.slug}/guest?code=${encodeURIComponent(initialGuestCode)}`).then((r) => r.ok ? r.json() : null).then((guest) => guest && setRsvp((current) => ({ ...current, name: guest.name }))).catch(() => {}); }, [initialGuestCode, invitation.slug]);
  return <main className="shaadi-public" lang={languageCode} dir={languageCode === 'ur' ? 'rtl' : 'ltr'} style={{ '--invite-primary': invitation.appearance?.primary || '#7e1f2b', '--invite-accent': invitation.appearance?.accent || '#c19a55', '--invite-paper': invitation.appearance?.background || '#fff7e6', '--invite-font': invitation.appearance?.font === 'script' ? 'Dancing Script, cursive' : invitation.appearance?.font === 'sans' ? 'Inter, sans-serif' : 'Georgia, serif' }}>
    <header className="shaadi-public-tools"><span>LovelyCrafts Shaadi</span><div>{invitation.musicUrl && <button aria-pressed={musicOn} onClick={() => setMusicOn(!musicOn)}>{musicOn ? 'Pause music' : 'Play music'}</button>}<a href="#shaadi-invitation" onClick={() => setShowInvitation(true)}>Skip to invitation</a></div></header>
    {musicOn && invitation.musicUrl && <audio src={invitation.musicUrl} autoPlay loop controls className="shaadi-audio" />}
    <section className="shaadi-welcome" aria-label="Open wedding invitation"><div className="shaadi-envelope"><span aria-hidden="true">{template.motif}</span></div>{invitation.invocationEnabled && invitation.invocationText && <p className="shaadi-invocation">{invitation.invocationText}</p>}<p className="shaadi-public-eyebrow">You are warmly invited</p><h1>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h1><p>{dateLabel || template.name}</p><a className="shaadi-button" href="#shaadi-invitation" onClick={() => setShowInvitation(true)}>Open invitation</a><p className="shaadi-welcome-hint">A celebration begins with an invitation</p></section>
    <div id="shaadi-invitation" className={`shaadi-scenes ${showInvitation ? 'shaadi-scenes-open' : ''}`}>
      {hasScene('family') && (invitation.brideFamily || invitation.groomFamily || invitation.brideParents || invitation.groomParents || invitation.grandparents || invitation.familyMessage) && <section className="shaadi-scene shaadi-family-scene"><span className="shaadi-scene-motif">{template.motif}</span><p className="shaadi-public-eyebrow">With the blessings of our families</p><h2>Two families, one joyful celebration</h2><div className="shaadi-family-grid">{(invitation.brideFamily || invitation.brideParents) && <p>{invitation.brideFamily && <strong>{invitation.brideFamily}</strong>}{invitation.brideParents && <><br />{invitation.brideParents}</>}</p>}{(invitation.groomFamily || invitation.groomParents) && <p>{invitation.groomFamily && <strong>{invitation.groomFamily}</strong>}{invitation.groomParents && <><br />{invitation.groomParents}</>}</p>}</div>{invitation.grandparents && <p>{invitation.grandparents}</p>}{invitation.familyMessage && <p>{invitation.familyMessage}</p>}</section>}
      {hasScene('couple') && <section className="shaadi-scene"><span className="shaadi-scene-motif">{template.motif}</span><p className="shaadi-public-eyebrow">{invitation.tradition || template.name}</p><div className="shaadi-couple-photos">{invitation.couplePhoto ? <img src={invitation.couplePhoto} alt={`${invitation.brideName} and ${invitation.groomName}`} loading="lazy" /> : <div className="shaadi-portrait-pair">{invitation.bridePhoto && <img src={invitation.bridePhoto} alt={invitation.brideName} loading="lazy" />}{invitation.groomPhoto && <img src={invitation.groomPhoto} alt={invitation.groomName} loading="lazy" />}</div>}</div><h2>{invitation.brideName} <span>&amp;</span> {invitation.groomName}</h2>{invitation.coupleIntro && <p>{invitation.coupleIntro}</p>}{dateLabel && <p className="shaadi-date-label">{dateLabel}</p>}<WeddingCountdown date={invitation.weddingDate} timezone={invitation.timezone} /></section>}
      {hasScene('events') && <section className="shaadi-scene shaadi-events-scene"><p className="shaadi-public-eyebrow">Save the dates</p><h2>Join us for the celebrations</h2><div className="shaadi-event-list">{invitation.events?.map((event) => { const maps = directionsUrl(event, invitation); const calendar = calendarDates(event, invitation.timezone); return <article className="shaadi-public-event" key={event.id}><div className="shaadi-public-event-date">{displayDate(event.date) || 'Celebration'}</div><div><h3>{event.title || event.type}</h3>{event.description && <p>{event.description}</p>}<small>{[event.startTime && (event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime), event.venueName || invitation.venueName].filter(Boolean).join(' · ')}</small>{(event.venueAddress || invitation.venueAddress) && <small>{event.venueAddress || invitation.venueAddress}</small>}<div className="shaadi-event-actions">{maps && <a href={maps} target="_blank" rel="noreferrer">Get directions ↗</a>}{calendar && <><a href={googleCalendarUrl(event, invitation)} target="_blank" rel="noreferrer">Add to Google Calendar ↗</a><button type="button" onClick={() => downloadCalendar(event, invitation)}>Download calendar invite</button></>}</div></div></article>; })}</div></section>}
      {hasScene('venue') && (invitation.venueName || invitation.venueAddress) && <section className="shaadi-scene shaadi-venue-scene"><p className="shaadi-public-eyebrow">We look forward to welcoming you</p><h2>{invitation.venueName || 'Our celebration'}</h2><p>{invitation.venueAddress}</p>{directionsUrl({}, invitation) && <a className="shaadi-secondary-button" href={directionsUrl({}, invitation)} target="_blank" rel="noreferrer">Open directions ↗</a>}{invitation.parkingInfo && <p><strong>Parking</strong> · {invitation.parkingInfo}</p>}{invitation.accommodationInfo && <p><strong>Stay</strong> · {invitation.accommodationInfo}</p>}{invitation.contactInfo && <p><strong>Contact</strong> · {invitation.contactInfo}</p>}</section>}
      {hasScene('gallery') && invitation.gallery?.length > 0 && <section className="shaadi-scene"><p className="shaadi-public-eyebrow">Our memories</p><h2>A few moments we treasure</h2><div className="shaadi-gallery">{invitation.gallery.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Wedding memory ${index + 1}`} loading="lazy" />)}</div></section>}
      {hasScene('rsvp') && invitation.rsvpEnabled && <section className="shaadi-scene shaadi-rsvp-scene"><p className="shaadi-public-eyebrow">Please join us</p><h2>Will you celebrate with us?</h2>{invitation.rsvpMode === 'restricted' && !initialGuestCode ? <p className="shaadi-rsvp-private-note">RSVP is available through your personal invitation link from the family.</p> : <form className="shaadi-rsvp-form" onSubmit={submitRsvp}><label>Your name<input required maxLength={100} value={rsvp.name} onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })} /></label>{invitation.rsvpPhoneRequired && <label>Phone number<input required type="tel" maxLength={30} value={rsvp.phone} onChange={(e) => setRsvp({ ...rsvp, phone: e.target.value })} /></label>}<label>Response<select value={rsvp.status} onChange={(e) => setRsvp({ ...rsvp, status: e.target.value })}><option value="attending">Joyfully attending</option><option value="maybe">Maybe</option><option value="declined">Unable to attend</option></select></label>{rsvp.status === 'attending' && <label>Number attending<input type="number" min="1" max="20" value={rsvp.guestCount} onChange={(e) => setRsvp({ ...rsvp, guestCount: e.target.value })} /></label>}{invitation.events?.length > 0 && <fieldset><legend>Celebrations you’ll attend</legend>{invitation.events.map((event) => <label className="shaadi-rsvp-event" key={event.id}><input type="checkbox" checked={rsvp.eventIds.includes(event.id)} onChange={(e) => setRsvp({ ...rsvp, eventIds: e.target.checked ? [...rsvp.eventIds, event.id] : rsvp.eventIds.filter((id) => id !== event.id) })} />{event.title || event.type}</label>)}</fieldset>}<label>A note for the family (optional)<textarea maxLength={500} rows={3} value={rsvp.message} onChange={(e) => setRsvp({ ...rsvp, message: e.target.value })} /></label><button className="shaadi-button" disabled={rsvpBusy}>{rsvpBusy ? 'Sending…' : 'Send my response'}</button>{rsvpState && <p role="status">{rsvpState}</p>}</form>}</section>}
      {hasScene('closing') && <section className="shaadi-scene shaadi-closing-scene"><span className="shaadi-scene-motif">{template.motif}</span><p>{invitation.closingMessage || 'With love and blessings, we look forward to celebrating together.'}</p><h2>{invitation.brideName} &amp; {invitation.groomName}</h2><button className="shaadi-secondary-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to the beginning ↑</button></section>}
    </div>
    <footer className="shaadi-public-footer">Made with care by LovelyCrafts Shaadi</footer>
  </main>;
}
