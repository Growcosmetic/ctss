"use client";

import React, { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Search, Check, User } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  profile?: {
    preferences?: {
      customerGroup?: string;
    };
  };
}

interface AddCustomerToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  customers: Customer[];
  onAdd: (customerIds: string[], groupName: string) => Promise<void>;
}

export default function AddCustomerToGroupModal({
  isOpen,
  onClose,
  groupName,
  customers,
  onAdd,
}: AddCustomerToGroupModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Filter customers not in this group
  const availableCustomers = useMemo(() => {
    return customers.filter((c) => {
      const currentGroup = c.profile?.preferences?.customerGroup || "Chưa phân nhóm";
      return currentGroup !== groupName;
    });
  }, [customers, groupName]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return availableCustomers;
    return availableCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );
  }, [availableCustomers, searchTerm]);

  const handleToggleCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomerIds);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomerIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCustomerIds.size === filteredCustomers.length) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const handleAdd = async () => {
    if (selectedCustomerIds.size === 0) {
      alert("Vui lòng chọn ít nhất một khách hàng");
      return;
    }

    setLoading(true);
    try {
      await onAdd(Array.from(selectedCustomerIds), groupName);
      setSelectedCustomerIds(new Set());
      setSearchTerm("");
      onClose();
    } catch (error) {
      console.error("Error adding customers to group:", error);
      alert("Có lỗi xảy ra khi thêm khách hàng vào nhóm");
    } finally {
      setLoading(false);
    }
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
      title={`Thêm khách hàng vào nhóm: ${groupName}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-600">
            Đã chọn: <span className="font-medium">{selectedCustomerIds.size}</span> khách hàng
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X size={18} className="mr-2" />
              Hủy
            </Button>
            <Button onClick={handleAdd} disabled={loading || selectedCustomerIds.size === 0}>
              {loading ? "Đang thêm..." : `Thêm ${selectedCustomerIds.size} khách hàng`}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCustomerIds.size === filteredCustomers.length && filteredCustomers.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Chọn tất cả ({filteredCustomers.length})
            </span>
          </label>
        </div>

        {/* Customers List */}
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p>
                {searchTerm
                  ? "Không tìm thấy khách hàng"
                  : "Tất cả khách hàng đã ở trong nhóm này"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const isSelected = selectedCustomerIds.has(customer.id);
                return (
                  <label
                    key={customer.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCustomer(customer.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {getInitials(customer.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    </div>
                    {isSelected && (
                      <Check className="text-blue-600" size={20} />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

