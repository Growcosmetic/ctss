"use client";

import React, { useState } from "react";
import { ProductStock } from "../types";
import { MoreVertical, History, Box, Scale, DollarSign, Settings } from "lucide-react";
import StockHistoryModal from "./StockHistoryModal";
import BalanceStockModal from "./BalanceStockModal";
import EditPriceModal from "./EditPriceModal";
import EditStockLevelsModal from "./EditStockLevelsModal";

interface StockActionMenuProps {
  stock: ProductStock;
  onRefresh?: () => void;
}

export default function StockActionMenu({ stock, onRefresh }: StockActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showEditPrice, setShowEditPrice] = useState(false);
  const [showEditLevels, setShowEditLevels] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowHistory(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Lịch sử nhập xuất
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implement batches/lots
                    setIsOpen(false);
                    alert("Tính năng Các lô hàng đang được phát triển");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  Các lô hàng
                </button>
                
                <button
                  onClick={() => {
                    setShowBalance(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Scale className="w-4 h-4" />
                  Cân bằng kho
                </button>
                
                <button
                  onClick={() => {
                    setShowEditPrice(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Sửa giá TB
                </button>
                
                <button
                  onClick={() => {
                    setShowEditLevels(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Sửa hạn mức SL
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showHistory && (
        <StockHistoryModal
          stock={stock}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showBalance && (
        <BalanceStockModal
          stock={stock}
          isOpen={showBalance}
          onClose={() => setShowBalance(false)}
          onSuccess={() => {
            onRefresh?.();
            setShowBalance(false);
          }}
        />
      )}

      {showEditPrice && (
        <EditPriceModal
          stock={stock}
          isOpen={showEditPrice}
          onClose={() => setShowEditPrice(false)}
          onSuccess={() => {
            onRefresh?.();
            setShowEditPrice(false);
          }}
        />
      )}

      {showEditLevels && (
        <EditStockLevelsModal
          stock={stock}
          isOpen={showEditLevels}
          onClose={() => setShowEditLevels(false)}
          onSuccess={() => {
            onRefresh?.();
            setShowEditLevels(false);
          }}
        />
      )}
    </>
  );
}
