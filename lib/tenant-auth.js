import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/creator-club';
import { CORPORATE_ROLES } from '@/lib/business';

export const ROLE_PERMISSIONS = {
  [CORPORATE_ROLES.BUSINESS_OWNER]: {
    manageSettings: true,
    manageMembers: true,
    manageBilling: true,
    manageEmployees: true,
    createExperiences: true,
    approveExperiences: true,
    publishExperiences: true,
    viewReports: true,
  },
  [CORPORATE_ROLES.HR_ADMIN]: {
    manageSettings: false,
    manageMembers: false,
    manageBilling: false,
    manageEmployees: true,
    createExperiences: true,
    approveExperiences: true,
    publishExperiences: true,
    viewReports: true,
  },
  [CORPORATE_ROLES.HR_OPERATOR]: {
    manageSettings: false,
    manageMembers: false,
    manageBilling: false,
    manageEmployees: true,
    createExperiences: true,
    approveExperiences: false,
    publishExperiences: false,
    viewReports: false,
  },
  [CORPORATE_ROLES.APPROVER]: {
    manageSettings: false,
    manageMembers: false,
    manageBilling: false,
    manageEmployees: false,
    createExperiences: false,
    approveExperiences: true,
    publishExperiences: true,
    viewReports: true,
  },
  [CORPORATE_ROLES.VIEWER]: {
    manageSettings: false,
    manageMembers: false,
    manageBilling: false,
    manageEmployees: false,
    createExperiences: false,
    approveExperiences: false,
    publishExperiences: false,
    viewReports: true,
  },
};

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perms = ROLE_PERMISSIONS[role] || {};
  return Boolean(perms[permission]);
}

/**
 * Validates request authorization for a specific tenant business workspace.
 * Prevents cross-tenant access and unauthorized operations.
 */
export async function requireBusinessUser(request, businessSlug, requiredPermission = null) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    throw new Error('Sign in required.');
  }

  const decodedToken = await getAdminAuth().verifyIdToken(token);
  const db = getAdminDb();

  // 1. Fetch business tenant record by slug
  const bizSnap = await db
    .collection('businesses')
    .where('slug', '==', String(businessSlug).toLowerCase().trim())
    .limit(1)
    .get();

  if (bizSnap.empty) {
    throw new Error('Business workspace not found.');
  }

  const businessDoc = bizSnap.docs[0];
  const business = { id: businessDoc.id, ...businessDoc.data() };

  if (business.status === 'suspended') {
    throw new Error('This business workspace has been suspended. Please contact LovelyCrafts support.');
  }

  // 2. Allow Platform Super Admin bypass for operational support
  const isSuperAdmin = isAdminEmail(decodedToken.email);
  if (isSuperAdmin) {
    return {
      user: decodedToken,
      business,
      membership: {
        role: CORPORATE_ROLES.BUSINESS_OWNER,
        is_platform_admin: true,
      },
    };
  }

  // 3. Verify user's tenant membership in business_users collection
  const userSnap = await db
    .collection('business_users')
    .doc(decodedToken.uid)
    .get();

  if (!userSnap.exists) {
    throw new Error('You do not have access to this corporate workspace.');
  }

  const membership = userSnap.data();

  // Enforce tenant boundary: user must belong to this specific business_id
  if (membership.business_id !== business.id || membership.status !== 'active') {
    throw new Error('Unauthorized cross-tenant access attempt.');
  }

  // 4. Check specific permission if requested
  if (requiredPermission && !hasPermission(membership.role, requiredPermission)) {
    throw new Error(`Insufficient permissions. Required: ${requiredPermission}`);
  }

  return {
    user: decodedToken,
    business,
    membership,
  };
}
