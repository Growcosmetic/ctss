"use client";

import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import ChatContainer from "@/features/mina/bot/components/ChatContainer";

export default function MinaPage() {
  return (
    <RoleGuard
      roles={[
        CTSSRole.ADMIN,
        CTSSRole.MANAGER,
        CTSSRole.RECEPTIONIST,
        CTSSRole.STYLIST,
        CTSSRole.ASSISTANT,
      ]}
    >
      <MainLayout>
        <div className="h-[calc(100vh-120px)] max-w-4xl mx-auto">
          <ChatContainer />
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

