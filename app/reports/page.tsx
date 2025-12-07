"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ReportsDashboard from "@/features/reports/components/ReportsDashboard";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";

export default function ReportsPage() {
  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
      <MainLayout>
        <ReportsDashboard />
      </MainLayout>
    </RoleGuard>
  );
}
