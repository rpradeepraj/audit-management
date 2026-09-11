/**
 * Centralized Route & API Endpoint Definitions for Audit Management System.
 * Separates routing configuration from UI and service logic.
 */

// Application Page / UI Routes
export const APP_ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    AUTH: "/auth",
  },
  DASHBOARD: "/dashboard",
  AUDIT_FIRMS: "/audit-firms",
  COMPANY_ADMIN: "/company-admin",
  PLANNING: "/planning",
  TEMPLATES: "/templates",
  CUSTOMERS: "/customers",
  AUDIT_EXECUTION: "/audit-execution",
  PERFORM: "/perform",
  FINDINGS: "/findings",
  CAPA: "/capa",
  REPORTS: "/reports",
  AUDIT_TRAIL: "/audit-trail",
} as const;

// Backend API Routes
export const API_ROUTES = {
  AUTH: {
    BASE: "/api/auth",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
    LOGOUT: "/api/auth/logout",
  },
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES] | string;
