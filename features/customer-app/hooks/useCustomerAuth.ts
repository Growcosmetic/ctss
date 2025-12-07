"use client";

import { useState, useEffect } from "react";
import { getCustomerMe } from "../services/customerAuthApi";
import { useRouter } from "next/navigation";

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const data = await getCustomerMe();
      setCustomer(data.customer);
      setAuthenticated(true);
    } catch (error) {
      setAuthenticated(false);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear cookie
    document.cookie = "customer-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCustomer(null);
    setAuthenticated(false);
    router.push("/customer-app/login");
  };

  return {
    customer,
    loading,
    authenticated,
    checkAuth,
    logout,
  };
}

