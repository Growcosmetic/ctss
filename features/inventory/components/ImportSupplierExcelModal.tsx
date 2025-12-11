"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Upload, Download, FileSpreadsheet, Check, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportSupplierExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportSupplierExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportSupplierExcelModalProps) {
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
    const templateData = [
      {
        "Mã nhà cung cấp": "NCC001",
        "Tên nhà cung cấp": "Công ty TNHH ABC",
        "Người liên hệ": "Nguyễn Văn A",
        "Số điện thoại": "0901234567",
        "Email": "contact@abc.com",
        "Địa chỉ": "123 Đường XYZ",
        "Thành phố": "Hà Nội",
        "Tỉnh/Thành phố": "Hà Nội",
        "Mã số thuế": "0123456789",
        "Website": "https://abc.com",
        "Điều khoản thanh toán": "Net 30",
        "Ghi chú": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DANH SÁCH NHÀ CUNG CẤP");
    XLSX.writeFile(wb, "mau_du_lieu_nha_cung_cap.xlsx");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file Excel");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fileData = await file.arrayBuffer();
      const workbook = XLSX.read(fileData, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[];

      if (jsonData.length < 2) {
        throw new Error("File Excel không có dữ liệu hoặc không đúng format");
      }

      const headers = jsonData[0] as string[];
      
      // Find column indices
      const codeIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("mã") || h?.toLowerCase().includes("code")
      );
      const nameIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("tên") || h?.toLowerCase().includes("name")
      );
      const contactIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("người liên hệ") || h?.toLowerCase().includes("contact")
      );
      const phoneIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("điện thoại") || h?.toLowerCase().includes("phone")
      );
      const emailIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("email")
      );
      const addressIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("địa chỉ") || h?.toLowerCase().includes("address")
      );
      const cityIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("thành phố") && !h?.toLowerCase().includes("tỉnh")
      );
      const provinceIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("tỉnh") || h?.toLowerCase().includes("province")
      );
      const taxCodeIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("mã số thuế") || h?.toLowerCase().includes("tax")
      );
      const websiteIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("website")
      );
      const paymentTermsIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("điều khoản") || h?.toLowerCase().includes("payment")
      );
      const notesIdx = headers.findIndex((h: string) => 
        h?.toLowerCase().includes("ghi chú") || h?.toLowerCase().includes("note")
      );

      if (nameIdx === -1) {
        throw new Error("File Excel thiếu cột bắt buộc: Tên nhà cung cấp");
      }

      const suppliers = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;

        const name = row[nameIdx]?.toString().trim();
        if (!name) continue;

        const code = row[codeIdx]?.toString().trim() || "";
        const contactName = row[contactIdx]?.toString().trim() || "";
        const phone = row[phoneIdx]?.toString().trim() || "";
        const email = row[emailIdx]?.toString().trim() || "";
        const address = row[addressIdx]?.toString().trim() || "";
        const city = row[cityIdx]?.toString().trim() || "";
        const province = row[provinceIdx]?.toString().trim() || "";
        const taxCode = row[taxCodeIdx]?.toString().trim() || "";
        const website = row[websiteIdx]?.toString().trim() || "";
        const paymentTerms = row[paymentTermsIdx]?.toString().trim() || "";
        const notes = row[notesIdx]?.toString().trim() || "";

        suppliers.push({
          code: code || undefined,
          name,
          contactName: contactName || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          city: city || null,
          province: province || null,
          taxCode: taxCode || null,
          website: website || null,
          paymentTerms: paymentTerms || null,
          notes: notes || null,
        });
      }

      if (suppliers.length === 0) {
        throw new Error("Không có nhà cung cấp hợp lệ nào trong file Excel");
      }

      // Send to API
      const response = await fetch("/api/inventory/suppliers/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ suppliers }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Không thể import nhà cung cấp");
      }

      setUploaded(true);
      alert(`✅ Đã import thành công ${suppliers.length} nhà cung cấp!`);
      onSuccess?.();
      
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
      title="Nhập nhà cung cấp từ Excel"
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
            <li>Cột bắt buộc: Tên nhà cung cấp</li>
            <li>Mã nhà cung cấp: Nếu để trống, hệ thống sẽ tự sinh</li>
            <li>Các cột khác là tùy chọn</li>
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
