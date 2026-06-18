export const ROLE_PRIORITY = {
  ROLE_ADMIN: 1,
  ROLE_BIOMED: 2,
  ROLE_USER: 3,
};

/**
 * Gets the highest priority role from an array of roles.
 * @param {string[]} roles Array of role strings (e.g., ["ROLE_USER", "ROLE_ADMIN"])
 * @returns {string|null} The highest priority role string
 */
export const getHighestRole = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return null;

  // Sort roles based on priority (lower number is higher priority)
  const sortedRoles = [...roles].sort((a, b) => {
    const priorityA = ROLE_PRIORITY[a] !== undefined ? ROLE_PRIORITY[a] : 2;
    const priorityB = ROLE_PRIORITY[b] !== undefined ? ROLE_PRIORITY[b] : 2;
    return priorityA - priorityB;
  });

  return sortedRoles[0];
};

/**
 * Gets the dashboard path for a specific role.
 * @param {string} role The role string
 * @returns {string} The relative path to the dashboard
 */
export const getDashboardPath = (role) => {
  switch (role) {
    case "ROLE_ADMIN":
      return "/main/dashboard/adminrole";
    case "ROLE_USER":
      return "/main/dashboard/userrole";
    default:
      // Fallback for ROLE_BIOMED and any other custom roles
      return "/main/dashboard/biomedrole";
  }
};

