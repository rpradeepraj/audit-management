"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AuditLog,
  NotificationItem,
  ActiveTab,
} from "../../shared/types/audit";
import {
  INITIAL_LOGS,
  INITIAL_NOTIFICATIONS,
} from "../data/mockData";

export type CompanyAdminSubTab = "firms" | "template-firm" | "planning";

interface NotificationContextType {
  logs: AuditLog[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  companyAdminSubTab: CompanyAdminSubTab;
  setCompanyAdminSubTab: (subTab: CompanyAdminSubTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addAuditLog: (action: string, entityType: AuditLog["entityType"], entityId: string, details: string, user?: { name: string; role: string }) => void;
  addNotification: (title: string, message: string, type: NotificationItem["type"], linkTab?: string, linkEntityId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetNotificationData: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LOGS: "ams_logs_v2",
  NOTIFICATIONS: "ams_notifications_v2",
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<AuditLog[]>(() => {
    if (typeof window === "undefined") return INITIAL_LOGS;
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>("dashboard");
  const [companyAdminSubTab, setCompanyAdminSubTab] = useState<CompanyAdminSubTab>("firms");
  const [searchQuery, setSearchQuery] = useState("");

  const setActiveTab = (tab: ActiveTab) => {
    if (tab === "planning") {
      setActiveTabState("company-admin");
      setCompanyAdminSubTab("planning");
    } else if (tab === "perform") {
      setActiveTabState("company-admin");
      setCompanyAdminSubTab("planning");
    } else {
      setActiveTabState(tab);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }
  }, [logs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  }, [notifications]);

  const addAuditLog = (
    action: string,
    entityType: AuditLog["entityType"],
    entityId: string,
    details: string,
    user?: { name: string; role: string }
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      userName: user?.name || "System Admin",
      userRole: (user?.role as any) || "Platform Admin",
      action,
      entityType,
      entityId,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem["type"],
    linkTab?: string,
    linkEntityId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: "Just now",
      read: false,
      linkTab,
      linkEntityId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetNotificationData = () => {
    setLogs(INITIAL_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTabState("dashboard");
    setCompanyAdminSubTab("firms");
    setSearchQuery("");
  };

  return (
    <NotificationContext.Provider
      value={{
        logs,
        auditLogs: logs,
        notifications,
        activeTab,
        setActiveTab,
        companyAdminSubTab,
        setCompanyAdminSubTab,
        searchQuery,
        setSearchQuery,
        addAuditLog,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        resetNotificationData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
