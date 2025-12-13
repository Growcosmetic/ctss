"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Upload, Download, FileSpreadsheet, Check, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  branchId?: string;
}

export default function ImportExcelModal({
  isOpen,
  onClose,
  onSuccess,
  branchId,
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile);
        setUploaded(false);
        setError("");
      } else {
        setError("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls")) {
        setFile(droppedFile);
        setUploaded(false);
        setError("");
      } else {
        setError("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDownloadTemplate = () => {
    // Create Excel template matching the format from Hình 3
    const templateData = [
      {
        "Tên sản phẩm": "DẦU TRỢ NHUỘM VEROGLA",
        "Mã sản phẩm": "074469442855",
        "Thương hiệu": "Joico",
        "Nhóm sản phẩm": "KỸ THUẬT JOICO",
        "Mô tả": "",
        "Đơn vị tính": "Chai",
        "Dung tích (nếu có)": "1000 ml",
        "Giá nhập": "260000",
        "Giá bán": "190000",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DANH SÁCH SẢN PHẨM");
    XLSX.writeFile(wb, "mau_du_lieu_san_pham.xlsx");
  };

  const parseCapacity = (capacityStr: string): { capacity: number | null; capacityUnit: string | null } => {
    if (!capacityStr || capacityStr.trim() === "") {
      return { capacity: null, capacityUnit: null };
    }

    // Try to parse "1000 ml" or "100 ml" format
    const match = capacityStr.match(/^(\d+(?:\.\d+)?)\s*(ml|l|g|kg|mg|cl|dl)$/i);
    if (match) {
      return {
        capacity: parseFloat(match[1]),
        capacityUnit: match[2].toLowerCase(),
      };
    }

    return { capacity: null, capacityUnit: null };
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file Excel");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Read Excel file
      const fileData = await file.arrayBuffer();
      const workbook = XLSX.read(fileData, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[];

      if (jsonData.length < 2) {
        throw new Error("File Excel không có dữ liệu hoặc không đúng format");
      }

      // Get headers (first row)
      const headers = jsonData[0] as string[];
      
      // Find column indices
      const nameIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("tên sản phẩm") || h?.toLowerCase().includes("ten san pham")
      );
      const skuIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("mã sản phẩm") || h?.toLowerCase().includes("ma san pham")
      );
      const brandIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("thương hiệu") || h?.toLowerCase().includes("thuong hieu")
      );
      const categoryIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("nhóm sản phẩm") || h?.toLowerCase().includes("nhom san pham")
      );
      const descIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("mô tả") || h?.toLowerCase().includes("mo ta")
      );
      const unitIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("đơn vị tính") || h?.toLowerCase().includes("don vi tinh")
      );
      const capacityIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("dung tích") || h?.toLowerCase().includes("dung tich")
      );
      const costPriceIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("giá nhập") || h?.toLowerCase().includes("gia nhap")
      );
      const sellPriceIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("giá bán") || h?.toLowerCase().includes("gia ban")
      );

      if (nameIdx === -1 || categoryIdx === -1 || unitIdx === -1) {
        throw new Error("File Excel thiếu các cột bắt buộc: Tên sản phẩm, Nhóm sản phẩm, Đơn vị tính");
      }

      // Parse data rows
      const products = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;

        const name = row[nameIdx]?.toString().trim();
        if (!name) continue; // Skip empty rows

        const sku = row[skuIdx]?.toString().trim() || "";
        const brand = row[brandIdx]?.toString().trim() || "";
        const category = row[categoryIdx]?.toString().trim();
        const description = row[descIdx]?.toString().trim() || "";
        const unit = row[unitIdx]?.toString().trim();
        const capacityStr = row[capacityIdx]?.toString().trim() || "";
        const costPrice = row[costPriceIdx] ? parseFloat(row[costPriceIdx].toString().replace(/[^\d.]/g, "")) : null;
        const sellPrice = row[sellPriceIdx] ? parseFloat(row[sellPriceIdx].toString().replace(/[^\d.]/g, "")) : null;

        if (!category || !unit) {
          console.warn(`Row ${i + 1}: Thiếu nhóm sản phẩm hoặc đơn vị tính, bỏ qua`);
          continue;
        }

        const { capacity, capacityUnit } = parseCapacity(capacityStr);

        // Build notes field
        let notes = description;
        if (sku) {
          notes = `SKU: ${sku}\n${notes}`.trim();
        }
        if (brand) {
          notes = `Thương hiệu: ${brand}\n${notes}`.trim();
        }

        products.push({
          name,
          sku: sku || undefined,
          category,
          unit,
          capacity,
          capacityUnit,
          pricePerUnit: sellPrice,
          costPrice,
          notes: notes || null,
        });
      }

      if (products.length === 0) {
        throw new Error("Không có sản phẩm hợp lệ nào trong file Excel");
      }

      // Send to API
      const response = await fetch("/api/inventory/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          products,
          branchId: branchId || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể import sản phẩm");
      }

      setUploaded(true);
      alert(`✅ Đã import thành công ${products.length} sản phẩm!`);
      onSuccess?.();
      
      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null);
        setUploaded(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Error importing Excel:", err);
      setError(err.message || "Có lỗi xảy ra khi import Excel");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập từ Excel"
      size="lg"
    >
      <div className="space-y-6">
        {/* Download Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">
                Tải file mẫu Excel
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Tải file mẫu để biết format dữ liệu cần nhập
              </p>
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Tải file mẫu
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn file Excel (.xlsx hoặc .xls)
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="w-8 h-8 text-green-600" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  onClick={() => setFile(null)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Chọn file khác
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Kéo thả file Excel vào đây hoặc
                </p>
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Chọn file
                  </span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Hướng dẫn:</h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Các cột bắt buộc: Tên sản phẩm, Nhóm sản phẩm, Đơn vị tính</li>
            <li>Dung tích: Nhập theo format "100 ml" hoặc "1000 ml"</li>
            <li>Giá: Nhập số nguyên (ví dụ: 190000)</li>
            <li>Mã sản phẩm: Nếu để trống, hệ thống sẽ tự sinh</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || loading || uploaded}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang import...
              </>
            ) : uploaded ? (
              <>
                <Check className="w-4 h-4" />
                Thành công
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
