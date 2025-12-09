"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Search, Download, Calendar, Phone, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RecentCustomer {
  id: string;
  name: string;
  phone: string;
  lastVisitDate: string;
  invoiceCode?: string;
  totalSpent: number;
}

interface RecentCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
}

export default function RecentCustomersModal({
  isOpen,
  onClose,
  customers,
}: RecentCustomersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter recent customers (visited in last 30 days or sorted by last visit)
  const recentCustomers = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return customers
      .filter((c) => {
        if (!c.lastVisitDate) return false;
        const lastVisit = new Date(c.lastVisitDate);
        return lastVisit >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const dateA = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0;
        const dateB = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0;
        return dateB - dateA;
      })
      .map((c) => ({
        id: c.id,
        name: c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim(),
        phone: c.phone,
        lastVisitDate: c.lastVisitDate || c.createdAt,
        invoiceCode: `#${c.id.slice(0, 8).toUpperCase()}`,
        totalSpent: c.totalSpent || 0,
      }));
  }, [customers]);

  const filteredCustomers = recentCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    alert("Tính năng xuất Excel đang được phát triển");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khách hàng gần đây"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-600">
            {filteredCustomers.length > 0 && (
              <>
                {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} của{" "}
                {filteredCustomers.length}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download size={18} className="mr-2" />
              Xuất Excel
            </Button>
            <Button variant="destructive" onClick={onClose}>
              <X size={18} className="mr-2" />
              Đóng
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm khách hàng theo tên hoặc số điện thoại"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-40"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-40"
            />
          </div>
        </div>

        {/* Customers List */}
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
          {paginatedCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Không có khách hàng gần đây</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {getInitials(customer.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {customer.invoiceCode && (
                          <span className="text-xs text-gray-500">
                            {customer.invoiceCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone size={14} />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>{formatDate(customer.lastVisitDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <FileText size={14} />
                          <span>{customer.totalSpent.toLocaleString()} ₫</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {currentPage} của {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

