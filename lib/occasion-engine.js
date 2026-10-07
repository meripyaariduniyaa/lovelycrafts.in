
/**
 * LovelyCrafts for Business — Occasion Engine
 * Detects upcoming occasions (birthdays, work anniversaries, welcome, etc.)
 * for each employee and generates occasion task records.
 */

import { OCCASION_TYPES, TASK_STATUSES } from '@/lib/business';

/**
 * Returns today's date in IST as a YYYY-MM-DD string.
 */
export function getTodayIST() {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return ist.toISOString().split('T')[0];
}

/**
 * Calculates days until the next occurrence of a recurring annual date (birthday / anniversary).
 * Returns an integer — negative means the event already passed this year (next is next year).
 */
export function daysUntilNextAnnualDate(dateStr, referenceDate = null) {
  if (!dateStr) return null;

  const today = referenceDate ? new Date(referenceDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const parts = String(dateStr).split('-');
  if (parts.length < 2) return null;

  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2] || parts[1], 10);

  if (isNaN(month) || isNaN(day)) return null;

  // This year's occurrence
  const thisYear = new Date(today.getFullYear(), month, day);
  thisYear.setHours(0, 0, 0, 0);

  let diff = Math.round((thisYear - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    // Already passed — compute next year
    const nextYear = new Date(today.getFullYear() + 1, month, day);
    nextYear.setHours(0, 0, 0, 0);
    diff = Math.round((nextYear - today) / (1000 * 60 * 60 * 24));
  }

  return diff;
}

/**
 * Returns how many years of a recurring date have elapsed by today.
 * Used for work anniversary year count (e.g., "5 years at Acme").
 */
export function yearsElapsed(dateStr, referenceDate = null) {
  if (!dateStr) return null;
  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return null;

  const years = ref.getFullYear() - start.getFullYear();
  const hasPassed =
    ref.getMonth() > start.getMonth() ||
    (ref.getMonth() === start.getMonth() && ref.getDate() >= start.getDate());

  return hasPassed ? years : years - 1;
}

/**
 * Returns the next occurrence date string (YYYY-MM-DD) of an annual date.
 */
export function nextOccurrenceDate(dateStr, referenceDate = null) {
  if (!dateStr) return null;
  const today = referenceDate ? new Date(referenceDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const parts = String(dateStr).split('-');
  if (parts.length < 2) return null;

  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2] || parts[1], 10);

  let candidate = new Date(today.getFullYear(), month, day);
  candidate.setHours(0, 0, 0, 0);

  if (candidate < today) {
    candidate = new Date(today.getFullYear() + 1, month, day);
  }

  return candidate.toISOString().split('T')[0];
}

/**
 * Generates occasion detection results for a single employee.
 * Returns an array of upcoming occasions with metadata.
 *
 * @param {Object} employee - Employee record from Firestore
 * @param {Object} options - { lookaheadDays: number, todayStr: string }
 * @returns {Array} occasions
 */
export function detectEmployeeOccasions(employee, options = {}) {
  const { lookaheadDays = 60, todayStr = null } = options;
  const occasions = [];

  // -- Birthday --
  if (employee.birthday) {
    const daysUntil = daysUntilNextAnnualDate(employee.birthday, todayStr);
    if (daysUntil !== null && daysUntil <= lookaheadDays) {
      const eventDate = nextOccurrenceDate(employee.birthday, todayStr);
      const age = yearsElapsed(employee.birthday, eventDate);
      occasions.push({
        type: OCCASION_TYPES.BIRTHDAY,
        label: 'Birthday',
        icon: '🎂',
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name || ''}`.trim(),
        employee_code: employee.employee_code,
        work_email: employee.work_email,
        department: employee.department,
        designation: employee.designation,
        event_date: eventDate,
        days_until: daysUntil,
        metadata: {
          birthday: employee.birthday,
          age: age !== null ? age + 1 : null,
        },
        suggested_template: 'birthday',
        urgency: daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'soon' : daysUntil <= 14 ? 'upcoming' : 'planned',
      });
    }
  }

  // -- Work Anniversary --
  if (employee.date_of_joining) {
    const daysUntil = daysUntilNextAnnualDate(employee.date_of_joining, todayStr);
    const yearsCompleted = yearsElapsed(employee.date_of_joining, todayStr);

    if (daysUntil !== null && daysUntil <= lookaheadDays && yearsCompleted !== null && yearsCompleted >= 0) {
      const eventDate = nextOccurrenceDate(employee.date_of_joining, todayStr);
      const yearsAtEvent = (yearsCompleted || 0) + 1;

      occasions.push({
        type: OCCASION_TYPES.WORK_ANNIVERSARY,
        label: `${yearsAtEvent} Year${yearsAtEvent !== 1 ? 's' : ''} Anniversary`,
        icon: '🏆',
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name || ''}`.trim(),
        employee_code: employee.employee_code,
        work_email: employee.work_email,
        department: employee.department,
        designation: employee.designation,
        event_date: eventDate,
        days_until: daysUntil,
        metadata: {
          date_of_joining: employee.date_of_joining,
          years_completed: yearsCompleted,
          years_at_event: yearsAtEvent,
        },
        suggested_template: 'anniversary',
        urgency: daysUntil <= 3 ? 'urgent' : daysUntil <= 7 ? 'soon' : daysUntil <= 14 ? 'upcoming' : 'planned',
      });
    }
  }

  return occasions;
}

/**
 * Scans an array of employees and returns all detected occasions within lookaheadDays,
 * sorted by event date ascending.
 */
export function scanAllOccasions(employees, options = {}) {
  const all = [];
  for (const employee of employees) {
    if (employee.status !== 'active') continue;
    const occ = detectEmployeeOccasions(employee, options);
    all.push(...occ);
  }

  return all.sort((a, b) => {
    if (a.days_until !== b.days_until) return a.days_until - b.days_until;
    return a.employee_name.localeCompare(b.employee_name);
  });
}

/**
 * Builds a Firestore occasion task document from a detected occasion.
 */
export function buildOccasionTask({ occasion, businessId, businessSlug, existingTaskId = null }) {
  const now = new Date().toISOString();
  const doc = {
    business_id: businessId,
    business_slug: businessSlug,
    employee_id: occasion.employee_id,
    employee_name: occasion.employee_name,
    employee_code: occasion.employee_code,
    work_email: occasion.work_email,
    department: occasion.department,
    designation: occasion.designation,
    occasion_type: occasion.type,
    occasion_label: occasion.label,
    icon: occasion.icon,
    event_date: occasion.event_date,
    days_until: occasion.days_until,
    urgency: occasion.urgency,
    metadata: occasion.metadata || {},
    suggested_template: occasion.suggested_template || null,
    updated_at: now,
    last_scanned_at: now,
  };
  if (!existingTaskId) {
    doc.status = TASK_STATUSES.UPCOMING;
    doc.created_at = now;
  }
  return doc;
}

/**
 * Returns a stable deterministic key for deduplicating occasion tasks.
 */
export function occasionTaskKey(businessId, employeeId, type, eventDate) {
  return `${businessId}__${employeeId}__${type}__${eventDate}`;
}

/**
 * Computes urgency color for display in the UI.
 */
export function urgencyColor(urgency) {
  switch (urgency) {
    case 'urgent':   return '#ef4444';
    case 'soon':     return '#f97316';
    case 'upcoming': return '#eab308';
    case 'planned':  return '#22c55e';
    default:         return '#64748b';
  }
}

/**
 * Formats a date string YYYY-MM-DD into a readable format like "15 Jan 2025".
 */
export function formatEventDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
