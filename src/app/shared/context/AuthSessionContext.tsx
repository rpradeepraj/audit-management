"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../../shared/types/audit";
import { authService } from "@/shared/services";
import { INITIAL_USERS } from "../data/mockData";
import { useNotifications } from "./NotificationContext";
import { useUserManagement } from "./UserManagementContext";

export interface AuthSessionContextType {
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
  resetSessionData: () => void;
}

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: "ams_current_user_id_v2",
  IS_AUTHENTICATED: "ams_is_authenticated_v2",
  USERS: "ams_users_v2",
};

const DEFAULT_AUTH_USER: User = {
  id: "usr_admin",
  name: "Platform Admin",
  email: "admin@ams.io",
  role: "Platform Admin",
  companyName: "AMS Platform",
  companyId: "platform_root",
  status: "Active",
};

export const AuthSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addAuditLog, addNotification, setActiveTab } = useNotifications();
  const { users, setUsers } = useUserManagement();

  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (typeof window === "undefined") return DEFAULT_AUTH_USER;
    const savedUserObj = localStorage.getItem("ams_current_user_object_v2");
    if (savedUserObj) {
      try {
        const parsed = JSON.parse(savedUserObj);
        if (parsed && parsed.id) return parsed;
      } catch {}
    }
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const userPool: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    const found = userPool.find((u) => u.id === savedId);
    return found || DEFAULT_AUTH_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const savedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return savedAuth !== null ? savedAuth === "true" : false;
  });

  // Helper to ensure a valid JWT token exists for the active session
  const syncSessionToken = async (user: User) => {
    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.companyName,
          Organization: (user as any).Organization || user.companyName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token || data.data?.token;
        if (data.success && token) {
          authService.setToken(token);
        }
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      const isAuth = savedAuth === "true" || !!authService.getToken();
      setIsAuthenticated(isAuth);

      const savedUserObj = localStorage.getItem("ams_current_user_object_v2");
      let activeUser = currentUser;
      if (savedUserObj) {
        try {
          const parsed = JSON.parse(savedUserObj);
          if (parsed && parsed.id) {
            activeUser = parsed;
            setCurrentUser(parsed);
          }
        } catch {}
      } else {
        const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
        if (savedId) {
          const found = users.find((u) => u.id === savedId);
          if (found) {
            activeUser = found;
            setCurrentUser(found);
          }
        }
      }

      // Ensure token is synced if missing
      if (!authService.getToken() && activeUser) {
        syncSessionToken(activeUser);
      }

      setIsInitialized(true);
    }
  }, [users]);

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
      localStorage.setItem("ams_current_user_object_v2", JSON.stringify(currentUser));
      if (!authService.getToken()) {
        syncSessionToken(currentUser);
      }
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, isAuthenticated ? "true" : "false");
    }
  }, [isAuthenticated, isInitialized]);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    syncSessionToken(user);
    setActiveTab("dashboard");
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      localStorage.setItem("ams_current_user_object_v2", JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, "true");
    }
    addAuditLog("User Authenticated", "User", user.id, `Signed in as ${user.name} (${user.role})`);
    addNotification("Welcome Back", `Signed in successfully as ${user.name} (${user.role}).`, "info");
  };

  const loginWithEmail = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // 1. Call server API via authService
    try {
      const authRes = await authService.login({ email: trimmed, password: cleanPassword });
      if (authRes.success && authRes.user) {
        const found = users.find((u) => u.email.toLowerCase() === trimmed || u.id === authRes.user.id);
        const orgName = authRes.user.Organization || authRes.user.companyName || "Bytesandbinaries";
        const activeUser: User = {
          id: authRes.user.id || `usr_${Date.now()}`,
          name: authRes.user.name || found?.name || "Administrator",
          email: authRes.user.email || trimmed,
          role: authRes.user.role || found?.role || "Platform Admin",
          avatar: authRes.user.avatar || found?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          companyName: orgName,
          Organization: orgName,
          companyId: authRes.user.firm_id || found?.companyId || "1",
          phone: authRes.user.phone || found?.phone,
        };
        login(activeUser);
        return { success: true };
      }

      if (authRes && !authRes.success && authRes.error) {
        return { success: false, error: authRes.error };
      }
    } catch {
      // Server unreachable / network offline fallback
    }

    // 2. Offline / local dev demo fallback
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        (trimmed === "admin@auditfirm.com" && (u.role === "Platform Admin" || u.role === "Admin")) ||
        (trimmed === "victoria.sterling@auditcore.global" && (u.role === "Platform Admin" || u.role === "Admin"))
    );

    if (!user) {
      return { success: false, error: "Invalid email address or account not found." };
    }

    if (cleanPassword && cleanPassword !== "password123" && cleanPassword !== "admin123") {
      return { success: false, error: "Invalid password. Please check your credentials." };
    }

    login(user);
    return { success: true };
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    role: UserRole;
    companyName: string;
    isCustomerUser: boolean;
  }): { success: boolean; error?: string } => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: "An account with this email address already exists. Please log in." };
    }

    const newId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      companyName: userData.companyName,
      companyId: userData.isCustomerUser ? `cust_${Date.now()}` : "comp_veritas",
      isCustomerUser: userData.isCustomerUser,
    };

    setUsers((prev) => [...prev, newUser]);
    login(newUser);
    addAuditLog("Account Registered", "User", newId, `New account registered: ${newUser.name} with role ${newUser.role} at ${newUser.companyName}`);
    return { success: true };
  };

  const logout = () => {
    authService.logout();
    addAuditLog("User Logged Out", "User", currentUser.id, `User ${currentUser.name} signed out.`);
    setIsAuthenticated(false);
  };

  const resetSessionData = () => {
    setCurrentUser(DEFAULT_AUTH_USER);
    setIsAuthenticated(false);
  };

  return (
    <AuthSessionContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isInitialized,
        login,
        loginWithEmail,
        registerUser,
        logout,
        resetSessionData,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
};

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }
  return context;
};
