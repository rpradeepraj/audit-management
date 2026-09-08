"use client";

import React from "react";
import { User, UserRole, FirmRole } from "../../shared/types/audit";

import { UserManagementProvider, useUserManagement } from "./UserManagementContext";
import { RoleManagementProvider, useRoleManagement } from "./RoleManagementContext";
import { AuthSessionProvider, useAuthSession } from "./AuthSessionContext";

export interface AuthContextType {
  // Session slice
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
  // User roster slice
  users: User[];
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
  // Role catalog slice
  firmRoles: FirmRole[];
  addFirmRole: (role: Omit<FirmRole, "id" | "createdAt">) => string;
  updateFirmRole: (id: string, updates: Partial<FirmRole>) => void;
  deleteFirmRole: (id: string) => void;
  resetAuthData: () => void;
}

/**
 * Composite AuthProvider composing UserManagement, RoleManagement, and AuthSession providers
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <RoleManagementProvider>
      <UserManagementProvider>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </UserManagementProvider>
    </RoleManagementProvider>
  );
};

/**
 * Unified useAuth hook aggregating session, user management, and roles
 */
export const useAuth = (): AuthContextType => {
  const session = useAuthSession();
  const userMgmt = useUserManagement();
  const roleMgmt = useRoleManagement();

  const resetAuthData = () => {
    session.resetSessionData();
    userMgmt.resetUserData();
    roleMgmt.resetRoleData();
  };

  return {
    ...session,
    ...userMgmt,
    ...roleMgmt,
    resetAuthData,
  };
};

// Aliases
export const AuthenticationProvider = AuthProvider;
export const useAuthentication = useAuth;
