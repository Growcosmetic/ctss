"use client";

import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  FileSpreadsheet,
  Printer,
  ShoppingCart,
  BarChart3,
  Lock,
  Download,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCustomer360 } from "@/features/customer360/hooks/useCustomer360";
import { Customer360Layout } from "@/features/customer360/components/Customer360Layout";
import CustomerFormModal from "@/components/crm/CustomerFormModal";
import CustomerListPanel from "@/components/crm/CustomerListPanel";
import CustomerDetailPanel from "@/components/crm/CustomerDetailPanel";
import CustomerActivityPanel from "@/components/crm/CustomerActivityPanel";
import CustomerGroupManagementModal from "@/components/crm/CustomerGroupManagementModal";
import RecentCustomersModal from "@/components/crm/RecentCustomersModal";
import CustomerStatsModal from "@/components/crm/CustomerStatsModal";
import ImportExcelModal from "@/components/crm/ImportExcelModal";

interface Customer {
  id: string;
  name?: string; // API trả về name
  firstName?: string; // Có thể có hoặc không
  lastName?: string; // Có thể có hoặc không
  email?: string;
  phone: string;
  dateOfBirth?: string;
  birthday?: string; // API có thể trả về birthday
  gender?: string;
  address?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string;
  loyaltyPoints: number;
  status: string;
  createdAt: string;
}

