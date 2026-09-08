"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { FindingsView } from "@/features/findings";

export default function FindingsPage() {
  return (
    <AppLayout>
      <FindingsView />
    </AppLayout>
  );
}
