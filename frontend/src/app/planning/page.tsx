"use client";

import React, { useEffect } from "react";
import { AppLayout } from "@/shared/components/layout";
import { CompanyAdminView } from "@/features/audit-firms";
import { useAudit } from "@/shared/context";

export default function PlanningPage() {
  const { setCompanyAdminSubTab, setPlanningExecutionMode } = useAudit();

  useEffect(() => {
    setCompanyAdminSubTab("planning");
    setPlanningExecutionMode("plans");
  }, []);

  return (
    <AppLayout>
      <CompanyAdminView />
    </AppLayout>
  );
}
