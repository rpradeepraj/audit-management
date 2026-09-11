"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../../shared/types/audit";
import { INITIAL_USERS } from "../data/mockData";
import { useNotifications } from "./NotificationContext";
import { authFetch } from "../../shared/services/authService";

export interface UserManagementContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (user: Omit<User, "id"> & { password?: string; confirmPassword?: string; firmId?: string }) => Promise<string>;
  updateUser: (id: string, updates: Partial<User> & { password?: string; confirmPassword?: string; firmId?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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
  ) => Promise<User>;
  uploadAvatar: (file: File | string) => Promise<string>;
  findUserByEmail: (email: string) => User | undefined;
  reloadUsers: () => Promise<void>;
  resetUserData: () => void;
  isLoading: boolean;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const UserManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reloadUsers = async () => {
    // No-op since users are supplied through firm.assignedStaff in /api/firms
  };

  const uploadAvatar = async (fileOrData: File | string): Promise<string> => {
    try {
      if (typeof fileOrData === "string") {
        const res = await authFetch("/api/upload/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: fileOrData }),
        });
        const data = await res.json();
        if (data.success && data.url) return data.url;
        return fileOrData;
      } else {
        const formData = new FormData();
        formData.append("file", fileOrData);
        const res = await authFetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) return data.url;
        throw new Error(data.error || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      if (typeof fileOrData === "string") return fileOrData;
      throw err;
    }
  };

  const addUser = async (
    userData: Omit<User, "id"> & { password?: string; confirmPassword?: string; firmId?: string }
  ): Promise<string> => {
    const password = userData.password || "Password@123";
    const confirmPassword = userData.confirmPassword || password;

    try {
      const res = await authFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password,
          confirmPassword,
          role: userData.role,
          phone: userData.phone,
          avatar: userData.avatar,
          firmId: userData.firmId || userData.companyId,
          status: userData.status || "Active",
          department: userData.department,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to provision user in Supabase");
      }

      const created = data.data;
      const newUser: User = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role as UserRole,
        phone: created.phone || "",
        avatar: created.avatar || userData.avatar || "",
        status: created.status || "Active",
        joinedDate: created.joinedDate || new Date().toISOString().split("T")[0],
        companyId: created.firmId || userData.companyId || "",
        companyName: created.firmName || userData.companyName || "",
        department: userData.department || "Audit Operations",
        isCustomerUser: userData.role === "Auditee Representative" || userData.role === "Auditee Viewer",
      };

      setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id && u.email !== newUser.email)]);
      addAuditLog("Provisioned Team Member", "User", created.id, `Provisioned new account for ${created.name} (${created.role}) in Supabase`);
      addNotification("New Team Member Added", `${created.name} was provisioned as ${created.role}.`, "success", "company-admin");
      return created.id;
    } catch (err: any) {
      console.error("Error creating user:", err);
      addNotification("User Creation Error", err.message || "Failed to provision user", "warning", "company-admin");
      throw err;
    }
  };

  const updateUser = async (
    id: string,
    updates: Partial<User> & { password?: string; confirmPassword?: string; firmId?: string }
  ): Promise<void> => {
    try {
      const res = await authFetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          password: updates.password || undefined,
          confirmPassword: updates.confirmPassword || undefined,
          role: updates.role,
          phone: updates.phone,
          avatar: updates.avatar,
          firmId: updates.firmId || updates.companyId,
          status: updates.status,
          department: updates.department,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update user in Supabase");
      }

      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
      addAuditLog("Updated Team Member", "User", id, `Updated details/permissions for user ${updates.name || id}`);
      addNotification("Team Member Updated", `User profile for ${updates.name || id} was updated.`, "info", "company-admin");
    } catch (err: any) {
      console.error("Error updating user:", err);
      addNotification("User Update Error", err.message || "Failed to update user", "warning", "company-admin");
      throw err;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    const target = users.find((u) => u.id === id);
    try {
      const res = await authFetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user from Supabase");
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      addAuditLog("Deactivated/Removed Team Member", "User", id, `Removed user account for ${target?.name || id}`);
      addNotification("User Account Removed", `User ${target?.name || id} was removed from the roster.`, "warning", "company-admin");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      addNotification("User Deletion Error", err.message || "Failed to delete user", "warning", "company-admin");
      throw err;
    }
  };

  const addUserToFirm = async (
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
  ): Promise<User> => {
    const password = userData.password || "Password@123";
    const confirmPassword = userData.confirmPassword || password;

    const res = await authFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password,
        confirmPassword,
        role: userData.role,
        phone: userData.phone,
        avatar: userData.avatar,
        firmId,
        department: userData.department,
        status: "Active",
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to add user to firm");
    }

    const created = data.data;
    const newUser: User = {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role as UserRole,
      avatar: created.avatar || userData.avatar || "",
      companyName: firmName,
      companyId: firmId,
      department: userData.department?.trim() || "Audit & Assurance",
      phone: userData.phone?.trim() || "",
      status: "Active",
      joinedDate: created.joinedDate || new Date().toISOString().split("T")[0],
      isCustomerUser: userData.role === "Auditee Representative" || userData.role === "Auditee Viewer",
    };

    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id && u.email !== newUser.email)]);
    addAuditLog("User Assigned to Firm", "User", created.id, `Added ${newUser.name} (${newUser.role}) to firm ${firmName}`);
    addNotification("User Added to Firm", `${newUser.name} has been enrolled under ${firmName} as ${newUser.role}.`, "success", "company-admin");
    return newUser;
  };

  const findUserByEmail = (email: string): User | undefined => {
    const trimmed = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === trimmed);
  };

  const resetUserData = () => {
    setUsers([]);
  };

  return (
    <UserManagementContext.Provider
      value={{
        users,
        setUsers,
        addUser,
        updateUser,
        deleteUser,
        addUserToFirm,
        uploadAvatar,
        findUserByEmail,
        reloadUsers,
        resetUserData,
        isLoading,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error("useUserManagement must be used within a UserManagementProvider");
  }
  return context;
};

export const useUsers = useUserManagement;
export default UserManagementContext;
