"use client";

import React from "react";
import { User, Phone, Mail, Calendar, MapPin, Gift } from "lucide-react";
import { Customer, Gender } from "../types";
import { format } from "date-fns";

interface CustomerInfoCardProps {
  customer: Customer;
}

export default function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  const getGenderLabel = (gender?: Gender | null) => {
    switch (gender) {
      case Gender.MALE:
        return "Nam";
      case Gender.FEMALE:
        return "Nữ";
      case Gender.OTHER:
        return "Khác";
      default:
        return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {customer.firstName} {customer.lastName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: {customer.id}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Tổng chi tiêu</div>
          <div className="text-2xl font-bold text-blue-600">
            {Number(customer.totalSpent).toLocaleString("vi-VN")} đ
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{customer.phone}</span>
        </div>

        {customer.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{customer.email}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {formatDate(customer.dateOfBirth)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{getGenderLabel(customer.gender)}</span>
        </div>

        {customer.address && (
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {customer.address}
              {customer.city && `, ${customer.city}`}
              {customer.province && `, ${customer.province}`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {customer.loyaltyPoints} điểm
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Lần đến:</span>
          <span className="text-sm font-medium">{customer.totalVisits}</span>
        </div>
      </div>
    </div>
  );
}

