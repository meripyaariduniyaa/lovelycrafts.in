import { getAdminAuth, getAdminDb } from './firebase-admin.js';
import { isAdminEmail } from './admin-check.js';
import { CORPORATE_ROLES } from './business.js';
export { CORPORATE_ROLES };

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
  const cleanSlug = decodeURIComponent(String(businessSlug || '')).toLowerCase().trim();
  let bizSnap = await db
    .collection('businesses')
    .where('slug', '==', cleanSlug)
    .limit(1)
    .get();

  if (bizSnap.empty && cleanSlug.includes(' ')) {
    bizSnap = await db
      .collection('businesses')
      .where('slug', '==', cleanSlug.replace(/\s+/g, '-'))
      .limit(1)
      .get();
  }

  if (bizSnap.empty && cleanSlug.includes('-')) {
    bizSnap = await db
      .collection('businesses')
      .where('slug', '==', cleanSlug.replace(/-/g, ' '))
      .limit(1)
      .get();
  }

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
  let membership = null;
  const userSnap = await db
    .collection('business_users')
    .doc(decodedToken.uid)
    .get();

  if (userSnap.exists) {
    membership = userSnap.data();
  } else if (
    (business.business_email && business.business_email.toLowerCase() === decodedToken.email?.toLowerCase()) ||
    (Array.isArray(business.admin_uids) && business.admin_uids.includes(decodedToken.uid))
  ) {
    // Primary business owner auto-link
    membership = {
      uid: decodedToken.uid,
      business_id: business.id,
      business_slug: business.slug,
      email: decodedToken.email?.toLowerCase(),
      role: CORPORATE_ROLES.BUSINESS_OWNER,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    await db.collection('business_users').doc(decodedToken.uid).set(membership, { merge: true });
  }

  if (!membership) {
    throw new Error('You do not have access to this corporate workspace.');
  }

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
