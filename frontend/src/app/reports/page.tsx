"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { AuditReportView } from "@/features/reports";

export default function ReportsPage() {
  return (
    <AppLayout>
      <AuditReportView />
    </AppLayout>
  );
}
