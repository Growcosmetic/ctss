"use client";

import React from "react";
import { ArrowDown, ArrowUp, RefreshCw, Package } from "lucide-react";
import { StockTransaction } from "../types";
import { format } from "date-fns";

interface StockTransactionListProps {
  transactions: StockTransaction[];
}

export default function StockTransactionList({
  transactions,
}: StockTransactionListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <ArrowDown className="w-4 h-4 text-green-600" />;
      case "OUT":
        return <ArrowUp className="w-4 h-4 text-red-600" />;
      case "ADJUST":
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case "TRANSFER":
        return <Package className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "IN":
        return "text-green-600 bg-green-50";
      case "OUT":
        return "text-red-600 bg-red-50";
      case "ADJUST":
        return "text-blue-600 bg-blue-50";
      case "TRANSFER":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Chưa có giao dịch nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}
                >
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {transaction.product?.name || "Unknown Product"}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${getTransactionColor(transaction.type)}`}
                    >
                      {transaction.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      Số lượng:{" "}
                      <span className="font-medium text-gray-900">
                        {transaction.quantity.toLocaleString("vi-VN")}{" "}
                        {transaction.product?.unit || "pcs"}
                      </span>
                    </div>
                    {transaction.reason && (
                      <div>
                        Lý do: <span className="font-medium">{transaction.reason}</span>
                      </div>
                    )}
                    {transaction.notes && (
                      <div className="text-xs text-gray-500">
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

