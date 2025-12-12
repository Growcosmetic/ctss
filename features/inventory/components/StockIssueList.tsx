"use client";

import React, { useState, useEffect } from "react";
import { FileText, Plus, Edit, Trash2, Search, Loader2, Download, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import StockIssueModal from "./StockIssueModal";
import StockTransferModal from "./StockTransferModal";
import * as XLSX from "xlsx";

interface IssueItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
  };
}

interface StockIssue {
  id: string;
  issueNumber: string;
  branchId: string;
  reason: string;
  recipientId: string | null;
  recipientName: string | null;
  staffId: string | null;
  date: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  items: IssueItem[];
  branch: {
    id: string;
    name: string;
  };
  staff: {
    id: string;
    name: string;
    phone: string;
  } | null;
}

interface StockIssueListProps {
  branchId: string;
}

export default function StockIssueList({ branchId }: StockIssueListProps) {
  const [issues, setIssues] = useState<StockIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<string | undefined>();

  useEffect(() => {
    // Set default date range to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(lastDay.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    loadIssues();
  }, [branchId, statusFilter, reasonFilter, dateFrom, dateTo]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        branchId,
        limit: "100",
      });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (reasonFilter !== "all") {
        params.append("reason", reasonFilter);
      }
      if (dateFrom) {
        params.append("dateFrom", dateFrom);
      }
      if (dateTo) {
        params.append("dateTo", dateTo);
      }
      if (searchTerm) {
        params.append("issueNumber", searchTerm);
      }

      const response = await fetch(`/api/inventory/issues?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIssues(result.data.issues || []);
        }
      }
    } catch (error) {
      console.error("Error loading issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phiếu xuất này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/issues/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert("✅ Xóa phiếu xuất thành công!");
          loadIssues();
        } else {
          alert(result.error || "Không thể xóa phiếu xuất");
        }
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Có lỗi xảy ra khi xóa phiếu xuất");
    }
  };

  const handleExportExcel = async () => {
    try {
      if (issues.length === 0) {
        alert("Không có dữ liệu để xuất");
        return;
      }

      const exportData = issues.map((issue) => ({
        "Mã phiếu": issue.issueNumber,
        "Ngày xuất": new Date(issue.date).toLocaleDateString("vi-VN"),
        "Người nhận": issue.recipientName || issue.staff?.name || "--",
        "Phân loại": getReasonLabel(issue.reason),
        "Tình trạng": getStatusLabel(issue.status),
        "Số lượng SP": issue.items.length,
        "Tổng tiền": issue.totalAmount,
        "Ghi chú": issue.notes || "",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PHIẾU XUẤT KHO");

      const filename = `danh_sach_phieu_xuat_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, filename);

      alert(`✅ Đã xuất ${issues.length} phiếu xuất ra file Excel`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Có lỗi xảy ra khi xuất Excel");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-800" },
      APPROVED: { label: "Đã duyệt", className: "bg-blue-100 text-blue-800" },
      COMPLETED: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
    };
    const badge = badges[status] || badges.DRAFT;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Nháp",
      APPROVED: "Đã duyệt",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      XUAT_TIEU_HAO: "Xuất tiêu hao",
      XUAT_DAO_TAO: "Xuất đào tạo",
      XUAT_BAN_HOC_VIEN: "Xuất bán học viên",
      XUAT_TRA_HANG_NCC: "Xuất trả hàng NCC",
      XUAT_HUY_HONG_HOC: "Xuất huỷ vì hỏng hóc",
      XUAT_CHO_TANG: "Xuất cho/tặng",
      XUAT_DONG_GOI: "Xuất đóng gói",
      XUAT_HANG_SVC: "Xuất hàng SVC",
      XUAT_KHAC: "Xuất khác",
      BAN_HANG: "Bán hàng",
      SU_DUNG: "Sử dụng",
      BAN_NHAN_VIEN: "Bán nhân viên",
    };
    return labels[reason] || reason;
  };

  const filteredIssues = issues.filter((issue) => {
    if (searchTerm && !issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Phiếu xuất kho
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsTransferModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
          >
            <ArrowRight className="w-4 h-4" />
            Xuất sang kho nội bộ
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất Excel
          </Button>
          <Button
            onClick={() => {
              setEditingIssue(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo phiếu xuất
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã phiếu xuất
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã phiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tất cả các chi nhánh
            </label>
            <select
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            >
              <option>Chi nhánh hiện tại</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tất cả nhân viên
            </label>
            <select
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            >
              <option>Tất cả nhân viên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hiện tất cả tình trạng
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tất cả phân loại
            </label>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả phân loại</option>
              <option value="XUAT_TIEU_HAO">Xuất tiêu hao</option>
              <option value="XUAT_DAO_TAO">Xuất đào tạo</option>
              <option value="XUAT_BAN_HOC_VIEN">Xuất bán học viên</option>
              <option value="XUAT_TRA_HANG_NCC">Xuất trả hàng NCC</option>
              <option value="XUAT_HUY_HONG_HOC">Xuất huỷ vì hỏng hóc</option>
              <option value="XUAT_CHO_TANG">Xuất cho/tặng</option>
              <option value="XUAT_DONG_GOI">Xuất đóng gói</option>
              <option value="XUAT_HANG_SVC">Xuất hàng SVC</option>
              <option value="XUAT_KHAC">Xuất khác</option>
              <option value="BAN_HANG">Bán hàng</option>
              <option value="SU_DUNG">Sử dụng</option>
              <option value="BAN_NHAN_VIEN">Bán nhân viên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm ? "Không tìm thấy phiếu xuất" : "Chưa có phiếu xuất nào"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Người nhận
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Phân loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Tình trạng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Chi nhánh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {issue.issueNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(issue.date).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Hệ thống
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {issue.recipientName || issue.staff?.name || "--"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getReasonLabel(issue.reason)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(issue.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {issue.branch.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {issue.totalAmount.toLocaleString("vi-VN")} ₫
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          Xem
                        </button>
                        {issue.status === "DRAFT" && (
                          <>
                            <button
                              onClick={() => {
                                setEditingIssue(issue.id);
                                setIsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(issue.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiện 1 đến {filteredIssues.length} của {filteredIssues.length} dữ liệu
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                Đầu tiên
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                Trước đó
              </button>
              <button className="px-3 py-1 text-sm border border-blue-500 bg-blue-50 text-blue-700 rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                Tiếp theo
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100">
                Cuối cùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StockIssueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIssue(undefined);
        }}
        onSuccess={() => {
          loadIssues();
          setIsModalOpen(false);
          setEditingIssue(undefined);
        }}
        branchId={branchId}
        issueId={editingIssue}
      />

      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={() => {
          loadIssues();
          setIsTransferModalOpen(false);
        }}
        fromBranchId={branchId}
      />
    </div>
  );
}
