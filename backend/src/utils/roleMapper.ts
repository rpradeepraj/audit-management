/**
 * Role Normalization & Formatting Helper
 * Maps between frontend assigned roles and PostgreSQL enum `user_role_type`.
 */

export const ASSIGNED_ROLES = [
  "Admin",
  "Audit Manager",
  "Auditor",
  "Client Representative",
] as const;

export type AssignedRoleType = (typeof ASSIGNED_ROLES)[number];

/**
 * Normalizes frontend role into a valid database user_role_type value.
 */
export function normalizeRoleForDb(role?: string): string {
  if (!role) return "Auditor";
  const r = role.trim();
  if (r === "Client Representative") return "Auditee Representative";
  if (r === "Admin") return "Platform Admin";
  return r;
}

/**
 * Formats database enum value into one of the 4 assigned roles.
 */
export function formatRoleFromDb(role?: string): string {
  if (!role) return "Auditor";
  const r = role.trim();
  if (
    r === "Auditee Representative" ||
    r === "Auditee Viewer" ||
    r === "Customer Representative"
  ) {
    return "Client Representative";
  }
  if (r === "Platform Admin" || r === "Firm Admin" || r === "Company Admin") {
    return "Admin";
  }
  return r;
}
