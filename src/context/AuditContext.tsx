import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  UserRole,
  FirmRole,
  Customer,
  AuditTemplate,
  AuditPlan,
  Finding,
  CorrectiveAction,
  AuditLog,
  NotificationItem,
  ActiveTab,
  ChecklistItemResponse,
  EvidenceAttachment,
  FindingSeverity,
  CompanyProfile,
  AuditFirm,
} from "../types/audit";
import {
  INITIAL_USERS,
  INITIAL_FIRM_ROLES,
  INITIAL_CUSTOMERS,
  INITIAL_TEMPLATES,
  INITIAL_AUDITS,
  INITIAL_FINDINGS,
  INITIAL_CAPAS,
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_FIRMS,
} from "../data/mockData";

const INITIAL_COMPANY_PROFILE: CompanyProfile = INITIAL_FIRMS[0];

export type CompanyAdminSubTab = "firms" | "template-firm" | "planning";

interface AuditContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  loginWithEmail: (email: string, password?: string) => { success: boolean; error?: string };
  registerUser: (userData: {
    name: string;
    email: string;
    role: UserRole;
    companyName: string;
    isCustomerUser: boolean;
  }) => { success: boolean; error?: string };
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, "id">) => string;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  firmRoles: FirmRole[];
  addFirmRole: (role: Omit<FirmRole, "id" | "createdAt">) => string;
  updateFirmRole: (id: string, updates: Partial<FirmRole>) => void;
  deleteFirmRole: (id: string) => void;
  firms: AuditFirm[];
  selectedFirmId: string;
  setSelectedFirmId: (id: string) => void;
  selectedFirm: AuditFirm;
  addFirm: (firm: Omit<AuditFirm, "id" | "createdAt">) => string;
  updateFirm: (id: string, updates: Partial<AuditFirm>) => void;
  deleteFirm: (id: string) => void;
  toggleFirmTemplate: (firmId: string, templateId: string) => void;
  companyProfile: CompanyProfile;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  customers: Customer[];
  templates: AuditTemplate[];
  audits: AuditPlan[];
  findings: Finding[];
  capas: CorrectiveAction[];
  logs: AuditLog[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  companyAdminSubTab: CompanyAdminSubTab;
  setCompanyAdminSubTab: (subTab: CompanyAdminSubTab) => void;
  planningExecutionMode: "plans" | "perform";
  setPlanningExecutionMode: (mode: "plans" | "perform") => void;
  activeAuditId: string | null;
  setActiveAuditId: (id: string | null) => void;
  activeFindingId: string | null;
  setActiveFindingId: (id: string | null) => void;
  activeCapaId: string | null;
  setActiveCapaId: (id: string | null) => void;
  activeCustomerId: string | null;
  setActiveCustomerId: (id: string | null) => void;
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRoleMatrixModalOpen: boolean;
  setIsRoleMatrixModalOpen: (open: boolean) => void;
  // Actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "totalAuditsCount" | "activeAuditsCount">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addUserToFirm: (firmId: string, firmName: string, userData: { name: string; email: string; role: UserRole; department?: string; phone?: string; avatar?: string }) => User;
  addTemplate: (template: Omit<AuditTemplate, "id" | "createdAt" | "updatedAt">) => string;
  cloneTemplate: (templateId: string, customTitle?: string) => string;
  updateTemplate: (id: string, updates: Partial<AuditTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createAudit: (audit: Omit<AuditPlan, "id" | "auditNumber" | "responses" | "findingsCount">) => string;
  rescheduleAudit: (auditId: string, scheduleUpdates: Partial<AuditPlan>) => void;
  confirmSchedule: (auditId: string) => void;
  sendScheduleReminder: (auditId: string) => void;
  updateAuditStatus: (id: string, status: AuditPlan["status"]) => void;
  updateAuditResponse: (auditId: string, questionId: string, response: Partial<ChecklistItemResponse>) => void;
  submitAuditExecution: (auditId: string, executiveSummary?: string) => void;
  completeAuditExecution: (auditId: string, executiveSummary?: string) => void;
  signAuditReport: (auditId: string, signerRole: "leadAuditor" | "auditManager" | "customerRep" | "manager", signerName: string) => void;
  addFinding: (finding: Omit<Finding, "id" | "findingNumber" | "createdAt">) => string;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  submitCapa: (capa: Omit<CorrectiveAction, "id" | "submittedAt" | "status">) => string;
  reviewCapa: (capaId: string, status: "Accepted" | "Rejected", feedback: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;
  resetAllData: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: "ams_current_user_id_v2",
  IS_AUTHENTICATED: "ams_is_authenticated_v2",
  CUSTOMERS: "ams_customers_v2",
  TEMPLATES: "ams_templates_v2",
  AUDITS: "ams_audits_v2",
  FINDINGS: "ams_findings_v2",
  CAPAS: "ams_capas_v2",
  LOGS: "ams_logs_v2",
  NOTIFICATIONS: "ams_notifications_v2",
  USERS: "ams_users_v2",
  COMPANY_PROFILE: "ams_company_profile_v2",
  FIRM_ROLES: "ams_firm_roles_v2",
};

export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [firmRoles, setFirmRoles] = useState<FirmRole[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FIRM_ROLES);
    return saved ? JSON.parse(saved) : INITIAL_FIRM_ROLES;
  });

  const [firms, setFirms] = useState<AuditFirm[]>(() => {
    const saved = localStorage.getItem("ams_firms_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_FIRMS;
  });

  const [selectedFirmId, setSelectedFirmId] = useState<string>(() => {
    const saved = localStorage.getItem("ams_selected_firm_id_v2");
    if (saved && INITIAL_FIRMS.some((f) => f.id === saved)) {
      return saved;
    }
    const cyber = INITIAL_FIRMS.find((f) => f.id === "firm_cyber_guard" || f.name.includes("CyberGuard"));
    return cyber ? cyber.id : INITIAL_FIRMS[0].id;
  });

  const selectedFirm: AuditFirm =
    firms.find((f) => f.id === selectedFirmId) || firms[0] || INITIAL_FIRMS[0];

  const companyProfile: CompanyProfile = selectedFirm;

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const userPool: User[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
    const found = userPool.find((u) => u.id === savedId);
    return found || INITIAL_USERS[0]; // Default: Victoria Sterling (Admin)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return savedAuth !== null ? savedAuth === "true" : true;
  });

  const [isRoleMatrixModalOpen, setIsRoleMatrixModalOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [templates, setTemplates] = useState<AuditTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (saved) {
      try {
        const parsed: AuditTemplate[] = JSON.parse(saved);
        // Ensure all 10 default industry templates exist in state
        const existingIds = new Set(parsed.map((t) => t.id));
        const missing = INITIAL_TEMPLATES.filter((t) => !existingIds.has(t.id));
        return [...parsed, ...missing];
      } catch {
        return INITIAL_TEMPLATES;
      }
    }
    return INITIAL_TEMPLATES;
  });

  const [audits, setAudits] = useState<AuditPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDITS);
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FINDINGS);
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [capas, setCapas] = useState<CorrectiveAction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAPAS);
    return saved ? JSON.parse(saved) : INITIAL_CAPAS;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>("dashboard");
  const [companyAdminSubTab, setCompanyAdminSubTab] = useState<CompanyAdminSubTab>("firms");
  const [planningExecutionMode, setPlanningExecutionMode] = useState<"plans" | "perform">("plans");

  const setActiveTab = (tab: ActiveTab) => {
    if (tab === "planning") {
      setActiveTabState("company-admin");
      setCompanyAdminSubTab("planning");
      setPlanningExecutionMode("plans");
    } else if (tab === "perform") {
      setActiveTabState("company-admin");
      setCompanyAdminSubTab("planning");
      setPlanningExecutionMode("perform");
    } else {
      setActiveTabState(tab);
    }
  };
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [activeCapaId, setActiveCapaId] = useState<string | null>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab("dashboard");
    addAuditLog("User Authenticated", "User", user.id, `Signed in as ${user.name} (${user.role})`);
    addNotification("Welcome Back", `Signed in successfully as ${user.name} (${user.role}).`, "info");
  };

  const loginWithEmail = (email: string, _password?: string): { success: boolean; error?: string } => {
    const trimmed = email.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        (trimmed === "admin@auditfirm.com" && (u.role === "Platform Admin" || u.role === "Admin")) ||
        (trimmed === "victoria.sterling@auditcore.global" && (u.role === "Platform Admin" || u.role === "Admin"))
    );
    if (!user) {
      return { success: false, error: "No user account registered with this email address. Please register or verify your credentials." };
    }
    login(user);
    return { success: true };
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    role: UserRole;
    companyName: string;
    isCustomerUser: boolean;
  }): { success: boolean; error?: string } => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: "An account with this email address already exists. Please log in." };
    }

    const newId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      companyName: userData.companyName,
      companyId: userData.isCustomerUser ? `cust_${Date.now()}` : "comp_veritas",
      isCustomerUser: userData.isCustomerUser,
    };

    // If customer user, also add customer organization if not exists
    if (userData.isCustomerUser) {
      const existingCustomer = customers.find((c) => c.name.toLowerCase() === userData.companyName.toLowerCase());
      if (!existingCustomer) {
        const newCustomer: Customer = {
          id: newUser.companyId,
          name: userData.companyName,
          code: userData.companyName.substring(0, 4).toUpperCase() + "-01",
          industry: "Client Enterprise",
          contactPerson: `${userData.name} (${userData.role})`,
          email: userData.email,
          phone: "+1 555 0199",
          address: "Corporate Headquarters",
          complianceRating: 85,
          riskLevel: "Low",
          activeAuditsCount: 1,
          totalAuditsCount: 1,
          createdAt: new Date().toISOString().split("T")[0],
          assignedManagerId: "usr_audit_mgr",
          assignedManagerName: "Elena Vance",
        };
        setCustomers((prev) => [newCustomer, ...prev]);
      }
    }

    setUsers((prev) => [...prev, newUser]);
    login(newUser);
    addAuditLog("Account Registered", "User", newId, `New account registered: ${newUser.name} with role ${newUser.role} at ${newUser.companyName}`);
    return { success: true };
  };

  const logout = () => {
    addAuditLog("User Logged Out", "User", currentUser.id, `User ${currentUser.name} signed out.`);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(capas));
  }, [capas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("ams_firms_v2", JSON.stringify(firms));
  }, [firms]);

  useEffect(() => {
    localStorage.setItem("ams_selected_firm_id_v2", selectedFirmId);
  }, [selectedFirmId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIRM_ROLES, JSON.stringify(firmRoles));
  }, [firmRoles]);

  const addFirm = (firmData: Omit<AuditFirm, "id" | "createdAt">): string => {
    const newId = `firm_${Date.now()}`;
    const newFirm: AuditFirm = {
      ...firmData,
      id: newId,
      createdAt: new Date().toISOString().split("T")[0],
      maintainedTemplateIds: firmData.maintainedTemplateIds || [
        "tmpl_ind_mfg_9001",
        "tmpl_ind_tech_27001",
      ],
    };
    setFirms((prev) => [...prev, newFirm]);
    addAuditLog("Added Audit Firm", "Firm", newId, `Registered new audit firm: ${newFirm.name} (${newFirm.code})`);
    addNotification("New Audit Firm Registered", `Audit firm '${newFirm.name}' was successfully added.`, "success", "company-admin");
    return newId;
  };

  const updateFirm = (id: string, updates: Partial<AuditFirm>) => {
    setFirms((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    addAuditLog("Updated Audit Firm", "Firm", id, `Updated configuration for firm ${updates.name || id}`);
    addNotification("Audit Firm Updated", `Firm details for '${updates.name || id}' were saved.`, "info", "company-admin");
  };

  const deleteFirm = (id: string) => {
    const firmToDelete = firms.find((f) => f.id === id);
    if (firms.length <= 1) {
      alert("At least one active audit firm must remain in the platform.");
      return;
    }
    const updated = firms.filter((f) => f.id !== id);
    setFirms(updated);
    if (selectedFirmId === id) {
      setSelectedFirmId(updated[0]?.id || "");
    }
    addAuditLog("Deleted Audit Firm", "Firm", id, `Removed audit firm: ${firmToDelete?.name || id}`);
    addNotification("Audit Firm Removed", `Audit firm '${firmToDelete?.name || id}' was deleted.`, "warning", "company-admin");
  };

  const toggleFirmTemplate = (firmId: string, templateId: string) => {
    setFirms((prev) =>
      prev.map((f) => {
        if (f.id !== firmId) return f;
        const current = f.maintainedTemplateIds || [];
        const hasTmpl = current.includes(templateId);
        const updatedTemplates = hasTmpl
          ? current.filter((t) => t !== templateId)
          : [...current, templateId];
        return { ...f, maintainedTemplateIds: updatedTemplates };
      })
    );
    addAuditLog("Updated Firm Templates", "Firm", firmId, `Updated maintained templates catalog for firm`);
  };

  const addFirmRole = (roleData: Omit<FirmRole, "id" | "createdAt">): string => {
    const newId = `role_${Date.now()}`;
    const newRole: FirmRole = {
      ...roleData,
      id: newId,
      createdAt: new Date().toISOString().split("T")[0],
      usersCount: 0,
    };
    setFirmRoles((prev) => [...prev, newRole]);
    addAuditLog("Added Firm Role", "User", newId, `Created new firm role: ${newRole.name} (${newRole.category})`);
    addNotification("New Firm Role Added", `Role '${newRole.name}' was registered for the firm.`, "info", "company-admin");
    return newId;
  };

  const updateFirmRole = (id: string, updates: Partial<FirmRole>) => {
    setFirmRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    addAuditLog("Updated Firm Role", "User", id, `Updated role: ${updates.name || id}`);
    addNotification("Firm Role Updated", `Role '${updates.name || id}' was updated.`, "info", "company-admin");
  };

  const deleteFirmRole = (id: string) => {
    const roleToDelete = firmRoles.find((r) => r.id === id);
    if (roleToDelete?.isSystemRole) {
      alert("System core roles cannot be deleted.");
      return;
    }
    setFirmRoles((prev) => prev.filter((r) => r.id !== id));
    addAuditLog("Deleted Firm Role", "User", id, `Deleted role: ${roleToDelete?.name || id}`);
    addNotification("Firm Role Removed", `Role '${roleToDelete?.name || id}' was removed.`, "warning", "company-admin");
  };

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    updateFirm(selectedFirm.id, updates);
  };

  const addUser = (userData: Omit<User, "id">): string => {
    const newId = `usr_${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newId,
      status: userData.status || "Active",
      joinedDate: userData.joinedDate || new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog("Provisioned Team Member", "User", newId, `Provisioned new account for ${userData.name} (${userData.role})`);
    addNotification("New Team Member Added", `${userData.name} was provisioned as ${userData.role}.`, "info", "company-admin");
    return newId;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    addAuditLog("Updated Team Member", "User", id, `Updated details/permissions for user ${updates.name || id}`);
    addNotification("Team Member Updated", `User profile for ${updates.name || id} was updated.`, "info", "company-admin");
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      addAuditLog("Deactivated/Removed Team Member", "User", id, `Removed user account for ${target.name} (${target.role})`);
      addNotification("User Account Removed", `User ${target.name} was removed from the roster.`, "warning", "company-admin");
    }
  };

  const addAuditLog = (action: string, entityType: AuditLog["entityType"], entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (title: string, message: string, type: NotificationItem["type"], linkTab?: string, linkEntityId?: string) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: "Just now",
      read: false,
      linkTab,
      linkEntityId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt" | "totalAuditsCount" | "activeAuditsCount">) => {
    const newId = `cust_${Date.now()}`;
    const newCust: Customer = {
      ...customerData,
      id: newId,
      activeAuditsCount: 0,
      totalAuditsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog("Created Customer", "Customer", newId, `Added new customer profile for ${customerData.name}`);
    addNotification("New Customer Added", `${customerData.name} profile registered in system.`, "info", "customers", newId);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog("Updated Customer", "Customer", id, `Modified customer details for ${updates.name || id}`);
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addAuditLog("Deleted Customer", "Customer", id, `Deleted firm/customer profile for ${customer?.name || id}`);
    addNotification("Firm Removed", `${customer?.name || "Customer"} was removed from the directory.`, "info", "customers");
  };

  const addUserToFirm = (
    firmId: string,
    firmName: string,
    userData: {
      name: string;
      email: string;
      role: UserRole;
      department?: string;
      phone?: string;
      avatar?: string;
    }
  ): User => {
    const newId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const avatarList = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    ];
    const assignedAvatar =
      userData.avatar || avatarList[Math.floor(Math.random() * avatarList.length)];

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role,
      avatar: assignedAvatar,
      companyName: firmName,
      companyId: firmId,
      department: userData.department?.trim() || undefined,
      phone: userData.phone?.trim() || undefined,
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
      isCustomerUser: userData.role === "Customer Representative" || userData.role === "Client Representative" || userData.role === "Customer Viewer",
    };

    setUsers((prev) => [...prev, newUser]);
    addAuditLog(
      "User Assigned to Firm",
      "User",
      newId,
      `Added ${newUser.name} (${newUser.role}) to firm ${firmName}`
    );
    addNotification(
      "User Added to Firm",
      `${newUser.name} has been enrolled under ${firmName} as ${newUser.role}.`,
      "success",
      "customers"
    );

    return newUser;
  };

  const addTemplate = (templateData: Omit<AuditTemplate, "id" | "createdAt" | "updatedAt">): string => {
    const newId = `tmpl_${Date.now()}`;
    const dateStr = new Date().toISOString().split("T")[0];
    const newTemplate: AuditTemplate = {
      ...templateData,
      id: newId,
      createdAt: dateStr,
      updatedAt: dateStr,
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    addAuditLog("Created Audit Template", "Template", newId, `Created template "${templateData.title}" (${templateData.standard})`);
    addNotification("New Template Created", `Audit template "${templateData.title}" is ready for planning.`, "success", "templates", newId);
    return newId;
  };

  const cloneTemplate = (templateId: string, customTitle?: string): string => {
    const source = templates.find((t) => t.id === templateId);
    const newId = `tmpl_custom_${Date.now()}`;
    const dateStr = new Date().toISOString().split("T")[0];

    const title = customTitle || (source ? `${source.title} (Customized)` : "Custom Audit Checklist");
    const newTemplate: AuditTemplate = {
      ...(source || INITIAL_TEMPLATES[0]),
      id: newId,
      title,
      code: `TMPL-CUST-${Math.floor(100 + Math.random() * 900)}`,
      isDefaultIndustryTemplate: false,
      createdAt: dateStr,
      updatedAt: dateStr,
      createdBy: currentUser.name,
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    addAuditLog("Cloned Audit Template", "Template", newId, `Cloned template "${title}" for company use.`);
    addNotification("Template Cloned", `Custom template "${title}" created and ready for editing.`, "success", "templates", newId);
    return newId;
  };

  const updateTemplate = (id: string, updates: Partial<AuditTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString().split("T")[0] }
          : t
      )
    );
    addAuditLog("Updated Audit Template", "Template", id, `Modified template details.`);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addAuditLog("Deleted Audit Template", "Template", id, `Deleted template from library.`);
  };

  const createAudit = (auditData: Omit<AuditPlan, "id" | "auditNumber" | "responses" | "findingsCount">): string => {
    const newId = `aud_${Date.now()}`;
    const randomNum = Math.floor(100 + Math.random() * 900);
    const auditNumber = `AUD-2026-${randomNum}`;

    const newAudit: AuditPlan = {
      ...auditData,
      id: newId,
      auditNumber,
      responses: {},
      findingsCount: {
        critical: 0,
        major: 0,
        minor: 0,
        observation: 0,
      },
    };

    setAudits((prev) => [newAudit, ...prev]);
    // update customer active count
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === auditData.customerId
          ? {
              ...c,
              activeAuditsCount: c.activeAuditsCount + 1,
              totalAuditsCount: c.totalAuditsCount + 1,
            }
          : c
      )
    );

    addAuditLog("Planned Audit", "Audit", newId, `Scheduled ${auditNumber} for ${auditData.customerName} (${auditData.standard})`);
    addNotification("Audit Scheduled", `${auditNumber} planned for ${auditData.customerName}. Assigned to ${auditData.leadAuditorName}.`, "info", "planning", newId);
    return newId;
  };

  const rescheduleAudit = (auditId: string, scheduleUpdates: Partial<AuditPlan>) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === auditId ? { ...a, ...scheduleUpdates } : a))
    );
    const target = audits.find((a) => a.id === auditId);
    const auditNo = target ? target.auditNumber : auditId;
    const dateRange = scheduleUpdates.startDate
      ? `${scheduleUpdates.startDate} to ${scheduleUpdates.endDate || target?.endDate}`
      : "updated time slot";

    addAuditLog("Rescheduled Audit", "Audit", auditId, `Rescheduled ${auditNo} to ${dateRange}`);
    addNotification(
      "Audit Schedule Updated",
      `${auditNo} has been rescheduled to ${dateRange}. Opening meeting: ${scheduleUpdates.openingMeetingTime || target?.openingMeetingTime || "TBD"}.`,
      "warning",
      "planning",
      auditId
    );
  };

  const confirmSchedule = (auditId: string) => {
    setAudits((prev) =>
      prev.map((a) => (a.id === auditId ? { ...a, isScheduleConfirmed: true } : a))
    );
    const target = audits.find((a) => a.id === auditId);
    const auditNo = target ? target.auditNumber : auditId;
    addAuditLog("Confirmed Audit Schedule", "Audit", auditId, `Schedule confirmed by auditee representative for ${auditNo}.`);
    addNotification("Schedule Confirmed", `Schedule for ${auditNo} has been officially confirmed by ${currentUser.name}.`, "success", "planning", auditId);
  };

  const sendScheduleReminder = (auditId: string) => {
    const target = audits.find((a) => a.id === auditId);
    if (!target) return;
    addAuditLog("Sent Schedule Reminder", "Audit", auditId, `Sent audit engagement schedule reminder to ${target.customerName}.`);
    addNotification(
      `Schedule Reminder: ${target.auditNumber}`,
      `Audit commences on ${target.startDate} at ${target.startTime || "09:00"}. Please prepare requested documentation and attendance rosters.`,
      "info",
      "planning",
      auditId
    );
  };

  const updateAuditStatus = (id: string, status: AuditPlan["status"]) => {
    setAudits((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    addAuditLog("Updated Audit Status", "Audit", id, `Audit status changed to "${status}".`);
  };

  const calculateAuditScore = (responses: Record<string, ChecklistItemResponse>, template: AuditTemplate | undefined): number => {
    if (!template || template.sections.length === 0) return 100;
    let totalPossibleWeight = 0;
    let earnedWeight = 0;

    template.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        const resp = responses[q.id];
        totalPossibleWeight += q.weight;
        if (!resp) return;

        if (resp.status === "PASS") {
          earnedWeight += q.weight;
        } else if (resp.status === "OFI") {
          earnedWeight += q.weight * 0.9;
        } else if (resp.status === "MINOR_NC") {
          earnedWeight += q.weight * 0.5;
        } else if (resp.status === "MAJOR_NC") {
          earnedWeight += 0;
        } else if (resp.status === "FAIL") {
          earnedWeight += 0;
        } else if (resp.status === "NOT_APPLICABLE") {
          totalPossibleWeight -= q.weight;
        }
      });
    });

    if (totalPossibleWeight === 0) return 100;
    return Math.round((earnedWeight / totalPossibleWeight) * 100);
  };

  const updateAuditResponse = (auditId: string, questionId: string, responseUpdates: Partial<ChecklistItemResponse>) => {
    setAudits((prev) =>
      prev.map((audit) => {
        if (audit.id !== auditId) return audit;

        const currentResp = audit.responses[questionId] || {
          questionId,
          status: "UNANSWERED",
          complianceScore: 100,
          auditorComments: "",
          evidenceAttachments: [],
        };

        const updatedResp: ChecklistItemResponse = {
          ...currentResp,
          ...responseUpdates,
          answeredAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          answeredBy: currentUser.name,
        };

        const newResponses = {
          ...audit.responses,
          [questionId]: updatedResp,
        };

        // Recalculate findings count from responses
        let critical = 0;
        let major = 0;
        let minor = 0;
        let observation = 0;

        Object.values(newResponses).forEach((r: any) => {
          if (r?.status === "MAJOR_NC") major++;
          else if (r?.status === "MINOR_NC") minor++;
          else if (r?.status === "OFI") observation++;
          else if (r?.status === "FAIL") major++;
        });

        const template = templates.find((t) => t.id === audit.templateId);
        const overallScore = calculateAuditScore(newResponses, template);

        return {
          ...audit,
          status: audit.status === "Scheduled" || audit.status === "Draft" ? "In Progress" : audit.status,
          responses: newResponses,
          findingsCount: { critical, major, minor, observation },
          overallScore,
        };
      })
    );
  };

  const submitAuditExecution = (auditId: string, executiveSummary?: string) => {
    setAudits((prev) =>
      prev.map((a) => {
        if (a.id !== auditId) return a;
        return {
          ...a,
          status: "Under Review",
          submittedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
          executiveSummary: executiveSummary || a.executiveSummary,
        };
      })
    );

    addAuditLog("Submitted Audit", "Audit", auditId, `Auditor completed checklist and submitted audit for manager review.`);
    addNotification("Audit Execution Completed", `Audit is now under manager review for final report sign-off.`, "info", "reports", auditId);
  };

  const signAuditReport = (auditId: string, signerRole: "leadAuditor" | "auditManager" | "customerRep", comment?: string) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

    setAudits((prev) =>
      prev.map((a) => {
        if (a.id !== auditId) return a;
        const signatures = a.signatures || {};
        signatures[signerRole] = {
          name: currentUser.name,
          signedAt: timestamp,
          role: currentUser.role,
          comment,
        };

        // If manager signs, mark as completed
        let newStatus = a.status;
        if (signerRole === "auditManager") {
          newStatus = "Completed";
        }

        return {
          ...a,
          signatures,
          status: newStatus,
          completedAt: newStatus === "Completed" ? timestamp : a.completedAt,
        };
      })
    );

    addAuditLog("Signed Audit Report", "Report", auditId, `${currentUser.name} signed off audit report as ${currentUser.role}.`);
    addNotification("Audit Report Signed", `${currentUser.name} recorded official sign-off on audit report.`, "success", "reports", auditId);
  };

  const addFinding = (findingData: Omit<Finding, "id" | "findingNumber" | "createdAt">): string => {
    const newId = `fnd_${Date.now()}`;
    const randomNum = Math.floor(10 + Math.random() * 90);
    const audit = audits.find((a) => a.id === findingData.auditId);
    const auditNumShort = audit ? audit.auditNumber.replace("AUD-2026-", "") : "001";
    const findingNumber = `FND-${auditNumShort}-${randomNum}`;

    const newFinding: Finding = {
      ...findingData,
      id: newId,
      findingNumber,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setFindings((prev) => [newFinding, ...prev]);

    // Link back to audit checklist if questionId provided
    if (findingData.questionId && findingData.auditId) {
      updateAuditResponse(findingData.auditId, findingData.questionId, {
        findingId: newId,
        status:
          findingData.severity === "Critical" || findingData.severity === "Major"
            ? "MAJOR_NC"
            : findingData.severity === "Minor"
            ? "MINOR_NC"
            : "OFI",
      });
    }

    addAuditLog("Logged Finding", "Finding", newId, `Recorded ${findingData.severity} finding: "${findingData.title}"`);
    addNotification("New Finding Logged", `${findingData.severity} non-conformity recorded in ${findingData.auditNumber}.`, findingData.severity === "Critical" || findingData.severity === "Major" ? "danger" : "warning", "findings", newId);
    return newId;
  };

  const updateFinding = (id: string, updates: Partial<Finding>) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    addAuditLog("Updated Finding", "Finding", id, `Modified finding details.`);
  };

  const submitCapa = (capaData: Omit<CorrectiveAction, "id" | "submittedAt" | "submittedBy" | "status">): string => {
    const newId = `capa_${Date.now()}`;
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);

    const newCapa: CorrectiveAction = {
      ...capaData,
      id: newId,
      submittedAt: timestamp,
      submittedBy: currentUser.name,
      status: "Submitted",
    };

    setCapas((prev) => [newCapa, ...prev]);

    // Update finding status
    setFindings((prev) =>
      prev.map((f) =>
        f.id === capaData.findingId
          ? { ...f, status: "CAPA Submitted", capaId: newId }
          : f
      )
    );

    addAuditLog("Submitted CAPA", "CAPA", newId, `Customer submitted Corrective Action plan for finding ${capaData.findingNumber}`);
    addNotification("CAPA Plan Submitted", `Corrective action submitted for ${capaData.findingNumber}. Awaiting manager review.`, "info", "capa", newId);
    return newId;
  };

  const reviewCapa = (capaId: string, status: "Accepted" | "Rejected", feedback: string) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);

    let findingIdToUpdate: string | undefined;

    setCapas((prev) =>
      prev.map((c) => {
        if (c.id !== capaId) return c;
        findingIdToUpdate = c.findingId;
        return {
          ...c,
          status,
          managerFeedback: feedback,
          reviewedBy: currentUser.name,
          reviewedAt: timestamp,
        };
      })
    );

    if (findingIdToUpdate) {
      setFindings((prev) =>
        prev.map((f) =>
          f.id === findingIdToUpdate
            ? { ...f, status: status === "Accepted" ? "Resolved" : "Rejected" }
            : f
        )
      );
    }

    addAuditLog(
      status === "Accepted" ? "Approved CAPA" : "Rejected CAPA",
      "CAPA",
      capaId,
      `${currentUser.name} ${status.toLowerCase()} CAPA plan with feedback: "${feedback}"`
    );

    addNotification(
      status === "Accepted" ? "CAPA Approved & Resolved" : "CAPA Requires Revision",
      `Audit Manager ${status.toLowerCase()} corrective action plan.`,
      status === "Accepted" ? "success" : "warning",
      "capa",
      capaId
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[2]);
    setCustomers(INITIAL_CUSTOMERS);
    setTemplates(INITIAL_TEMPLATES);
    setAudits(INITIAL_AUDITS);
    setFindings(INITIAL_FINDINGS);
    setCapas(INITIAL_CAPAS);
    setLogs(INITIAL_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setFirms(INITIAL_FIRMS);
    setSelectedFirmId(INITIAL_FIRMS[0].id);
    setActiveTab("dashboard");
    setActiveAuditId(null);
    setActiveFindingId(null);
    setActiveCapaId(null);
    setActiveCustomerId(null);
    setActiveTemplateId(null);
  };

  return (
    <AuditContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        login,
        loginWithEmail,
        registerUser,
        logout,
        isRoleMatrixModalOpen,
        setIsRoleMatrixModalOpen,
        users,
        addUser,
        updateUser,
        deleteUser,
        firmRoles,
        addFirmRole,
        updateFirmRole,
        deleteFirmRole,
        firms,
        selectedFirmId,
        setSelectedFirmId,
        selectedFirm,
        addFirm,
        updateFirm,
        deleteFirm,
        toggleFirmTemplate,
        companyProfile,
        updateCompanyProfile,
        customers,
        templates,
        audits,
        findings,
        capas,
        logs,
        auditLogs: logs,
        notifications,
        activeTab,
        setActiveTab,
        companyAdminSubTab,
        setCompanyAdminSubTab,
        planningExecutionMode,
        setPlanningExecutionMode,
        activeAuditId,
        setActiveAuditId,
        activeFindingId,
        setActiveFindingId,
        activeCapaId,
        setActiveCapaId,
        activeCustomerId,
        setActiveCustomerId,
        activeTemplateId,
        setActiveTemplateId,
        searchQuery,
        setSearchQuery,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addUserToFirm,
        addTemplate,
        cloneTemplate,
        updateTemplate,
        deleteTemplate,
        createAudit,
        rescheduleAudit,
        confirmSchedule,
        sendScheduleReminder,
        updateAuditStatus,
        updateAuditResponse,
        submitAuditExecution,
        completeAuditExecution: submitAuditExecution,
        signAuditReport,
        addFinding,
        updateFinding,
        submitCapa,
        reviewCapa,
        markNotificationRead,
        markAllNotificationsRead,
        addAuditLog,
        resetAllData,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
};
