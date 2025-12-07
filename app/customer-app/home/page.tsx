"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import CustomerHome from "@/features/customer-app/components/CustomerHome";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { Loader2 } from "lucide-react";

export default function CustomerHomePage() {
  const { authenticated, loading } = useCustomerAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  if (!authenticated) {
    router.push("/customer-app/login");
    return null;
  }

  return (
    <>
      <CustomerHome />
      <CustomerNavBar />
    </>
  );
}

