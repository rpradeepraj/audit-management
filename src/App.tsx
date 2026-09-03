import React, { useState } from "react";
import { AuditProvider, useAudit } from "./context/AuditContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { NotificationDrawer } from "./components/common/NotificationDrawer";
import { LogFindingModal } from "./components/modals/LogFindingModal";
import { AuthView } from "./components/auth/AuthView";

// Views
import { DashboardView } from "./components/dashboard/DashboardView";
import { CustomersView } from "./components/customers/CustomersView";
import { TemplatesView } from "./components/templates/TemplatesView";
import { PerformAuditView } from "./components/execution/PerformAuditView";
import { FindingsView } from "./components/findings/FindingsView";
import { CapaView } from "./components/capa/CapaView";
import { AuditReportView } from "./components/reports/AuditReportView";
import { AuditTrailView } from "./components/audit-trail/AuditTrailView";
import { CompanyAdminView } from "./components/company-admin/CompanyAdminView";

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useAudit();
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
          {renderActiveView()}
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

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAudit();

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AuditProvider>
      <AppContent />
    </AuditProvider>
  );
}
