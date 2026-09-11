"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Finding, CorrectiveAction } from "../../shared/types/audit";
import { INITIAL_FINDINGS, INITIAL_CAPAS } from "../data/mockData";
import { useNotifications } from "./NotificationContext";
import { useAuthSession } from "./AuthSessionContext";
import { useAuditPlan } from "./AuditPlanContext";

export interface FindingCapaContextType {
  findings: Finding[];
  capas: CorrectiveAction[];
  activeFindingId: string | null;
  setActiveFindingId: (id: string | null) => void;
  activeCapaId: string | null;
  setActiveCapaId: (id: string | null) => void;
  addFinding: (finding: Omit<Finding, "id" | "findingNumber" | "createdAt">) => string;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  submitCapa: (capa: Omit<CorrectiveAction, "id" | "submittedAt" | "submittedBy" | "status">) => string;
  reviewCapa: (capaId: string, status: "Accepted" | "Rejected", feedback: string) => void;
  resetFindingCapaData: () => void;
}

const FindingCapaContext = createContext<FindingCapaContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FINDINGS: "ams_findings_v2",
  CAPAS: "ams_capas_v2",
};

export const FindingCapaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();
  const { currentUser } = useAuthSession();
  const { audits, updateAuditResponse } = useAuditPlan();

  const [findings, setFindings] = useState<Finding[]>(() => {
    if (typeof window === "undefined") return INITIAL_FINDINGS;
    const saved = localStorage.getItem(STORAGE_KEYS.FINDINGS);
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [capas, setCapas] = useState<CorrectiveAction[]>(() => {
    if (typeof window === "undefined") return INITIAL_CAPAS;
    const saved = localStorage.getItem(STORAGE_KEYS.CAPAS);
    return saved ? JSON.parse(saved) : INITIAL_CAPAS;
  });

  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [activeCapaId, setActiveCapaId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.FINDINGS, JSON.stringify(findings));
    }
  }, [findings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CAPAS, JSON.stringify(capas));
    }
  }, [capas]);

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

    addAuditLog("Logged Finding", "Finding", newId, `Recorded ${findingData.severity} finding: "${findingData.title}"`, currentUser);
    addNotification(
      "New Finding Logged",
      `${findingData.severity} non-conformity recorded in ${findingData.auditNumber}.`,
      findingData.severity === "Critical" || findingData.severity === "Major" ? "danger" : "warning",
      "findings",
      newId
    );
    return newId;
  };

  const updateFinding = (id: string, updates: Partial<Finding>) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    addAuditLog("Updated Finding", "Finding", id, `Modified finding details.`, currentUser);
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

    addAuditLog("Submitted CAPA", "CAPA", newId, `Customer submitted Corrective Action plan for finding ${capaData.findingNumber}`, currentUser);
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
      `${currentUser.name} ${status.toLowerCase()} CAPA plan with feedback: "${feedback}"`,
      currentUser
    );

    addNotification(
      status === "Accepted" ? "CAPA Approved & Resolved" : "CAPA Requires Revision",
      `Audit Manager ${status.toLowerCase()} corrective action plan.`,
      status === "Accepted" ? "success" : "warning",
      "capa",
      capaId
    );
  };

  const resetFindingCapaData = () => {
    setFindings(INITIAL_FINDINGS);
    setCapas(INITIAL_CAPAS);
    setActiveFindingId(null);
    setActiveCapaId(null);
  };

  return (
    <FindingCapaContext.Provider
      value={{
        findings,
        capas,
        activeFindingId,
        setActiveFindingId,
        activeCapaId,
        setActiveCapaId,
        addFinding,
        updateFinding,
        submitCapa,
        reviewCapa,
        resetFindingCapaData,
      }}
    >
      {children}
    </FindingCapaContext.Provider>
  );
};

export const useFindings = () => {
  const context = useContext(FindingCapaContext);
  if (!context) {
    throw new Error("useFindings must be used within a FindingCapaProvider");
  }
  return context;
};
