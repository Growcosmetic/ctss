"use client";

import React, { useEffect, useState } from "react";
import { useBranch } from "@/features/branches/hooks/useBranch";
import { getStockLevels, getLowStockAlerts, getStockTransactions } from "../services/inventoryApi";
import { ProductStock, LowStockAlert, StockTransaction } from "../types";
import StockCard from "./StockCard";
import LowStockAlertCard from "./LowStockAlertCard";
import StockTransactionList from "./StockTransactionList";
import { Package, AlertTriangle, Loader2 } from "lucide-react";

export default function InventoryDashboard() {
  const { currentBranch } = useBranch();
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBranch?.id) {
      loadData();
    }
  }, [currentBranch]);

  const loadData = async () => {
    if (!currentBranch?.id) return;

    try {
      setLoading(true);
      const [stocksData, alertsData, transactionsData] = await Promise.all([
        getStockLevels(currentBranch.id),
        getLowStockAlerts(currentBranch.id),
        getStockTransactions(currentBranch.id, 20),
      ]);
      setStocks(stocksData);
      setAlerts(alertsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Quản lý kho
              </h1>
              {currentBranch && (
                <p className="text-sm text-gray-600 mt-1">
                  Chi nhánh: {currentBranch.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </div>
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

