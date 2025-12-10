"use client";

import React, { useEffect, useState } from "react";
import { useBranch } from "@/features/branches/hooks/useBranch";
import { getStockLevels, getLowStockAlerts, getStockTransactions } from "../services/inventoryApi";
import { ProductStock, LowStockAlert, StockTransaction } from "../types";
import StockCard from "./StockCard";
import LowStockAlertCard from "./LowStockAlertCard";
import StockTransactionList from "./StockTransactionList";
import { Package, AlertTriangle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InventoryDashboard() {
  const { currentBranch, loading: branchLoading, loadBranches } = useBranch();
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    // Wait for branch to load, then load inventory data
    if (!branchLoading && currentBranch?.id) {
      loadData();
    } else if (!branchLoading && !currentBranch) {
      // If no branch after loading, set loading to false
      setLoading(false);
    }
  }, [currentBranch, branchLoading]);

  const loadData = async () => {
    // Skip loading if branch is mock/default-branch
    if (!currentBranch?.id || currentBranch.id === "default-branch") {
      setLoading(false);
      setStocks([]);
      setAlerts([]);
      setTransactions([]);
      return;
    }

    try {
      setLoading(true);
      const [stocksData, alertsData, transactionsData] = await Promise.all([
        getStockLevels(currentBranch.id).catch(() => []),
        getLowStockAlerts(currentBranch.id).catch(() => []),
        getStockTransactions(currentBranch.id, 20).catch(() => []),
      ]);
      setStocks(stocksData || []);
      setAlerts(alertsData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading inventory data:", error);
      // Set empty arrays on error
      setStocks([]);
      setAlerts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Bạn có chắc muốn tạo dữ liệu mẫu? Điều này sẽ tạo sản phẩm và tồn kho mẫu.")) {
      return;
    }

    try {
      setSeeding(true);
      const response = await fetch("/api/inventory/seed", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.data.message}`);
        // Reload branches to get the real branch, then reload data
        await loadBranches();
        // Wait a bit for branch to update, then reload data
        setTimeout(() => {
          loadData();
        }, 500);
      } else {
        alert(`❌ Lỗi: ${result.error || "Không thể tạo dữ liệu mẫu"}`);
      }
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("❌ Có lỗi xảy ra khi tạo dữ liệu mẫu");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Quản lý kho
            </h1>
            {currentBranch && (
              <p className="text-sm text-gray-600 mt-1">
                Chi nhánh: {currentBranch.name}
                {currentBranch.id === "default-branch" && (
                  <span className="ml-2 text-xs text-gray-400">(Chưa có chi nhánh thật)</span>
                )}
              </p>
            )}
            {!currentBranch && !branchLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Vui lòng chọn chi nhánh để xem kho hàng
              </p>
            )}
          </div>
          <Button
            onClick={handleSeedData}
            disabled={seeding}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            {seeding ? "Đang tạo..." : "Tạo dữ liệu mẫu"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Cảnh báo tồn kho thấp
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <LowStockAlertCard key={alert.productId} alert={alert} />
              ))}
            </div>
          </div>
        )}

        {/* Stock Levels */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tồn kho hiện tại
          </h2>
          {stocks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có sản phẩm nào trong kho</p>
              <p className="text-sm text-gray-400 mt-2">Hãy thêm sản phẩm để bắt đầu quản lý kho</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Giao dịch gần đây
          </h2>
          <StockTransactionList transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

