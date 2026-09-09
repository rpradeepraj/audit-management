"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuditFirm, CompanyProfile } from "../../shared/types/audit";
import { useNotifications } from "./NotificationContext";
import { useAuthSession } from "./AuthSessionContext";
import { authFetch } from "../../shared/services/authService";

export interface FirmContextType {
  firms: AuditFirm[];
  selectedFirmId: string;
  setSelectedFirmId: (id: string) => void;
  selectedFirm: AuditFirm;
  companyProfile: CompanyProfile;
  addFirm: (firm: Omit<AuditFirm, "id" | "createdAt">) => Promise<string>;
  updateFirm: (id: string, updates: Partial<AuditFirm>) => Promise<void>;
  deleteFirm: (id: string) => Promise<void>;
  toggleFirmTemplate: (firmId: string, templateId: string) => void;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  resetFirmData: () => void;
  reloadFirms: () => Promise<void>;
  isLoading: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  clearMessage: () => void;
}

const FirmContext = createContext<FirmContextType | undefined>(undefined);

const DEFAULT_EMPTY_FIRM: AuditFirm = {
  id: "firm_empty",
  name: "Audit Firm",
  code: "FIRM",
  accreditationNumber: "",
  accreditationStandard: "",
  industryScope: "",
  contactEmail: "contact@auditfirm.com",
  phone: "",
  address: "",
  website: "",
  logoInitials: "AF",
  establishedYear: "",
  qualityPolicy: "",
  status: "Active",
  maintainedTemplateIds: [],
  createdAt: new Date().toISOString().split("T")[0],
};

