"use client";

import React, { useState } from "react";
import { useAudit } from "@/shared/context";
import { useSettingsContext } from "@/components/settings";
import { Header, Sidebar, NotificationDrawer } from "@/shared/components/layout";

// Features
import { AuthView } from "@/features/auth";
import { DashboardView } from "@/features/dashboard";
import { CompanyAdminView } from "@/features/audit-firms";
import { CustomersView } from "@/features/customers";
import { TemplatesView } from "@/features/templates";
import { PerformAuditView } from "@/features/audit-execution";
import { FindingsView, LogFindingModal } from "@/features/findings";
import { CapaView } from "@/features/capa";
import { AuditReportView } from "@/features/reports";
import { AuditTrailView } from "@/features/audit-trail";

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useAudit();
  const { themeStretch } = useSettingsContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogFindingModalOpen, setIsLogFindingModalOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "customers":
        return <CustomersView />;
      case "templates":
        return <TemplatesView />;
      case "planning":
      case "company-admin":
        return <CompanyAdminView />;
      case "perform":
        return <PerformAuditView onBack={() => setActiveTab("planning")} />;
      case "findings":
        return <FindingsView />;
      case "capa":
        return <CapaView />;
      case "reports":
        return <AuditReportView />;
      case "audit-trail":
        return <AuditTrailView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/70 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onQuickCreateAudit={() => setActiveTab("planning")}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={themeStretch ? "w-full" : "max-w-7xl mx-auto px-2 sm:px-4"}>
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Slide-over Notification Center */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Global Log Finding Modal */}
      {isLogFindingModalOpen && (
        <LogFindingModal
          isOpen={isLogFindingModalOpen}
          onClose={() => setIsLogFindingModalOpen(false)}
        />
      )}
    </div>
  );
};

export default function Home() {
  const { isAuthenticated } = useAudit();

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return <MainLayout />;
}
