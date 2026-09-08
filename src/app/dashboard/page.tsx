"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { DashboardView } from "@/features/dashboard";

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardView />
    </AppLayout>
  );
}
