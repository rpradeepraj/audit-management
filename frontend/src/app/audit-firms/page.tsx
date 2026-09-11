"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { CompanyAdminView } from "@/features/audit-firms";

export default function AuditFirmsPage() {
  return (
    <AppLayout>
      <CompanyAdminView />
    </AppLayout>
  );
}
