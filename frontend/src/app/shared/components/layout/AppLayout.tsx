"use client";

import React, { useState } from "react";
import { useAudit } from "@/shared/context";
import { useSettingsContext } from "@/components/settings";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { LogFindingModal } from "@/features/findings";
import { AuthView } from "@/features/auth";
import { ToastNotification } from "@/shared/components/ui";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    isAuthenticated,
    isInitialized,
    successMessage,
    errorMessage,
    clearMessage,
  } = useAudit();
  const { themeStretch } = useSettingsContext();
  const [isLogFindingModalOpen, setIsLogFindingModalOpen] = useState(false);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen bg-slate-100/70 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={themeStretch ? "w-full" : "max-w-7xl mx-auto px-2 sm:px-4 py-4"}>
            {children}
          </div>
        </main>
      </div>

      {/* Global Toast Notification for Success / Failure across applications */}
      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
        onClose={clearMessage}
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

export default AppLayout;
