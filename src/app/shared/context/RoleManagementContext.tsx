"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { FirmRole } from "../../shared/types/audit";
import { INITIAL_FIRM_ROLES } from "../data/mockData";
import { useNotifications } from "./NotificationContext";

export interface RoleManagementContextType {
  firmRoles: FirmRole[];
  addFirmRole: (role: Omit<FirmRole, "id" | "createdAt">) => string;
  updateFirmRole: (id: string, updates: Partial<FirmRole>) => void;
  deleteFirmRole: (id: string) => void;
  resetRoleData: () => void;
}

const RoleManagementContext = createContext<RoleManagementContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FIRM_ROLES: "ams_firm_roles_v2",
};

export const RoleManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();

  const [firmRoles, setFirmRoles] = useState<FirmRole[]>(() => {
    if (typeof window === "undefined") return INITIAL_FIRM_ROLES;
    const saved = localStorage.getItem(STORAGE_KEYS.FIRM_ROLES);
    return saved ? JSON.parse(saved) : INITIAL_FIRM_ROLES;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.FIRM_ROLES, JSON.stringify(firmRoles));
    }
  }, [firmRoles]);

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

  const resetRoleData = () => {
    setFirmRoles(INITIAL_FIRM_ROLES);
  };

  return (
    <RoleManagementContext.Provider
      value={{
        firmRoles,
        addFirmRole,
        updateFirmRole,
        deleteFirmRole,
        resetRoleData,
      }}
    >
      {children}
    </RoleManagementContext.Provider>
  );
};

export const useRoleManagement = () => {
  const context = useContext(RoleManagementContext);
  if (!context) {
    throw new Error("useRoleManagement must be used within a RoleManagementProvider");
  }
  return context;
};

export const useFirmRoles = useRoleManagement;
