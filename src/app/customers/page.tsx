"use client";

import React from "react";
import { AppLayout } from "@/shared/components/layout";
import { CustomersView } from "@/features/customers";

export default function CustomersPage() {
  return (
    <AppLayout>
      <CustomersView />
    </AppLayout>
  );
}
