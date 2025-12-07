'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface KPIData {
  revenueToday?: number;
  revenueThisMonth?: number;
  bookingsToday?: number;
  profitMargin?: number;
  avgRating?: number;
  upsaleRate?: number;
}

export default function TestPage() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/control-tower/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }
      const data = await response.json();
      if (data.success) {
        setKpiData(data.data.kpi);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 CTSS Control Tower - Test Dashboard
          </h1>
          <p className="text-gray-600">
            Hệ thống quản lý salon 5.0 - 35 Phase Complete
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">⚠️ Lỗi</h3>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Có thể cần đăng nhập hoặc setup database trước.
            </p>
          </Card>
        )}

        {kpiData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Doanh thu hôm nay</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(kpiData.revenueToday || 0)}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Doanh thu tháng này</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(kpiData.revenueThisMonth || 0)}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Bookings hôm nay</h3>
              <p className="text-3xl font-bold">
                {kpiData.bookingsToday || 0}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Profit Margin</h3>
              <p className="text-3xl font-bold">
                {(kpiData.profitMargin || 0).toFixed(1)}%
              </p>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">📊 Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đánh giá trung bình</span>
                <span className="text-2xl font-bold text-yellow-600">
                  ⭐ {(kpiData?.avgRating || 0).toFixed(2)}/5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tỷ lệ upsale</span>
                <span className="text-2xl font-bold text-green-600">
                  {(kpiData?.upsaleRate || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">🔗 API Endpoints Available</h2>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <code className="text-blue-600">GET /api/control-tower/dashboard</code>
                <p className="text-gray-600 text-xs mt-1">CEO Dashboard</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code className="text-blue-600">GET /api/financial/dashboard</code>
                <p className="text-gray-600 text-xs mt-1">Financial Dashboard</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code className="text-blue-600">GET /api/membership/dashboard</code>
                <p className="text-gray-600 text-xs mt-1">Membership Dashboard</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <code className="text-blue-600">GET /api/pricing/dashboard</code>
                <p className="text-gray-600 text-xs mt-1">Pricing Dashboard</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">✨ 35 Phases Completed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="p-3 bg-green-100 text-green-800 rounded text-center font-semibold"
              >
                Phase {i + 1}
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}

