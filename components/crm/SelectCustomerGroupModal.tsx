"use client";

import React, { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Users, Check } from "lucide-react";

interface SelectCustomerGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  currentGroup?: string;
  availableGroups: string[];
  onSelectGroup: (customerId: string, groupName: string) => Promise<void>;
  onCreateNewGroup?: () => void;
}

export default function SelectCustomerGroupModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  currentGroup,
  availableGroups,
  onSelectGroup,
  onCreateNewGroup,
}: SelectCustomerGroupModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>(currentGroup || "");
  const [loading, setLoading] = useState(false);

  const handleSelect = async () => {
    if (!selectedGroup) {
      alert("Vui lòng chọn một nhóm");
      return;
    }

    setLoading(true);
    try {
      await onSelectGroup(customerId, selectedGroup);
      onClose();
    } catch (error: any) {
      console.error("Error selecting group:", error);
      alert(error.message || "Có lỗi xảy ra khi thêm khách hàng vào nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromGroup = async () => {
    setLoading(true);
    try {
      await onSelectGroup(customerId, "");
      onClose();
    } catch (error: any) {
      console.error("Error removing from group:", error);
      alert(error.message || "Có lỗi xảy ra khi xóa khách hàng khỏi nhóm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thêm/Di chuyển nhóm cho: ${customerName}`}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          {currentGroup && (
            <Button
              variant="outline"
              onClick={handleRemoveFromGroup}
              disabled={loading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Xóa khỏi nhóm hiện tại
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X size={18} className="mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSelect} disabled={loading || !selectedGroup}>
              {loading ? "Đang xử lý..." : currentGroup ? "Di chuyển nhóm" : "Thêm vào nhóm"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            {currentGroup ? (
              <>
                Khách hàng hiện đang ở nhóm: <strong>{currentGroup}</strong>
                <br />
                Chọn nhóm khác để di chuyển hoặc xóa khỏi nhóm hiện tại.
              </>
            ) : (
              "Khách hàng chưa có nhóm. Chọn một nhóm để thêm vào."
            )}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn nhóm khách hàng
          </label>
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
            <div className="divide-y divide-gray-200">
              <label
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedGroup === "" ? "bg-blue-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="group"
                  value=""
                  checked={selectedGroup === ""}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <Users size={20} className="text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Chưa phân nhóm</p>
                  <p className="text-sm text-gray-600">Không thuộc nhóm nào</p>
                </div>
                {selectedGroup === "" && (
                  <Check className="text-blue-600" size={20} />
                )}
              </label>

              {availableGroups.map((group) => (
                <label
                  key={group}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedGroup === group ? "bg-blue-50" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="group"
                    value={group}
                    checked={selectedGroup === group}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Users size={20} className="text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{group}</p>
                    {currentGroup === group && (
                      <p className="text-sm text-blue-600">Nhóm hiện tại</p>
                    )}
                  </div>
                  {selectedGroup === group && (
                    <Check className="text-blue-600" size={20} />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {onCreateNewGroup && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onCreateNewGroup();
              }}
              className="w-full"
            >
              + Tạo nhóm mới
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

