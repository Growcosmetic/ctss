"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import { getCustomerNotifications } from "@/features/customer-app/services/customerApi";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { CustomerNotification } from "@/features/customer-app/types";
import { Bell, Calendar, Gift, Award, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function CustomerNotificationsPage() {
  const { authenticated, loading: authLoading } = useCustomerAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (authenticated) {
      loadNotifications();
    }
  }, [authenticated, authLoading]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getCustomerNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING_REMINDER":
        return <Calendar className="w-5 h-5" />;
      case "LOYALTY_TIER_UPGRADE":
        return <Award className="w-5 h-5" />;
      case "PROMOTION":
        return <Gift className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <h1 className="text-2xl font-bold">Thông báo</h1>
        </div>

        {/* Notifications */}
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Chưa có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl p-4 border-2 ${
                  notif.isRead
                    ? "border-gray-200"
                    : "border-pink-200 bg-pink-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {notif.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

