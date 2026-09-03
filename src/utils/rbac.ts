import { UserRole, ActiveTab } from "../types/audit";

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
  {
    module: "Dashboard",
    tabId: "dashboard",
    admin: "✓",
    companyAdmin: "✓",
    auditManager: "✓",
    auditor: "✓",
    customerRep: "✓",
    customerViewer: "✓",
  },
  {
    module: "Audit Firm",
    tabId: "company-admin",
    admin: "✓",
    companyAdmin: "✓",
    auditManager: "✓",
    auditor: "✓",
    customerRep: "✓",
    customerViewer: "-",
  },
  {
    module: "Audit Templates",
    tabId: "templates",
    admin: "✓",
    companyAdmin: "✓",
    auditManager: "✓",
    auditor: "-",
    customerRep: "-",
    customerViewer: "-",
  },
  {
    module: "Audit Planning",
    tabId: "planning",
    admin: "✓",
    companyAdmin: "✓",
    auditManager: "✓",
    auditor: "✓",
    customerRep: "✓",
    customerViewer: "-",
  },
  {
    module: "Perform Audit",
    tabId: "perform",
    admin: "✓",
    companyAdmin: "✓",
    auditManager: "-",
    auditor: "✓",
    customerRep: "-",
    customerViewer: "-",
  },
  {
    module: "Findings",
    tabId: "findings",
    admin: "-",
    companyAdmin: "-",
    auditManager: "✓",
    auditor: "✓",
    customerRep: "✓",
    customerViewer: "✓",
  },
  {
    module: "Corrective Actions",
    tabId: "capa",
    admin: "-",
    companyAdmin: "-",
    auditManager: "✓",
    auditor: "✓",
    customerRep: "✓",
    customerViewer: "✓",
  },
  {
    module: "Audit Reports",
    tabId: "reports",
    admin: "-",
    companyAdmin: "-",
    auditManager: "✓",
    auditor: "✓",
    customerRep: "✓",
    customerViewer: "✓",
  },
  {
    module: "Activity & Logs",
    tabId: "audit-trail",
    admin: "-",
    companyAdmin: "-",
    auditManager: "✓",
    auditor: "-",
    customerRep: "-",
    customerViewer: "-",
  },
];

export function getRolePermissionForModule(role: UserRole, tabId: ActiveTab): string {
  const item = ROLE_ACCESS_MATRIX.find((entry) => entry.tabId === tabId);
  if (!item) {
    return "✓";
  }

  switch (role) {
    case "Admin":
      return item.admin;
    case "Company Admin":
      return item.companyAdmin;
    case "Audit Manager":
      return item.auditManager;
    case "Auditor":
      return item.auditor;
    case "Customer Representative":
      return item.customerRep;
    case "Customer Viewer":
      return item.customerViewer;
    default:
      return "-";
  }
}

export function isModuleAllowedForRole(role: UserRole, tabId: ActiveTab): boolean {
  const perm = getRolePermissionForModule(role, tabId);
  return perm !== "-";
}

// Module-specific action permissions
export function canManageTemplates(role: UserRole): boolean {
  return role === "Admin" || role === "Company Admin" || role === "Audit Manager";
}

export function canManageCustomers(role: UserRole): boolean {
  return role === "Admin" || role === "Company Admin" || role === "Audit Manager";
}

export function canCreateAuditPlan(role: UserRole): boolean {
  return role === "Admin" || role === "Company Admin" || role === "Audit Manager";
}

export function canExecutePerformAudit(role: UserRole): boolean {
  return role === "Auditor" || role === "Admin" || role === "Company Admin";
}

export function canReviewPerformAudit(role: UserRole): boolean {
  return role === "Audit Manager" || role === "Company Admin" || role === "Admin";
}

export function canLogFindings(role: UserRole): boolean {
  return role === "Auditor" || role === "Audit Manager" || role === "Company Admin" || role === "Admin";
}

export function canFormulateCapa(role: UserRole): boolean {
  return role === "Customer Representative" || role === "Admin" || role === "Company Admin";
}

export function canReviewCapa(role: UserRole): boolean {
  return role === "Audit Manager" || role === "Company Admin" || role === "Admin";
}

export function canApproveReport(role: UserRole): boolean {
  return role === "Audit Manager" || role === "Company Admin" || role === "Admin";
}

export function isCustomerRole(role: UserRole): boolean {
  return role === "Customer Representative" || role === "Customer Viewer";
}
