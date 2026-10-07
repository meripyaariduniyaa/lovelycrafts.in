import crypto from 'crypto';

export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
};

export const CORPORATE_ROLES = {
  BUSINESS_OWNER: 'business_owner',
  HR_ADMIN: 'hr_admin',
  HR_OPERATOR: 'hr_operator',
  APPROVER: 'approver',
  VIEWER: 'viewer',
};

export const CORPORATE_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    maxEmployees: 100,
    monthlyCredits: 20,
    maxAdmins: 3,
    requiresApproval: false,
    pricePerMonthPaise: 499900,
  },
  growth: {
    id: 'growth',
    name: 'Growth Plan',
    maxEmployees: 500,
    monthlyCredits: 100,
    maxAdmins: 10,
    requiresApproval: true,
    pricePerMonthPaise: 1499900,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    maxEmployees: 5000,
    monthlyCredits: 1000,
    maxAdmins: 50,
    requiresApproval: true,
    pricePerMonthPaise: 4999900,
  },
};

export const OCCASION_TYPES = {
  BIRTHDAY: 'birthday',
  WORK_ANNIVERSARY: 'work_anniversary',
  WELCOME: 'welcome',
  FAREWELL: 'farewell',
  APPRECIATION: 'appreciation',
  PROMOTION: 'promotion',
  ACHIEVEMENT: 'achievement',
  PROJECT_COMPLETION: 'project_completion',
  FESTIVAL_GREETING: 'festival_greeting',
};

export const TASK_STATUSES = {
  UPCOMING: 'upcoming',
  READY_TO_CREATE: 'ready_to_create',
  IN_PROGRESS: 'in_progress',
  AWAITING_INFO: 'awaiting_info',
  AWAITING_APPROVAL: 'awaiting_approval',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};

export const EXPERIENCE_STATUSES = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  AWAITING_INFO: 'awaiting_info',
  AWAITING_APPROVAL: 'awaiting_approval',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  REVOKED: 'revoked',
  CANCELLED: 'cancelled',
};

// Valid state machine transitions for business applications
const VALID_TRANSITIONS = {
  [APPLICATION_STATUSES.PENDING]: [APPLICATION_STATUSES.UNDER_REVIEW, APPLICATION_STATUSES.APPROVED, APPLICATION_STATUSES.REJECTED, APPLICATION_STATUSES.ARCHIVED],
  [APPLICATION_STATUSES.UNDER_REVIEW]: [APPLICATION_STATUSES.APPROVED, APPLICATION_STATUSES.REJECTED, APPLICATION_STATUSES.PENDING, APPLICATION_STATUSES.ARCHIVED],
  [APPLICATION_STATUSES.APPROVED]: [APPLICATION_STATUSES.SUSPENDED, APPLICATION_STATUSES.ARCHIVED],
  [APPLICATION_STATUSES.REJECTED]: [APPLICATION_STATUSES.UNDER_REVIEW, APPLICATION_STATUSES.ARCHIVED],
  [APPLICATION_STATUSES.SUSPENDED]: [APPLICATION_STATUSES.APPROVED, APPLICATION_STATUSES.ARCHIVED],
  [APPLICATION_STATUSES.ARCHIVED]: [],
};

export function isValidStatusTransition(fromStatus, toStatus) {
  if (!fromStatus || !toStatus) return false;
  if (fromStatus === toStatus) return true;
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

export function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export function generateInvitationToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateRecipientToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export function validateApplicationInput(data = {}) {
  const errors = [];
  const companyName = String(data.company_name || '').trim();
  const businessEmail = String(data.business_email || '').trim().toLowerCase();
  const contactName = String(data.contact_name || '').trim();
  const designation = String(data.designation || '').trim();
  const employeeCount = String(data.employee_count || '').trim();
  const website = String(data.website || '').trim();
  const message = String(data.message || '').trim();

  if (!companyName || companyName.length < 2) {
    errors.push('Company name must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!businessEmail || !emailRegex.test(businessEmail)) {
    errors.push('A valid business email address is required.');
  }

  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
  const domain = businessEmail.split('@')[1];
  const isFreeDomain = domain && freeEmailDomains.includes(domain);

  if (!contactName || contactName.length < 2) {
    errors.push("Contact person's full name is required.");
  }

  if (!designation) {
    errors.push('Job title or responsibility is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    isFreeDomain,
    sanitized: {
      company_name: companyName,
      business_email: businessEmail,
      contact_name: contactName,
      designation: designation,
      employee_count: employeeCount || '10-50',
      website: website || null,
      use_cases: Array.isArray(data.use_cases) ? data.use_cases : ['birthdays', 'work_anniversaries'],
      estimated_frequency: String(data.estimated_frequency || 'monthly'),
      message: message || null,
      terms_accepted: Boolean(data.terms_accepted),
    },
  };
}

export function buildAuditLog({ businessId, actorUid, actorEmail, action, details = {} }) {
  return {
    business_id: businessId || null,
    actor_uid: actorUid || 'system',
    actor_email: actorEmail || 'system@lovelycrafts.in',
    action: String(action),
    details,
    created_at: new Date().toISOString(),
  };
}
