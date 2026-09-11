"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/shared/components/layout";
import { PerformAuditView } from "@/features/audit-execution";

export default function PerformPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <PerformAuditView onBack={() => router.push("/planning")} />
    </AppLayout>
  );
}
