"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Download, Filter, FileSpreadsheet, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AdvancedFilterModal, { AdvancedFilters } from "./AdvancedFilterModal";
import { debounce, searchInFields } from "@/lib/searchUtils";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatar?: string;
  customerCode?: string;
}

interface CustomerListPanelProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedSegment?: string;
  onSegmentChange?: (segment: string) => void;
  onAdvancedFilterChange?: (filters: AdvancedFilters) => void;
  advancedFilters?: AdvancedFilters;
  totalCount?: number;
}

export default function CustomerListPanel({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  searchTerm,
  onSearchChange,
  selectedSegment,
  onSegmentChange,
  onAdvancedFilterChange,
  advancedFilters = {},
  totalCount,
}: CustomerListPanelProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
      onSearchChange(term);
    }, 300),
    [onSearchChange]
  );

  useEffect(() => {
    debouncedSearch(localSearchTerm);
  }, [localSearchTerm, debouncedSearch]);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Search filter (client-side for instant feedback)
    if (debouncedSearchTerm) {
      filtered = filtered.filter((c) =>
        searchInFields(c, debouncedSearchTerm, [
          "firstName",
          "lastName",
          "phone",
          "email",
          "customerCode",
        ])
      );
    }

    return filtered;
  }, [customers, debouncedSearchTerm]);

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0]?.toUpperCase() || "";
    const last = lastName?.[0]?.toUpperCase() || "";
    return `${first}${last}` || "?";
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-72px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Khách hàng</h2>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm theo tên, SĐT, email, mã KH..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Tìm kiếm khách hàng"
          />
          {localSearchTerm && (
            <button
              onClick={() => {
                setLocalSearchTerm("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Xóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Badges */}
        {(advancedFilters.membershipStatus?.length > 0 ||
          advancedFilters.source?.length > 0 ||
          advancedFilters.dateFrom ||
          advancedFilters.dateTo ||
          advancedFilters.customerGroup?.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {advancedFilters.membershipStatus?.map((status) => (
              <span
                key={status}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                Membership: {status}
                <button
                  onClick={() => {
                    const newFilters = {
                      ...advancedFilters,
                      membershipStatus: advancedFilters.membershipStatus?.filter((s) => s !== status),
                    };
                    if (onAdvancedFilterChange) {
                      onAdvancedFilterChange(newFilters);
                    }
                  }}
                  className="hover:text-blue-900"
                  aria-label={`Xóa filter ${status}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {advancedFilters.source?.map((source) => (
              <span
                key={source}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
              >
                Nguồn: {source}
                <button
                  onClick={() => {
                    const newFilters = {
                      ...advancedFilters,
                      source: advancedFilters.source?.filter((s) => s !== source),
                    };
                    if (onAdvancedFilterChange) {
                      onAdvancedFilterChange(newFilters);
                    }
                  }}
                  className="hover:text-green-900"
                  aria-label={`Xóa filter ${source}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {(advancedFilters.dateFrom || advancedFilters.dateTo) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Ngày: {advancedFilters.dateFrom || "..."} - {advancedFilters.dateTo || "..."}
                <button
                  onClick={() => {
                    const newFilters = { ...advancedFilters, dateFrom: undefined, dateTo: undefined };
                    if (onAdvancedFilterChange) {
                      onAdvancedFilterChange(newFilters);
                    }
                  }}
                  className="hover:text-purple-900"
                  aria-label="Xóa filter ngày"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {advancedFilters.customerGroup?.map((group) => (
              <span
                key={group}
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
              >
                Nhóm: {group}
                <button
                  onClick={() => {
                    const newFilters = {
                      ...advancedFilters,
                      customerGroup: advancedFilters.customerGroup?.filter((g) => g !== group),
                    };
                    if (onAdvancedFilterChange) {
                      onAdvancedFilterChange(newFilters);
                    }
                  }}
                  className="hover:text-orange-900"
                  aria-label={`Xóa filter ${group}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                if (onAdvancedFilterChange) {
                  onAdvancedFilterChange({});
                }
              }}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowAdvancedFilter(true)}
          >
            <Filter size={14} className="mr-1" />
            Bộ lọc
            {(advancedFilters.membershipStatus?.length > 0 ||
              advancedFilters.source?.length > 0 ||
              advancedFilters.dateFrom ||
              advancedFilters.dateTo ||
              advancedFilters.customerGroup?.length > 0) && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                {[
                  advancedFilters.membershipStatus?.length || 0,
                  advancedFilters.source?.length || 0,
                  advancedFilters.dateFrom || advancedFilters.dateTo ? 1 : 0,
                  advancedFilters.customerGroup?.length || 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" title="Xuất dữ liệu">
            <Download size={14} />
          </Button>
        </div>
        
        {/* Segmentation Filter */}
        <div className="mb-2">
          <select 
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSegment || ""}
            onChange={(e) => {
              if (onSegmentChange) {
                onSegmentChange(e.target.value);
              }
            }}
          >
            <option value="">Tất cả segments</option>
            <option value="A">Segment A - VIP High Value</option>
            <option value="B">Segment B - Ready-to-Return</option>
            <option value="C">Segment C - Overdue</option>
            <option value="D">Segment D - Lost</option>
            <option value="E">Segment E - High Risk</option>
            <option value="F">Segment F - Color Lovers</option>
            <option value="G">Segment G - Curl Lovers</option>
          </select>
        </div>
      </div>

      {/* Customer Count */}
      {(debouncedSearchTerm || Object.keys(advancedFilters).length > 0) && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-xs text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{filteredCustomers.length}</span>
            {totalCount !== undefined && (
              <>
                {" "}trên <span className="font-semibold text-gray-900">{totalCount}</span> khách hàng
              </>
            )}
          </p>
        </div>
      )}

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {debouncedSearchTerm || Object.keys(advancedFilters).length > 0 ? (
              <div>
                <p className="font-medium mb-1">Không tìm thấy khách hàng</p>
                <p className="text-xs">
                  Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc
                </p>
              </div>
            ) : (
              "Chưa có khách hàng"
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => {
              const fullName = `${customer.firstName} ${customer.lastName}`.trim();
              const isSelected = selectedCustomerId === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(customer.firstName, customer.lastName)
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                        {fullName || "Khách hàng"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{customer.phone}</p>
                      {customer.customerCode && (
                        <p className="text-xs text-gray-400 mt-0.5">{customer.customerCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      {onAdvancedFilterChange && (
        <AdvancedFilterModal
          isOpen={showAdvancedFilter}
          onClose={() => setShowAdvancedFilter(false)}
          onApply={onAdvancedFilterChange}
          currentFilters={advancedFilters}
        />
      )}
    </div>
  );
}

