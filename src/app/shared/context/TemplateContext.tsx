"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuditTemplate } from "../../shared/types/audit";
import { INITIAL_TEMPLATES } from "../data/mockData";
import { useNotifications } from "./NotificationContext";
import { useAuthSession } from "./AuthSessionContext";

export interface TemplateContextType {
  templates: AuditTemplate[];
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string | null) => void;
  addTemplate: (template: Omit<AuditTemplate, "id" | "createdAt" | "updatedAt">) => string;
  cloneTemplate: (templateId: string, customTitle?: string) => string;
  updateTemplate: (id: string, updates: Partial<AuditTemplate>) => void;
  deleteTemplate: (id: string) => void;
  resetTemplateData: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TEMPLATES: "ams_templates_v2",
};

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();
  const { currentUser } = useAuthSession();

  const [templates, setTemplates] = useState<AuditTemplate[]>(() => {
    if (typeof window === "undefined") return INITIAL_TEMPLATES;
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (saved) {
      try {
        const parsed: AuditTemplate[] = JSON.parse(saved);
        // Ensure all default industry templates exist in state
        const existingIds = new Set(parsed.map((t) => t.id));
        const missing = INITIAL_TEMPLATES.filter((t) => !existingIds.has(t.id));
        return [...parsed, ...missing];
      } catch {
        return INITIAL_TEMPLATES;
      }
    }
    return INITIAL_TEMPLATES;
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    }
  }, [templates]);

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
    addAuditLog("Created Audit Template", "Template", newId, `Created template "${templateData.title}" (${templateData.standard})`, currentUser);
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
    addAuditLog("Cloned Audit Template", "Template", newId, `Cloned template "${title}" for company use.`, currentUser);
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
    addAuditLog("Updated Audit Template", "Template", id, `Modified template details.`, currentUser);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addAuditLog("Deleted Audit Template", "Template", id, `Deleted template from library.`, currentUser);
  };

  const resetTemplateData = () => {
    setTemplates(INITIAL_TEMPLATES);
    setActiveTemplateId(null);
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        activeTemplateId,
        setActiveTemplateId,
        addTemplate,
        cloneTemplate,
        updateTemplate,
        deleteTemplate,
        resetTemplateData,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplates must be used within a TemplateProvider");
  }
  return context;
};
