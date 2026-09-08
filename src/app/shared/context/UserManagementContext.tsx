"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../../shared/types/audit";
import { INITIAL_USERS } from "../data/mockData";
import { useNotifications } from "./NotificationContext";

export interface UserManagementContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (user: Omit<User, "id">) => string;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addUserToFirm: (
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
  ) => User;
  findUserByEmail: (email: string) => User | undefined;
  resetUserData: () => void;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: "ams_users_v2",
};

export const UserManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification } = useNotifications();

  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return INITIAL_USERS;
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }, [users]);

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

  const findUserByEmail = (email: string): User | undefined => {
    const trimmed = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === trimmed);
  };

  const resetUserData = () => {
    setUsers(INITIAL_USERS);
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
        findUserByEmail,
        resetUserData,
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