// Customer360 Drawer Component
function Customer360Drawer({
  customerId,
  customerName,
  onClose,
}: {
  customerId: string;
  customerName: string;
  onClose: () => void;
}) {
  const { data, loading, error } = useCustomer360(customerId);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-6xl h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">{customerName} - 360° View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-0">
          <Customer360Layout data={data} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [listSearchTerm, setListSearchTerm] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isRecentCustomersModalOpen, setIsRecentCustomersModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "totalSpent" | "totalVisits" | "lastVisitDate">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, [activeTab, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (activeTab !== "all") params.append("status", activeTab.toUpperCase());
      params.append("page", currentPage.toString());
      params.append("limit", itemsPerPage.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await fetch(`/api/customers?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        // Map customers để đảm bảo có firstName và lastName
        const mappedCustomers = result.data.customers.map((c: any) => {
          const fullName = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Khách hàng";
          const nameParts = fullName.trim().split(" ");
          const lastName = nameParts.pop() || "";
          const firstName = nameParts.join(" ") || lastName;
          
          return {
            ...c,
            name: fullName,
            firstName,
            lastName,
            dateOfBirth: c.dateOfBirth || c.birthday, // Support cả 2 field
            email: c.email || c.profile?.preferences?.email, // Get email from profile if not in customer
            address: c.address || c.profile?.preferences?.address,
            city: c.city || c.profile?.preferences?.city,
            province: c.province || c.profile?.preferences?.province,
            profile: c.profile || { preferences: {} }, // Ensure profile exists
          };
        });
        setCustomers(mappedCustomers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sort customers locally
  const sortedCustomers = useMemo(() => {
    const sorted = [...customers];
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "totalSpent":
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case "totalVisits":
          aValue = a.totalVisits;
          bValue = b.totalVisits;
          break;
        case "lastVisitDate":
          aValue = a.lastVisitDate ? new Date(a.lastVisitDate).getTime() : 0;
          bValue = b.lastVisitDate ? new Date(b.lastVisitDate).getTime() : 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return sorted;
  }, [customers, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa khách hàng này?")) return;

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchCustomers();
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchCustomers();
    setIsFormOpen(false);
    setEditingCustomer(null);
    // Refresh selected customer if editing
    if (selectedCustomer && editingCustomer) {
      fetchCustomers().then(() => {
        const updated = customers.find((c) => c.id === selectedCustomer.id);
        if (updated) {
          setSelectedCustomer(updated);
        }
      });
    }
  };

  const handleCustomerUpdate = () => {
    fetchCustomers().then(() => {
      if (selectedCustomer) {
        const updated = customers.find((c) => c.id === selectedCustomer.id);
        if (updated) {
          setSelectedCustomer(updated);
        }
      }
    });
  };

  const handleSelectCustomer = (customer: any) => {
    // Map từ CustomerListPanel format về Customer format
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const foundCustomer = sortedCustomers.find((c) => c.id === customer.id);
    if (foundCustomer) {
      setSelectedCustomer({
        ...foundCustomer,
        firstName: customer.firstName,
        lastName: customer.lastName,
        name: fullName,
      });
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = (phone: string) => {
    window.location.href = `sms:${phone}`;
  };

  // Header action handlers
  const handleManageGroups = () => {
    setIsGroupModalOpen(true);
  };

  const handleAddCustomerToGroup = async (customerId: string, groupName: string) => {
    try {
      // If groupName is empty, set to empty string (will be converted to "Chưa phân nhóm" by API)
      const finalGroupName = groupName === "Chưa phân nhóm" || groupName === "" ? "" : groupName;
      
      const response = await fetch("/api/crm/customers/update-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerIds: [customerId],
          groupName: finalGroupName,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update customer group");
      }

      // Refresh customers to get updated data
      await fetchCustomers();
      
      // Also update selected customer if it's the one being updated
      if (selectedCustomer && selectedCustomer.id === customerId) {
        const updatedCustomers = await fetch(`/api/customers?search=&page=1&limit=100`).then(r => r.json());
        if (updatedCustomers.success) {
          const updatedCustomer = updatedCustomers.data.customers.find((c: any) => c.id === customerId);
          if (updatedCustomer) {
            const fullName = updatedCustomer.name || `${updatedCustomer.firstName || ""} ${updatedCustomer.lastName || ""}`.trim() || "Khách hàng";
            const nameParts = fullName.trim().split(" ");
            const lastName = nameParts.pop() || "";
            const firstName = nameParts.join(" ") || lastName;
            setSelectedCustomer({
              ...updatedCustomer,
              name: fullName,
              firstName,
              lastName,
              profile: updatedCustomer.profile || { preferences: {} },
            });
          }
        }
      }
    } catch (error: any) {
      console.error("Error adding customer to group:", error);
      throw error;
    }
  };

  const handleRecentCustomers = () => {
    setIsRecentCustomersModalOpen(true);
  };

  const handleCustomerStats = () => {
    setIsStatsModalOpen(true);
  };

  const handleImportExcel = () => {
    setIsImportExcelModalOpen(true);
  };

  const handleImportSuccess = () => {
    fetchCustomers();
  };

  // Bottom action handlers
  const handlePrintReceipt = (customerId: string) => {
    window.open(`/api/customers/${customerId}/receipt`, '_blank');
  };

  const handleCreateOrder = (customerId: string) => {
    window.location.href = `/pos?customerId=${customerId}`;
  };

  const handleBookAppointment = (customerId: string) => {
    window.location.href = `/booking?customerId=${customerId}`;
  };

  const handleViewPoints = (customerId: string) => {
    alert(`Xem điểm tích lũy của khách hàng ${customerId}`);
  };

  const handleLockZalo = (customerId: string) => {
    if (confirm("Bạn có chắc muốn khóa gửi Zalo cho khách hàng này?")) {
      alert("Đã khóa gửi Zalo");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      BLACKLISTED: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.ACTIVE;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const newToday = customers.filter((c) => {
      const created = new Date(c.createdAt);
      return created.toISOString().split('T')[0] === todayStr;
    }).length;

    const birthdaysToday = customers.filter((c) => {
      if (!c.dateOfBirth) return false;
      const dob = new Date(c.dateOfBirth);
      return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    }).length;

    const birthdaysThisMonth = customers.filter((c) => {
      if (!c.dateOfBirth) return false;
      const dob = new Date(c.dateOfBirth);
      return dob.getMonth() === today.getMonth();
    }).length;

    return {
      total: customers.length,
      newToday,
      birthdaysToday,
      birthdaysThisMonth,
      active: customers.filter((c) => c.status === "ACTIVE").length,
      totalRevenue: customers.reduce((sum, c) => sum + Number(c.totalSpent), 0),
      totalPoints: customers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
    };
  }, [customers]);

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST, CTSSRole.STYLIST]}>
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-72px)]">
          {/* Header với Action Buttons */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleManageGroups}>
                  <Users size={16} className="mr-2" />
                  Quản lý nhóm
                </Button>
                <Button variant="outline" size="sm" onClick={handleRecentCustomers}>
                  <User size={16} className="mr-2" />
                  Khách hàng gần đây
                </Button>
                <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200" onClick={handleCustomerStats}>
                  <BarChart3 size={16} className="mr-2" />
                  Thống kê khách hàng
                </Button>
                <Button variant="outline" size="sm" onClick={handleImportExcel}>
                  <FileSpreadsheet size={16} className="mr-2" />
                  Nhập từ tệp excel
                </Button>
                <Button size="sm" onClick={() => setIsFormOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Thêm mới
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tổng số khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng mới hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newToday}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng sinh nhật hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">{stats.birthdaysToday}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng sinh nhật tháng này</p>
                <p className="text-2xl font-bold text-gray-900">{stats.birthdaysThisMonth}</p>
              </div>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Customer List */}
          <CustomerListPanel
            customers={sortedCustomers.map((c) => {
              // Parse name thành firstName và lastName
              const fullName = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Khách hàng";
              const nameParts = fullName.trim().split(" ");
              const lastName = nameParts.pop() || "";
              const firstName = nameParts.join(" ") || lastName;
              
              return {
                id: c.id,
                firstName,
                lastName,
                phone: c.phone,
                email: c.email,
                customerCode: c.id.slice(0, 8).toUpperCase(),
              };
            })}
            selectedCustomerId={selectedCustomer?.id || null}
            onSelectCustomer={handleSelectCustomer}
            searchTerm={listSearchTerm}
            onSearchChange={setListSearchTerm}
          />

                  {/* Center Panel - Customer Detail */}
                  <CustomerDetailPanel
                    customer={selectedCustomer}
                    onUpdate={handleCustomerUpdate}
                    onDelete={handleDelete}
                    onPrintReceipt={handlePrintReceipt}
                    onCreateOrder={handleCreateOrder}
                    onBookAppointment={handleBookAppointment}
                    onViewPoints={handleViewPoints}
                    onLockZalo={handleLockZalo}
                    onManageGroups={handleManageGroups}
                    allCustomers={customers}
                    onAddToGroup={handleAddCustomerToGroup}
                  />

          {/* Right Panel - Customer Activity */}
          <CustomerActivityPanel customerId={selectedCustomer?.id || null} />
          </div>
        </div>

        {/* Old Layout - Hidden for now */}
        <div className="hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM 360°</h1>
            <p className="text-gray-500 mt-1">Quản lý khách hàng toàn diện</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Thêm khách hàng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {customers.length}
                </p>
              </div>
              <User className="w-8 h-8 text-primary-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Khách hàng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {customers.filter((c) => c.status === "ACTIVE").length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    customers.reduce((sum, c) => sum + Number(c.totalSpent), 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Điểm tích lũy</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    fetchCustomers();
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              >
                <Filter size={18} className="mr-2" />
                Lọc
              </Button>
              {showAdvancedFilter && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lọc theo doanh thu
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">Tất cả</option>
                        <option value="0-1000000">0 - 1 triệu</option>
                        <option value="1000000-5000000">1 - 5 triệu</option>
                        <option value="5000000+">Trên 5 triệu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lọc theo lượt đến
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">Tất cả</option>
                        <option value="0">Chưa đến</option>
                        <option value="1-5">1 - 5 lần</option>
                        <option value="6-10">6 - 10 lần</option>
                        <option value="10+">Trên 10 lần</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sắp xếp theo
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="createdAt">Ngày tạo</option>
                        <option value="totalSpent">Tổng chi tiêu</option>
                        <option value="totalVisits">Lượt đến</option>
                        <option value="lastVisitDate">Lần đến cuối</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thứ tự
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="active">Hoạt động</TabsTrigger>
              <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
              <TabsTrigger value="blacklisted">Blacklist</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => {
                          if (sortBy === "createdAt") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortBy("createdAt");
                            setSortOrder("desc");
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Khách hàng
                        {sortBy === "createdAt" && <ArrowUpDown size={14} />}
                      </button>
                    </TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>
                      <button
                        onClick={() => {
                          if (sortBy === "totalVisits") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortBy("totalVisits");
                            setSortOrder("desc");
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Lượt đến
                        {sortBy === "totalVisits" && <ArrowUpDown size={14} />}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => {
                          if (sortBy === "totalSpent") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortBy("totalSpent");
                            setSortOrder("desc");
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Tổng chi tiêu
                        {sortBy === "totalSpent" && <ArrowUpDown size={14} />}
                      </button>
                    </TableHead>
                    <TableHead>Điểm tích lũy</TableHead>
                    <TableHead>
                      <button
                        onClick={() => {
                          if (sortBy === "lastVisitDate") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortBy("lastVisitDate");
                            setSortOrder("desc");
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-900"
                      >
                        Lần đến cuối
                        {sortBy === "lastVisitDate" && <ArrowUpDown size={14} />}
                      </button>
                    </TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                        Chưa có dữ liệu khách hàng
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </p>
                            {customer.dateOfBirth && (
                              <p className="text-sm text-gray-500">
                                {formatDate(customer.dateOfBirth)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {customer.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-gray-400" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} className="text-gray-400" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{customer.totalVisits}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(customer.totalSpent)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" />
                            <span>{customer.loyaltyPoints}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.lastVisitDate ? (
                            <span className="text-sm text-gray-500">
                              {formatDate(customer.lastVisitDate)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Chưa có</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              customer.status
                            )}`}
                          >
                            {customer.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCall(customer.phone)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Gọi điện"
                            >
                              <Phone size={18} />
                            </button>
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Xem chi tiết 360°"
                            >
                              <User size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="text-green-600 hover:text-green-700"
                              title="Sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {sortedCustomers.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị {sortedCustomers.length} khách hàng
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={sortedCustomers.length < itemsPerPage}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Customer 360 Detail Drawer - Keep for compatibility */}
        {false && selectedCustomer && (
          <Customer360Drawer
            customerId={selectedCustomer.id}
            customerName={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
        </div>

        {/* Customer Form Modal - For adding new customers */}
        <CustomerFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCustomer(null);
          }}
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
        />

            {/* Customer Group Management Modal */}
            <CustomerGroupManagementModal
              isOpen={isGroupModalOpen}
              onClose={() => setIsGroupModalOpen(false)}
              customers={customers}
              onUpdate={async () => {
                await fetchCustomers();
                // Force re-render by updating a key or state
              }}
              onGroupCreated={(groupName) => {
                // Refresh customers to update available groups
                fetchCustomers();
              }}
            />

        {/* Recent Customers Modal */}
        <RecentCustomersModal
          isOpen={isRecentCustomersModalOpen}
          onClose={() => setIsRecentCustomersModalOpen(false)}
          customers={customers}
        />

        {/* Customer Stats Modal */}
        <CustomerStatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          customers={customers}
        />

        {/* Import Excel Modal */}
        <ImportExcelModal
          isOpen={isImportExcelModalOpen}
          onClose={() => setIsImportExcelModalOpen(false)}
          onSuccess={() => {
            fetchCustomers();
          }}
        />
      </MainLayout>
    </RoleGuard>
  );
}
