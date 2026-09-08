import { UserRole, ActiveTab } from "../../shared/types/audit";

export interface RoleMatrixEntry {
  module: string;
  tabId: ActiveTab;
  admin: string;
  companyAdmin: string;
  auditManager: string;
  auditor: string;
  customerRep: string;
  customerViewer: string;
}

export const ROLE_ACCESS_MATRIX: RoleMatrixEntry[] = [
  { module: "Dashboard", tabId: "dashboard", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Audit Firm", tabId: "company-admin", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Audit Templates", tabId: "templates", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Audit Planning", tabId: "planning", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Perform Audit", tabId: "perform", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Findings", tabId: "findings", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Corrective Actions", tabId: "capa", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Audit Reports", tabId: "reports", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
  { module: "Activity & Logs", tabId: "audit-trail", admin: "✓", companyAdmin: "✓", auditManager: "✓", auditor: "✓", customerRep: "✓", customerViewer: "✓" },
];

export function getRolePermissionForModule(_role?: UserRole, _tabId?: ActiveTab): string {
  return "✓";
}

export function isModuleAllowedForRole(_role?: UserRole, _tabId?: ActiveTab): boolean {
  return true;
}

// Module-specific action permissions - universally enabled for Platform Admin
export function canManageTemplates(_role?: UserRole): boolean {
  return true;
}

export function canManageCustomers(_role?: UserRole): boolean {
  return true;
}

export function canCreateAuditPlan(_role?: UserRole): boolean {
  return true;
}

export function canExecutePerformAudit(_role?: UserRole): boolean {
  return true;
}

export function canReviewPerformAudit(_role?: UserRole): boolean {
  return true;
}

export function canLogFindings(_role?: UserRole): boolean {
  return true;
}

export function canFormulateCapa(_role?: UserRole): boolean {
  return true;
}

export function canReviewCapa(_role?: UserRole): boolean {
  return true;
}

export function canApproveReport(_role?: UserRole): boolean {
  return true;
}

export function isCustomerRole(_role?: UserRole): boolean {
  return false;
}
