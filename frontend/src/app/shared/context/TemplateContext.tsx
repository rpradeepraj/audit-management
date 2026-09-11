"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuditTemplate } from "../../shared/types/audit";
import { useNotifications } from "./NotificationContext";
import { useAuthSession } from "./AuthSessionContext";
import { authFetch } from "../../shared/services/authService";

export interface TemplateContextType {
  templates: AuditTemplate[];
  isLoading: boolean;
  activeTemplateId: string | null;
  setActiveTemplateId: (id: string | null) => void;
  addTemplate: (template: Omit<AuditTemplate, "id" | "createdAt" | "updatedAt"> & { firmId?: string; globalTemplateId?: string }) => Promise<string>;
  cloneTemplate: (templateId: string, customTitle?: string) => Promise<string>;
  linkGlobalTemplateToFirm: (firmId: string, globalTemplateId: string) => Promise<string>;
  createCustomFirmTemplate: (payload: {
    firmId: string;
    title: string;
    code: string;
    standard?: string;
    industry?: string;
    passingScore?: number;
    sections: Array<{
      id?: string;
      title: string;
      description?: string;
      weight?: number;
      questions: Array<{
        id?: string;
        requirementId?: string;
        question: string;
        guidance?: string;
        scoringType?: "PASS_FAIL" | "COMPLIANCE_RATING" | "SEVERITY_BASED" | "NUMERIC";
        weight?: number;
        mandatory?: boolean;
      }>;
    }>;
  }) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<AuditTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  reloadTemplates: (type?: string) => Promise<void>;
  resetTemplateData: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TEMPLATES: "ams_templates_v3",
};

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog } = useNotifications();
  const { currentUser } = useAuthSession();

  const [templates, setTemplates] = useState<AuditTemplate[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  // Fetch templates from /api/templates (Supabase) - only invoked on templates page / default library
  const fetchTemplatesFromApi = useCallback(async (type: string = "all") => {
    setIsLoading(true);
    try {
      const queryParam = type ? `?type=${encodeURIComponent(type)}` : "?type=all";
      const res = await authFetch(`/api/templates${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch templates from /api/templates:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create template (POST /api/templates)
  const addTemplate = async (
    templateData: Omit<AuditTemplate, "id" | "createdAt" | "updatedAt"> & { firmId?: string; globalTemplateId?: string }
  ): Promise<string> => {
    try {
      const res = await authFetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmId: templateData.firmId,
          globalTemplateId: templateData.globalTemplateId,
          title: templateData.title,
          code: templateData.code,
          standard: templateData.standard,
          industry: templateData.industry,
          version: templateData.version || "1.0",
          passingScore: templateData.passingScore,
          tags: templateData.tags,
          description: templateData.description,
          isCustom: templateData.isCustom ?? true,
          sections: templateData.sections?.map((s, sIdx) => ({
            title: s.title,
            description: s.description || "",
            weight: s.weight || 100,
            orderIndex: sIdx + 1,
            questions: s.questions?.map((q, qIdx) => ({
              requirementId: q.requirementId,
              question: q.question,
              guidance: q.guidance || "",
              scoringType: q.scoringType || "PASS_FAIL",
              weight: q.weight || 10,
              mandatory: q.mandatory || false,
              orderIndex: qIdx + 1,
            })),
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && (data.template || data.data)) {
        const created = data.template || data.data;
        await fetchTemplatesFromApi();
        addAuditLog("Created Audit Template", "Template", created.id, `Created template "${created.title}" (${created.standard})`, currentUser);
        return created.id;
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to create template.");
      }
    } catch (err) {
      console.error("Error creating template via API:", err);
      throw err;
    }

    // Local fallback
    const newId = `tmpl_${Date.now()}`;
    const dateStr = new Date().toISOString().split("T")[0];
    const newTemplate: AuditTemplate = {
      ...templateData,
      id: newId,
      createdAt: dateStr,
      updatedAt: dateStr,
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    return newId;
  };

  // Link global default standard to firm (POST /api/templates with firmId & globalTemplateId)
  const linkGlobalTemplateToFirm = async (firmId: string, globalTemplateId: string): Promise<string> => {
    const globalTmpl = templates.find((t) => t.id === globalTemplateId);
    try {
      const res = await authFetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmId,
          globalTemplateId,
          title: globalTmpl?.title,
          standard: globalTmpl?.standard,
          code: globalTmpl?.code,
          industry: globalTmpl?.industry,
          version: globalTmpl?.version,
          passingScore: globalTmpl?.passingScore,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to link standard to firm.");
      }

      if (data.template || data.data) {
        const created = data.template || data.data;
        await fetchTemplatesFromApi();
        addAuditLog("Linked Template to Firm", "Template", created.id, `Linked standard "${created.title}" to firm.`, currentUser);
        return created.id;
      }
    } catch (err: any) {
      console.error("Error linking template via API:", err);
      throw err;
    }
    return globalTemplateId;
  };

  // Create custom firm template with sections & clauses (POST /api/templates)
  const createCustomFirmTemplate = async (payload: {
    firmId: string;
    title: string;
    code: string;
    standard?: string;
    industry?: string;
    passingScore?: number;
    sections: Array<{
      id?: string;
      title: string;
      description?: string;
      weight?: number;
      questions: Array<{
        id?: string;
        requirementId?: string;
        question: string;
        guidance?: string;
        scoringType?: "PASS_FAIL" | "COMPLIANCE_RATING" | "SEVERITY_BASED" | "NUMERIC";
        weight?: number;
        mandatory?: boolean;
      }>;
    }>;
  }): Promise<string> => {
    return addTemplate({
      firmId: payload.firmId,
      title: payload.title,
      code: payload.code,
      standard: payload.standard || payload.code || "Custom Standard",
      industry: payload.industry || "General Industry",
      version: "1.0",
      passingScore: payload.passingScore || 80,
      description: `Custom compliance template provisioned for firm.`,
      tags: ["Custom", payload.standard || payload.code || "Proprietary"],
      isCustom: true,
      isDefaultIndustryTemplate: false,
      sections: payload.sections.map((s, sIdx) => ({
        id: s.id || `sec_${sIdx + 1}`,
        title: s.title,
        description: s.description || "",
        weight: s.weight || 100,
        questions: s.questions.map((q, qIdx) => ({
          id: q.id || `q_${sIdx + 1}_${qIdx + 1}`,
          requirementId: q.requirementId || `${sIdx + 1}.${qIdx + 1}`,
          question: q.question,
          guidance: q.guidance || "Verify objective documentary evidence and operational records.",
          scoringType: q.scoringType || "PASS_FAIL",
          weight: q.weight || 10,
          mandatory: Boolean(q.mandatory),
        })),
      })),
    });
  };

  // Clone template
  const cloneTemplate = async (templateId: string, customTitle?: string): Promise<string> => {
    const source = templates.find((t) => t.id === templateId);
    const title = customTitle || (source ? `${source.title} (Customized)` : "Custom Audit Checklist");
    const code = `TMPL-CUST-${Math.floor(100 + Math.random() * 900)}`;

    return addTemplate({
      title,
      code,
      standard: source?.standard || "ISO 9001:2015",
      industry: source?.industry || "General Industry",
      version: source?.version || "1.0",
      passingScore: source?.passingScore || 80,
      tags: source?.tags || ["Custom"],
      description: source?.description || `Cloned customized standard based on ${source?.title || "audit template"}.`,
      isDefaultIndustryTemplate: false,
      isCustom: true,
      sections: source?.sections || [],
      firmId: source?.firmId,
    });
  };

  // Update template (PUT /api/templates/[id])
  const updateTemplate = async (id: string, updates: Partial<AuditTemplate>): Promise<void> => {
    try {
      const res = await authFetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updates.title,
          code: updates.code,
          standard: updates.standard,
          industry: updates.industry,
          version: updates.version,
          passingScore: updates.passingScore,
          tags: updates.tags,
          description: updates.description,
          sections: updates.sections?.map((s, sIdx) => ({
            title: s.title,
            description: s.description || "",
            weight: s.weight || 100,
            orderIndex: sIdx + 1,
            questions: s.questions?.map((q, qIdx) => ({
              requirementId: q.requirementId,
              question: q.question,
              guidance: q.guidance || "",
              scoringType: q.scoringType || "PASS_FAIL",
              weight: q.weight || 10,
              mandatory: q.mandatory || false,
              orderIndex: qIdx + 1,
            })),
          })),
        }),
      });

      if (res.ok) {
        await fetchTemplatesFromApi();
        addAuditLog("Updated Audit Template", "Template", id, `Modified template "${updates.title || id}".`, currentUser);
        return;
      }
    } catch (err) {
      console.error("Error updating template via API:", err);
    }

    // Local fallback
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString().split("T")[0] }
          : t
      )
    );
  };

  // Delete template (DELETE /api/templates/[id])
  const deleteTemplate = async (id: string): Promise<void> => {
    try {
      const res = await authFetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchTemplatesFromApi();
        addAuditLog("Deleted Audit Template", "Template", id, `Deleted template ${id}.`, currentUser);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete template ${id}`);
      }
    } catch (err) {
      console.error("Error deleting template via API:", err);
      // Local fallback removal
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      throw err;
    }
  };

  const resetTemplateData = () => {
    setTemplates([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
    }
    setActiveTemplateId(null);
  };

  return (
    <TemplateContext.Provider
      value={{
        templates,
        isLoading,
        activeTemplateId,
        setActiveTemplateId,
        addTemplate,
        cloneTemplate,
        linkGlobalTemplateToFirm,
        createCustomFirmTemplate,
        updateTemplate,
        deleteTemplate,
        reloadTemplates: fetchTemplatesFromApi,
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
