"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, Gift, User, Bell } from "lucide-react";

export default function CustomerNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: "Trang chủ", path: "/customer-app/home" },
    { icon: Calendar, label: "Lịch hẹn", path: "/customer-app/bookings" },
    { icon: Gift, label: "Ưu đãi", path: "/customer-app/promotions" },
    { icon: Bell, label: "Thông báo", path: "/customer-app/notifications" },
    { icon: User, label: "Cá nhân", path: "/customer-app/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 p-2 min-w-[60px] transition-colors ${
                isActive ? "text-pink-600" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

