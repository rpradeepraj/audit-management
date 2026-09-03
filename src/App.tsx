import React, { useState } from "react";
import { AuditProvider, useAudit } from "./context/AuditContext";
import { Header } from "./components/common/Header";
import { Sidebar } from "./components/common/Sidebar";
import { NotificationDrawer } from "./components/common/NotificationDrawer";
import { LogFindingModal } from "./components/modals/LogFindingModal";
import { RoleMatrixModal } from "./components/common/RoleMatrixModal";
import { AuthView } from "./components/auth/AuthView";
import { isModuleAllowedForRole } from "./utils/rbac";

// Views
import { DashboardView } from "./components/dashboard/DashboardView";
import { CustomersView } from "./components/customers/CustomersView";
import { TemplatesView } from "./components/templates/TemplatesView";
import { AuditPlanningView } from "./components/planning/AuditPlanningView";
import { PerformAuditView } from "./components/execution/PerformAuditView";
import { FindingsView } from "./components/findings/FindingsView";
import { CapaView } from "./components/capa/CapaView";
import { AuditReportView } from "./components/reports/AuditReportView";
import { AuditTrailView } from "./components/audit-trail/AuditTrailView";
import { CompanyAdminView } from "./components/company-admin/CompanyAdminView";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, setIsRoleMatrixModalOpen } = useAudit();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogFindingModalOpen, setIsLogFindingModalOpen] = useState(false);

  const isTabAllowed = isModuleAllowedForRole(currentUser.role, activeTab);

  const renderActiveView = () => {
    if (!isTabAllowed) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted by Role Policy</h2>
          <p className="text-sm text-slate-600 mt-2">
            The <strong>{activeTab}</strong> module is not permitted for your <strong>{currentUser.role}</strong> role.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </button>
            {(currentUser.role === "Platform Admin" || currentUser.role === "Admin") && (
              <button
                onClick={() => setIsRoleMatrixModalOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Inspect Role Access Matrix
              </button>
            )}
          </div>
        </div>
      );
    }

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

      {/* Global Role Access Matrix Modal (Admin only) */}
      {(currentUser.role === "Platform Admin" || currentUser.role === "Admin") && <RoleMatrixModal />}
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