export const FirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();
  const { currentUser } = useAuthSession();

  const [firms, setFirms] = useState<AuditFirm[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => {
      setSuccessMessage((current) => (current === msg ? null : current));
    }, 4500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    setTimeout(() => {
      setErrorMessage((current) => (current === msg ? null : current));
    }, 5500);
  };

  const clearMessage = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Strictly fetch firms from Supabase Read API filtered by user id when available
  const fetchFirmsFromApi = async () => {
    setIsLoading(true);
    try {
      const url = currentUser?.id
        ? `/api/firms?userId=${encodeURIComponent(currentUser.id)}`
        : "/api/firms";
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.firms)) {
          const apiFirms: AuditFirm[] = data.firms.map((af: any) => ({
            id: af.id,
            name: af.name,
            code: af.code,
            accreditationNumber: af.accreditationNumber || "",
            accreditationStandard: af.accreditationStandard || "",
            industryScope: af.industryScope || "",
            contactEmail: af.contactEmail || "",
            phone: af.phone || "",
            address: af.address || "",
            website: af.website || "",
            logoInitials: af.logoInitials || (af.name ? af.name.substring(0, 2).toUpperCase() : "AF"),
            establishedYear: af.establishedYear || "",
            qualityPolicy: af.qualityPolicy || "",
            status: af.status || (af.isActive ? "Active" : "Inactive"),
            maintainedTemplateIds: af.maintainedTemplates?.map((t: any) => t.id) || [],
            createdAt: af.createdAt || new Date().toISOString().split("T")[0],
            assignedStaff: Array.isArray(af.assignedStaff)
              ? af.assignedStaff.map((u: any) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  avatar: u.avatar || "",
                  phone: u.phone || "",
                  companyId: af.id,
                  companyName: af.name,
                  status: u.isActive !== false ? "Active" : "Inactive",
                  joinedDate: u.created_on || "",
                  firms: [{ id: af.id, name: af.name, code: af.code }],
                }))
              : [],
          }));

          setFirms(apiFirms);
          if (apiFirms.length > 0) {
            setSelectedFirmId((prev) => {
              if (prev && apiFirms.some((f) => f.id === prev)) return prev;
              return apiFirms[0].id;
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load audit firms from Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFirmsFromApi();
  }, [currentUser?.id]);

  const selectedFirm: AuditFirm =
    firms.find((f) => f.id === selectedFirmId) ||
    firms[0] ||
    DEFAULT_EMPTY_FIRM;

  const companyProfile: CompanyProfile = selectedFirm;

  const addFirm = async (firmData: Omit<AuditFirm, "id" | "createdAt">): Promise<string> => {
    try {
      const res = await authFetch("/api/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firmData.name,
          code: firmData.code,
          contactEmail: firmData.contactEmail,
          phone: firmData.phone,
          address: firmData.address,
          website: firmData.website,
          establishedYear: firmData.establishedYear,
          qualityPolicy: firmData.qualityPolicy,
          status: firmData.status || "Active",
          accreditationNumber: firmData.accreditationNumber,
          accreditationStandard: firmData.accreditationStandard,
          industryScope: firmData.industryScope,
          notes: firmData.notes,
          userId: currentUser?.id,
          createBy: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create firm in Supabase");
      }

      const created = data.data;
      const createdFirm: AuditFirm = {
        id: created.id,
        name: created.name,
        code: created.code,
        accreditationNumber: created.accreditationNumber || firmData.accreditationNumber || "",
        accreditationStandard: created.accreditationStandard || firmData.accreditationStandard || "",
        industryScope: created.industryScope || firmData.industryScope || "",
        contactEmail: created.contactEmail,
        phone: created.phone || "",
        address: created.address || "",
        website: created.website || "",
        logoInitials: created.logoInitials || firmData.logoInitials || "AF",
        establishedYear: created.establishedYear || "",
        qualityPolicy: created.qualityPolicy || "",
        status: created.status || "Active",
        maintainedTemplateIds: firmData.maintainedTemplateIds || [],
        createdAt: created.createdAt || new Date().toISOString().split("T")[0],
      };

      setFirms((prev) => [...prev, createdFirm]);
      setSelectedFirmId(createdFirm.id);
      showSuccess(`Audit firm "${createdFirm.name}" (${createdFirm.code}) was successfully registered and linked.`);
      addAuditLog("Added Audit Firm", "Firm", createdFirm.id, `Registered new audit firm in Supabase: ${createdFirm.name} (${createdFirm.code})`, currentUser);
      addNotification("New Audit Firm Registered", `Audit firm '${createdFirm.name}' was successfully added to Supabase.`, "success", "company-admin");
      return createdFirm.id;
    } catch (err: any) {
      console.error("Error creating firm in Supabase:", err);
      showError(err.message || "Failed to register audit firm.");
      addNotification("Firm Registration Error", err.message || "Failed to register firm", "warning", "company-admin");
      throw err;
    }
  };

  const updateFirm = async (id: string, updates: Partial<AuditFirm>): Promise<void> => {
    try {
      const res = await authFetch(`/api/firms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updates.name,
          code: updates.code,
          contactEmail: updates.contactEmail,
          phone: updates.phone,
          address: updates.address,
          website: updates.website,
          establishedYear: updates.establishedYear,
          qualityPolicy: updates.qualityPolicy,
          status: updates.status,
          accreditationNumber: updates.accreditationNumber,
          accreditationStandard: updates.accreditationStandard,
          industryScope: updates.industryScope,
          notes: updates.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update firm in Supabase");
      }

      setFirms((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
      showSuccess(`Audit firm "${updates.name || id}" details updated successfully.`);
      addAuditLog("Updated Audit Firm", "Firm", id, `Updated configuration in Supabase for firm ${updates.name || id}`, currentUser);
      addNotification("Audit Firm Updated", `Firm details for '${updates.name || id}' were saved to Supabase.`, "info", "company-admin");
    } catch (err: any) {
      console.error("Error updating firm in Supabase:", err);
      showError(err.message || "Failed to update firm details.");
      addNotification("Firm Update Error", err.message || "Failed to update firm", "warning", "company-admin");
      throw err;
    }
  };

  const deleteFirm = async (id: string): Promise<void> => {
    const firmToDelete = firms.find((f) => f.id === id);
    if (firms.length <= 1) {
      showError("At least one active audit firm must remain in the platform.");
      return;
    }

    try {
      const res = await authFetch(`/api/firms/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete firm from Supabase");
      }

      const updated = firms.filter((f) => f.id !== id);
      setFirms(updated);
      if (selectedFirmId === id) {
        setSelectedFirmId(updated[0]?.id || "");
      }
      showSuccess(`Audit firm "${firmToDelete?.name || id}" was successfully removed.`);
      addAuditLog("Deleted Audit Firm", "Firm", id, `Removed audit firm from Supabase: ${firmToDelete?.name || id}`, currentUser);
      addNotification("Audit Firm Removed", `Audit firm '${firmToDelete?.name || id}' was deleted from Supabase.`, "warning", "company-admin");
    } catch (err: any) {
      console.error("Error deleting firm in Supabase:", err);
      showError(err.message || "Failed to delete audit firm.");
      addNotification("Firm Deletion Error", err.message || "Failed to delete firm", "warning", "company-admin");
      throw err;
    }
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
    fetchFirmsFromApi();
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
        reloadFirms: fetchFirmsFromApi,
        isLoading,
        successMessage,
        errorMessage,
        showSuccess,
        showError,
        clearMessage,
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

export default FirmContext;
