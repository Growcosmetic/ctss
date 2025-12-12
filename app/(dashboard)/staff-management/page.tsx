"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import StaffManagementList from "@/features/staff-management/components/StaffManagementList";

export default function StaffManagementPage() {
  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER]}>
      <MainLayout>
        <div className="p-6">
          <StaffManagementList />
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
