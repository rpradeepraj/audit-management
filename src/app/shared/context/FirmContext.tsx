"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuditFirm, CompanyProfile } from "../../shared/types/audit";
import { INITIAL_FIRMS } from "../data/mockData";
import { useNotifications } from "./NotificationContext";
import { useAuthSession } from "./AuthSessionContext";

export interface FirmContextType {
  firms: AuditFirm[];
  selectedFirmId: string;
  setSelectedFirmId: (id: string) => void;
  selectedFirm: AuditFirm;
  companyProfile: CompanyProfile;
  addFirm: (firm: Omit<AuditFirm, "id" | "createdAt">) => string;
  updateFirm: (id: string, updates: Partial<AuditFirm>) => void;
  deleteFirm: (id: string) => void;
  toggleFirmTemplate: (firmId: string, templateId: string) => void;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  resetFirmData: () => void;
}

const FirmContext = createContext<FirmContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FIRMS: "ams_firms_v2",
  SELECTED_FIRM_ID: "ams_selected_firm_id_v2",
};

export const FirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();
  const { currentUser } = useAuthSession();

  const [firms, setFirms] = useState<AuditFirm[]>(() => {
    if (typeof window === "undefined") return INITIAL_FIRMS;
    const saved = localStorage.getItem(STORAGE_KEYS.FIRMS);
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
    if (typeof window === "undefined") return INITIAL_FIRMS[0].id;
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_FIRM_ID);
    if (saved && INITIAL_FIRMS.some((f) => f.id === saved)) {
      return saved;
    }
    const cyber = INITIAL_FIRMS.find((f) => f.id === "firm_cyber_guard" || f.name.includes("CyberGuard"));
    return cyber ? cyber.id : INITIAL_FIRMS[0].id;
  });

  const selectedFirm: AuditFirm =
    firms.find((f) => f.id === selectedFirmId) || firms[0] || INITIAL_FIRMS[0];

  const companyProfile: CompanyProfile = selectedFirm;

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.FIRMS, JSON.stringify(firms));
    }
  }, [firms]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SELECTED_FIRM_ID, selectedFirmId);
    }
  }, [selectedFirmId]);

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
    addAuditLog("Added Audit Firm", "Firm", newId, `Registered new audit firm: ${newFirm.name} (${newFirm.code})`, currentUser);
    addNotification("New Audit Firm Registered", `Audit firm '${newFirm.name}' was successfully added.`, "success", "company-admin");
    return newId;
  };

  const updateFirm = (id: string, updates: Partial<AuditFirm>) => {
    setFirms((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    addAuditLog("Updated Audit Firm", "Firm", id, `Updated configuration for firm ${updates.name || id}`, currentUser);
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
    addAuditLog("Deleted Audit Firm", "Firm", id, `Removed audit firm: ${firmToDelete?.name || id}`, currentUser);
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
    addAuditLog("Updated Firm Templates", "Firm", firmId, `Updated maintained templates catalog for firm`, currentUser);
  };

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    updateFirm(selectedFirm.id, updates);
  };

  const resetFirmData = () => {
    setFirms(INITIAL_FIRMS);
    setSelectedFirmId(INITIAL_FIRMS[0].id);
  };

  return (
    <FirmContext.Provider
      value={{
        firms,
        selectedFirmId,
        setSelectedFirmId,
        selectedFirm,
        companyProfile,
        addFirm,
        updateFirm,
        deleteFirm,
        toggleFirmTemplate,
        updateCompanyProfile,
        resetFirmData,
      }}
    >
      {children}
    </FirmContext.Provider>
  );
};

export const useFirm = () => {
  const context = useContext(FirmContext);
  if (!context) {
    throw new Error("useFirm must be used within a FirmProvider");
  }
  return context;
};
