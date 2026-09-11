"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { AuditTrailView } from "@/features/audit-trail";

export default function AuditTrailPage() {
  return (
    <AppLayout>
      <AuditTrailView />
    </AppLayout>
  );
}
