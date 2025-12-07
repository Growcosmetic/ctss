// ============================================
// Customer360 Header Card
// ============================================

"use client";

import React from "react";
import { User, Phone, Calendar, Gift } from "lucide-react";
import type { Customer360Core } from "../types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CustomerHeaderCardProps {
  core: Customer360Core;
}

export function CustomerHeaderCard({ core }: CustomerHeaderCardProps) {
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString.slice(0, 10);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
              {core.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {core.name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{core.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
            {core.gender && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{core.gender}</span>
              </div>
            )}
            {core.birthday && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Sinh nhật: {formatDate(core.birthday)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>Thành viên từ: {formatDate(core.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-sm font-medium">
            Khách hàng
          </span>
        </div>
      </div>
    </div>
  );
}

