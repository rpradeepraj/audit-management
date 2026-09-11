"use client";

import React from "react";
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
  CompanyProfile,
  AuditFirm,
} from "../../shared/types/audit";

import { NotificationProvider, useNotifications, CompanyAdminSubTab } from "./NotificationContext";
import { AuthProvider, useAuth } from "./AuthContext";
import { FirmProvider, useFirm } from "./FirmContext";
import { TemplateProvider, useTemplates } from "./TemplateContext";
import { AuditPlanProvider, useAuditPlan } from "./AuditPlanContext";
import { FindingCapaProvider, useFindings } from "./FindingCapaContext";

export type { CompanyAdminSubTab };

export interface AuditContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (user: User) => void;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  registerUser: (userData: {
    name: string;
    email: string;
    role: UserRole;
    companyName: string;
    isCustomerUser: boolean;
  }) => { success: boolean; error?: string };
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, "id"> & { password?: string; confirmPassword?: string; firmId?: string }) => Promise<string> | string;
  updateUser: (id: string, updates: Partial<User> & { password?: string; confirmPassword?: string; firmId?: string }) => Promise<void> | void;
  deleteUser: (id: string) => Promise<void> | void;
  uploadAvatar?: (file: File | string) => Promise<string>;
  firmRoles: FirmRole[];
  addFirmRole: (role: Omit<FirmRole, "id" | "createdAt">) => string;
  updateFirmRole: (id: string, updates: Partial<FirmRole>) => void;
  deleteFirmRole: (id: string) => void;
  firms: AuditFirm[];
  selectedFirmId: string;
  setSelectedFirmId: (id: string) => void;
  selectedFirm: AuditFirm;
  addFirm: (firm: Omit<AuditFirm, "id" | "createdAt">) => Promise<string> | string;
  updateFirm: (id: string, updates: Partial<AuditFirm>) => Promise<void> | void;
  deleteFirm: (id: string) => Promise<void> | void;
  toggleFirmTemplate: (firmId: string, templateId: string) => void;
  companyProfile: CompanyProfile;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  reloadFirms: () => Promise<void>;
  isLoading: boolean;
  isFirmsLoading: boolean;
  isTemplatesLoading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  clearMessage: () => void;
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
  // Actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "totalAuditsCount" | "activeAuditsCount">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addUserToFirm: (
    firmId: string,
    firmName: string,
    userData: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
      confirmPassword?: string;
      department?: string;
      phone?: string;
      avatar?: string;
    }
  ) => Promise<User> | User;
  addTemplate: (template: Omit<AuditTemplate, "id" | "createdAt" | "updatedAt"> & { firmId?: string; globalTemplateId?: string }) => Promise<string> | string;
  cloneTemplate: (templateId: string, customTitle?: string) => Promise<string> | string;
  linkGlobalTemplateToFirm: (firmId: string, globalTemplateId: string) => Promise<string>;
  createCustomFirmTemplate: (payload: {
    firmId: string;
    title: string;
    code: string;
    standard?: string;
    industry?: string;
    passingScore?: number;
    sections: any[];
  }) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<AuditTemplate>) => Promise<void> | void;
  deleteTemplate: (id: string) => Promise<void> | void;
  reloadTemplates: (type?: string) => Promise<void>;
  createAudit: (audit: Omit<AuditPlan, "id" | "auditNumber" | "responses" | "findingsCount">) => string;
  rescheduleAudit: (auditId: string, scheduleUpdates: Partial<AuditPlan>) => void;
  confirmSchedule: (auditId: string) => void;
  sendScheduleReminder: (auditId: string) => void;
  updateAuditStatus: (id: string, status: AuditPlan["status"]) => void;
  updateAuditResponse: (auditId: string, questionId: string, response: Partial<ChecklistItemResponse>) => void;
  submitAuditExecution: (auditId: string, executiveSummary?: string) => void;
  completeAuditExecution: (auditId: string, executiveSummary?: string) => void;
  signAuditReport: (auditId: string, signerRole: "leadAuditor" | "auditManager" | "customerRep" | "manager", signerName?: string) => void;
  addFinding: (finding: Omit<Finding, "id" | "findingNumber" | "createdAt">) => string;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  submitCapa: (capa: Omit<CorrectiveAction, "id" | "submittedAt" | "status">) => string;
  reviewCapa: (capaId: string, status: "Accepted" | "Rejected", feedback: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;
  resetAllData: () => void;
}

/**
 * Composite AuditProvider wrapping all modular sub-providers in order
 */
export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <FirmProvider>
          <TemplateProvider>
            <AuditPlanProvider>
              <FindingCapaProvider>{children}</FindingCapaProvider>
            </AuditPlanProvider>
          </TemplateProvider>
        </FirmProvider>
      </AuthProvider>
    </NotificationProvider>
  );
};

/**
 * Unified hook aggregating all domain contexts with complete backward compatibility
 */
export const useAudit = (): AuditContextType => {
  const notifContext = useNotifications();
  const authContext = useAuth();
  const firmContext = useFirm();
  const templateContext = useTemplates();
  const planContext = useAuditPlan();
  const findingContext = useFindings();

  const resetAllData = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    notifContext.resetNotificationData();
    authContext.resetAuthData();
    firmContext.resetFirmData();
    templateContext.resetTemplateData();
    planContext.resetAuditPlanData();
    findingContext.resetFindingCapaData();
  };

  return {
    ...notifContext,
    ...authContext,
    ...firmContext,
    ...templateContext,
    ...planContext,
    ...findingContext,
    isLoading: firmContext.isLoading || templateContext.isLoading,
    isFirmsLoading: firmContext.isLoading,
    isTemplatesLoading: templateContext.isLoading,
    addAuditLog: (action, entityType, entityId, details) =>
      notifContext.addAuditLog(action, entityType as any, entityId, details, authContext.currentUser),
    resetAllData,
  };
};
