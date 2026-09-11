"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Customer,
  AuditPlan,
  ChecklistItemResponse,
  AuditTemplate,
} from "../../shared/types/audit";
import {
  INITIAL_CUSTOMERS,
  INITIAL_AUDITS,
} from "../data/mockData";
import { useNotifications } from "./NotificationContext";
import { useAuthSession } from "./AuthSessionContext";
import { useTemplates } from "./TemplateContext";

export interface AuditPlanContextType {
  customers: Customer[];
  audits: AuditPlan[];
  activeAuditId: string | null;
  setActiveAuditId: (id: string | null) => void;
  activeCustomerId: string | null;
  setActiveCustomerId: (id: string | null) => void;
  planningExecutionMode: "plans" | "perform";
  setPlanningExecutionMode: (mode: "plans" | "perform") => void;
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "totalAuditsCount" | "activeAuditsCount">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  createAudit: (audit: Omit<AuditPlan, "id" | "auditNumber" | "responses" | "findingsCount">) => string;
  rescheduleAudit: (auditId: string, scheduleUpdates: Partial<AuditPlan>) => void;
  confirmSchedule: (auditId: string) => void;
  sendScheduleReminder: (auditId: string) => void;
  updateAuditStatus: (id: string, status: AuditPlan["status"]) => void;
  updateAuditResponse: (auditId: string, questionId: string, response: Partial<ChecklistItemResponse>) => void;
  submitAuditExecution: (auditId: string, executiveSummary?: string) => void;
  completeAuditExecution: (auditId: string, executiveSummary?: string) => void;
  signAuditReport: (auditId: string, signerRole: "leadAuditor" | "auditManager" | "customerRep" | "manager", signerName?: string) => void;
  resetAuditPlanData: () => void;
}

const AuditPlanContext = createContext<AuditPlanContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: "ams_customers_v2",
  AUDITS: "ams_audits_v2",
};

export const AuditPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();
  const { currentUser } = useAuthSession();
  const { templates } = useTemplates();

  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window === "undefined") return INITIAL_CUSTOMERS;
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [audits, setAudits] = useState<AuditPlan[]>(() => {
    if (typeof window === "undefined") return INITIAL_AUDITS;
    const saved = localStorage.getItem(STORAGE_KEYS.AUDITS);
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [planningExecutionMode, setPlanningExecutionMode] = useState<"plans" | "perform">("plans");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    }
  }, [audits]);

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
    addAuditLog("Created Customer", "Customer", newId, `Added new customer profile for ${customerData.name}`, currentUser);
    addNotification("New Customer Added", `${customerData.name} profile registered in system.`, "info", "customers", newId);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog("Updated Customer", "Customer", id, `Modified customer details for ${updates.name || id}`, currentUser);
  };

  const deleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addAuditLog("Deleted Customer", "Customer", id, `Deleted firm/customer profile for ${customer?.name || id}`, currentUser);
    addNotification("Firm Removed", `${customer?.name || "Customer"} was removed from the directory.`, "info", "customers");
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

    addAuditLog("Planned Audit", "Audit", newId, `Scheduled ${auditNumber} for ${auditData.customerName} (${auditData.standard})`, currentUser);
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

    addAuditLog("Rescheduled Audit", "Audit", auditId, `Rescheduled ${auditNo} to ${dateRange}`, currentUser);
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
    addAuditLog("Confirmed Audit Schedule", "Audit", auditId, `Schedule confirmed by auditee representative for ${auditNo}.`, currentUser);
    addNotification("Schedule Confirmed", `Schedule for ${auditNo} has been officially confirmed by ${currentUser.name}.`, "success", "planning", auditId);
  };

  const sendScheduleReminder = (auditId: string) => {
    const target = audits.find((a) => a.id === auditId);
    if (!target) return;
    addAuditLog("Sent Schedule Reminder", "Audit", auditId, `Sent audit engagement schedule reminder to ${target.customerName}.`, currentUser);
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
    addAuditLog("Updated Audit Status", "Audit", id, `Audit status changed to "${status}".`, currentUser);
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

    addAuditLog("Submitted Audit", "Audit", auditId, `Auditor completed checklist and submitted audit for manager review.`, currentUser);
    addNotification("Audit Execution Completed", `Audit is now under manager review for final report sign-off.`, "info", "reports", auditId);
  };

  const signAuditReport = (auditId: string, signerRole: "leadAuditor" | "auditManager" | "customerRep" | "manager", signerName?: string) => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const resolvedRole = signerRole === "manager" ? "auditManager" : signerRole;

    setAudits((prev) =>
      prev.map((a) => {
        if (a.id !== auditId) return a;
        const signatures = a.signatures || {};
        signatures[resolvedRole] = {
          name: signerName || currentUser.name,
          signedAt: timestamp,
          role: currentUser.role,
        };

        // If manager signs, mark as completed
        let newStatus = a.status;
        if (resolvedRole === "auditManager") {
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

    addAuditLog("Signed Audit Report", "Report", auditId, `${currentUser.name} signed off audit report as ${currentUser.role}.`, currentUser);
    addNotification("Audit Report Signed", `${currentUser.name} recorded official sign-off on audit report.`, "success", "reports", auditId);
  };

  const resetAuditPlanData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setAudits(INITIAL_AUDITS);
    setActiveAuditId(null);
    setActiveCustomerId(null);
    setPlanningExecutionMode("plans");
  };

  return (
    <AuditPlanContext.Provider
      value={{
        customers,
        audits,
        activeAuditId,
        setActiveAuditId,
        activeCustomerId,
        setActiveCustomerId,
        planningExecutionMode,
        setPlanningExecutionMode,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        createAudit,
        rescheduleAudit,
        confirmSchedule,
        sendScheduleReminder,
        updateAuditStatus,
        updateAuditResponse,
        submitAuditExecution,
        completeAuditExecution: submitAuditExecution,
        signAuditReport,
        resetAuditPlanData,
      }}
    >
      {children}
    </AuditPlanContext.Provider>
  );
};

export const useAuditPlan = () => {
  const context = useContext(AuditPlanContext);
  if (!context) {
    throw new Error("useAuditPlan must be used within an AuditPlanProvider");
  }
  return context;
};
