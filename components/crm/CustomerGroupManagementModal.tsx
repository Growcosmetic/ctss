"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Plus, Edit, Trash2, Users, Search } from "lucide-react";

interface CustomerGroup {
  id: string;
  name: string;
  customerCount: number;
}

interface CustomerGroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: any[];
}

export default function CustomerGroupManagementModal({
  isOpen,
  onClose,
  customers,
}: CustomerGroupManagementModalProps) {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract unique groups from customers
  useEffect(() => {
    if (customers.length > 0) {
      const groupMap = new Map<string, number>();
      
      customers.forEach((customer) => {
        const groupName = customer.profile?.preferences?.customerGroup || "Chưa phân nhóm";
        groupMap.set(groupName, (groupMap.get(groupName) || 0) + 1);
      });

      const extractedGroups: CustomerGroup[] = Array.from(groupMap.entries()).map(([name, count], index) => ({
        id: `group-${index}`,
        name,
        customerCount: count,
      }));

      setGroups(extractedGroups);
    }
  }, [customers]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: CustomerGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      customerCount: 0,
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setIsCreating(false);
  };

  const handleEditGroup = (group: CustomerGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setIsCreating(false);
  };

  const handleSaveEdit = () => {
    if (!editingGroup || !newGroupName.trim()) return;
    
    setGroups(groups.map((g) => 
      g.id === editingGroup.id ? { ...g, name: newGroupName.trim() } : g
    ));
    
    setEditingGroup(null);
    setNewGroupName("");
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm("Bạn có chắc muốn xóa nhóm này? Khách hàng trong nhóm sẽ được chuyển về 'Chưa phân nhóm'.")) {
      setGroups(groups.filter((g) => g.id !== groupId));
    }
  };

  const handleAddCustomer = (groupId: string) => {
    // TODO: Implement add customer to group
    alert(`Tính năng thêm khách hàng vào nhóm đang được phát triển`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý nhóm"
      size="lg"
      footer={
        <div className="flex items-center justify-end">
          <Button variant="destructive" onClick={onClose}>
            <X size={18} className="mr-2" />
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search and Create */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Tìm kiếm nhóm khách hàng"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {!isCreating && !editingGroup && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus size={18} className="mr-2" />
              Tạo mới
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingGroup) && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tên nhóm khách hàng"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={editingGroup ? handleSaveEdit : handleCreateGroup}>
                {editingGroup ? "Lưu" : "Tạo"}
              </Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setEditingGroup(null);
                setNewGroupName("");
              }}>
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên nhóm</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số lượng khách</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? "Không tìm thấy nhóm nào" : "Chưa có nhóm khách hàng"}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{group.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{group.customerCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddCustomer(group.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Plus size={14} className="mr-1" />
                          Thêm khách
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="text-sm text-gray-600">
          Tổng số nhóm: <span className="font-medium text-gray-900">{groups.length}</span> | 
          Tổng số khách hàng: <span className="font-medium text-gray-900">{customers.length}</span>
        </div>
      </div>
    </Modal>
  );
}

