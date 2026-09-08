"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { DashboardView } from "@/features/dashboard";
import { AuthView } from "@/features/auth";
import { useAudit } from "@/shared/context";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isInitialized } = useAudit();

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
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}
