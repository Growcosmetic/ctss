"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginScreen from "@/features/customer-app/components/LoginScreen";
import OtpScreen from "@/features/customer-app/components/OtpScreen";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);

  const handleOTPSent = (phoneNumber: string) => {
    setPhone(phoneNumber);
  };

  const handleVerified = () => {
    router.push("/customer-app/home");
  };

  const handleBack = () => {
    setPhone(null);
  };

  if (phone) {
    return <OtpScreen phone={phone} onVerified={handleVerified} onBack={handleBack} />;
  }

  return <LoginScreen onOTPSent={handleOTPSent} />;
}

