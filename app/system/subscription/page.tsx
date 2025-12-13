"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { CreditCard, Check, X, AlertCircle, TrendingUp } from "lucide-react";
import { SubscriptionPlan } from "@prisma/client";

interface Plan {
  id: string;
  name: SubscriptionPlan;
  displayName: string;
  description: string | null;
  price: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isActive: boolean;
}

interface Subscription {
  plan: Plan | null;
  status: string;
  isActive: boolean;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
}

interface Usage {
  bookings: number;
  invoices: number;
  customers: number;
  staff: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch("/api/subscription/current"),
        fetch("/api/subscription/plans"),
      ]);

      const subData = await subRes.json();
      const plansData = await plansRes.json();

      if (subData.success) {
        setSubscription(subData.data.subscription);
        setUsage(subData.data.usage);
      }

      if (plansData.success) {
        setPlans(plansData.data.plans);
      }
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: selectedPlan.name }),
      });

      const data = await res.json();
      if (data.success) {
        setIsUpgradeModalOpen(false);
        setSelectedPlan(null);
        loadData(); // Reload data
      } else {
        alert(data.error || "Failed to upgrade");
      }
    } catch (error) {
      alert("Failed to upgrade subscription");
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit >= 999999) return 0; // Unlimited
    return Math.min(100, (current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const currentPlan = subscription?.plan;
  const currentPlanConfig = plans.find((p) => p.name === currentPlan?.name);

  if (loading) {
    return (
      <RoleGuard roles={[CTSSRole.OWNER]}>
        <MainLayout>
          <div className="text-center py-12">⏳ Đang tải...</div>
        </MainLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard roles={[CTSSRole.OWNER]}>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Gói Dịch vụ</h1>

          {/* Current Subscription */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Gói hiện tại</h2>
              {!subscription?.isActive && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Không hoạt động
                </span>
              )}
            </div>

            {currentPlan ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{currentPlan.displayName}</h3>
                    <p className="text-gray-600">
                      {currentPlan.price === 0
                        ? "Miễn phí"
                        : `${currentPlan.price.toLocaleString("vi-VN")}₫/tháng`}
                    </p>
                  </div>
                </div>

                {subscription?.trialEndsAt && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Thời gian dùng thử:</strong>{" "}
                      {new Date(subscription.trialEndsAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}

                {subscription?.currentPeriodEndsAt && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Gia hạn đến:</strong>{" "}
                      {new Date(subscription.currentPeriodEndsAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có gói dịch vụ</p>
            )}
          </div>

          {/* Usage & Limits */}
          {currentPlanConfig && usage && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Sử dụng & Giới hạn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staff */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Nhân viên</span>
                    <span className="text-sm text-gray-600">
                      {usage.staff} /{" "}
                      {currentPlanConfig.limits.staff >= 999999
                        ? "Không giới hạn"
                        : currentPlanConfig.limits.staff}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.staff, currentPlanConfig.limits.staff)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(
                          usage.staff,
                          currentPlanConfig.limits.staff
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Lịch hẹn (tháng này)</span>
                    <span className="text-sm text-gray-600">
                      {usage.bookings} /{" "}
                      {currentPlanConfig.limits.bookings >= 999999
                        ? "Không giới hạn"
                        : currentPlanConfig.limits.bookings}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.bookings, currentPlanConfig.limits.bookings)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(
                          usage.bookings,
                          currentPlanConfig.limits.bookings
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Customers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Khách hàng</span>
                    <span className="text-sm text-gray-600">
                      {usage.customers} /{" "}
                      {currentPlanConfig.limits.customers >= 999999
                        ? "Không giới hạn"
                        : currentPlanConfig.limits.customers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.customers, currentPlanConfig.limits.customers)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(
                          usage.customers,
                          currentPlanConfig.limits.customers
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Invoices */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Hóa đơn (tháng này)</span>
                    <span className="text-sm text-gray-600">
                      {usage.invoices} /{" "}
                      {currentPlanConfig.limits.invoices >= 999999
                        ? "Không giới hạn"
                        : currentPlanConfig.limits.invoices}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(
                        getUsagePercentage(usage.invoices, currentPlanConfig.limits.invoices)
                      )}`}
                      style={{
                        width: `${getUsagePercentage(
                          usage.invoices,
                          currentPlanConfig.limits.invoices
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Plans */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Các gói dịch vụ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.name === currentPlan?.name;
                const features = plan.features as Record<string, boolean>;
                const featureList = Object.entries(features)
                  .filter(([_, enabled]) => enabled)
                  .map(([key]) => key);

                return (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-lg p-6 ${
                      isCurrent
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold">{plan.displayName}</h3>
                      <p className="text-3xl font-bold mt-2">
                        {plan.price === 0
                          ? "Miễn phí"
                          : `${plan.price.toLocaleString("vi-VN")}₫`}
                        {plan.price > 0 && <span className="text-sm font-normal">/tháng</span>}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {featureList.slice(0, 5).map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <Check size={16} className="text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant={isCurrent ? "outline" : "primary"}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsUpgradeModalOpen(true);
                      }}
                      disabled={isCurrent}
                      className="w-full"
                    >
                      {isCurrent ? "Gói hiện tại" : "Nâng cấp"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upgrade Modal */}
          <Modal
            isOpen={isUpgradeModalOpen}
            onClose={() => {
              setIsUpgradeModalOpen(false);
              setSelectedPlan(null);
            }}
            title="Nâng cấp gói dịch vụ"
            size="md"
            footer={
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUpgradeModalOpen(false);
                    setSelectedPlan(null);
                  }}
                >
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleUpgrade}>
                  Xác nhận nâng cấp
                </Button>
              </div>
            }
          >
            {selectedPlan && (
              <div className="space-y-4">
                <p>
                  Bạn có chắc muốn nâng cấp lên gói <strong>{selectedPlan.displayName}</strong>?
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Giá:</strong>{" "}
                    {selectedPlan.price === 0
                      ? "Miễn phí"
                      : `${selectedPlan.price.toLocaleString("vi-VN")}₫/tháng`}
                  </p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

