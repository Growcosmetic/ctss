"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Upload, Download, FileSpreadsheet, Check } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [usePublicFile, setUsePublicFile] = useState(false);
  const [publicFileName, setPublicFileName] = useState("Danh_sach_dich_vu.xlsx");
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile);
        setUploaded(false);
      } else {
        alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
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
      } else {
        alert("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDownloadTemplate = () => {
    // Create Excel template matching the format from the image
    const templateData = [
      {
        "Tên dịch vụ": "CẮT TÓC THIẾT KẾ",
        "Mã dịch vụ": "DV10001",
        "Nhóm dịch vụ": "CẮT TÓC THIẾT KẾ",
        "Mô tả": "",
        "Giá dịch vụ": "150000",
        "Thời gian phục vụ (phút)": "30",
        "Tên tiếng Anh (nếu có)": "",
        "Mô tả bằng Tiếng Anh (nếu có)": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dịch vụ");
    XLSX.writeFile(wb, "mau_du_lieu_dich_vu.xlsx");
  };

  // Helper function to parse price (remove dots, commas, spaces)
  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr.trim() === "") return 0;
    // Remove dots, commas, spaces and non-digit characters except minus
    const cleaned = String(priceStr)
      .replace(/\./g, "")
      .replace(/,/g, "")
      .replace(/\s/g, "")
      .replace(/[^\d-]/g, "");
    return parseInt(cleaned) || 0;
  };

  // Helper function to parse duration
  const parseDuration = (durationStr: string): number => {
    if (!durationStr || durationStr.trim() === "") return 30;
    const cleaned = String(durationStr).replace(/\D/g, "");
    return parseInt(cleaned) || 30;
  };

  const handleImport = async () => {
    if (!usePublicFile && !file) {
      alert("Vui lòng chọn file Excel hoặc chọn file từ thư mục public");
      return;
    }

    setLoading(true);
    try {
      // If using public file, call the import-from-file API
      if (usePublicFile) {
        const response = await fetch("/api/services/import-from-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: publicFileName,
            overwrite,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to import services");
        }

        alert(
          `Nhập thành công: ${result.data.created} dịch vụ mới, ${result.data.updated} dịch vụ cập nhật, ${result.data.skipped} dịch vụ bỏ qua`
        );

        setUploaded(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1500);
        return;
      }

      // Original file upload logic
      if (!file) {
        alert("Vui lòng chọn file Excel");
        setLoading(false);
        return;
      }

      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      let jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: "",
        blankrows: false,
      });

      // If no data, try reading without header
      if (!jsonData || jsonData.length === 0) {
        jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: "",
          blankrows: false,
          header: 1,
        });

        // Convert array format to object format
        if (jsonData.length > 1) {
          const headers = jsonData[0] as any[];
          jsonData = jsonData.slice(1).map((row: any) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              if (header) {
                obj[header] = row[index] || "";
              }
            });
            return obj;
          });
        }
      }

      console.log("Excel data parsed:", jsonData);
      console.log("Total rows:", jsonData.length);
      if (jsonData[0]) {
        console.log("All column names in first row:", Object.keys(jsonData[0]));
      }

      if (!jsonData || jsonData.length === 0) {
        alert("File không có dữ liệu. Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }

      const services: any[] = [];

      for (const row of jsonData as any[]) {
        const service: any = {};

        // Normalize keys to lowercase for comparison
        const rowKeys = Object.keys(row).map((k) => k.toLowerCase());
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            // Try exact match first
            if (
              row[key] !== undefined &&
              row[key] !== null &&
              String(row[key]).trim() !== ""
            ) {
              return String(row[key]).trim();
            }
            // Try case-insensitive match
            const foundKey = rowKeys.find((k) => k === key.toLowerCase());
            if (
              foundKey &&
              row[foundKey] !== undefined &&
              row[foundKey] !== null &&
              String(row[foundKey]).trim() !== ""
            ) {
              return String(row[foundKey]).trim();
            }
          }
          return "";
        };

        // Map Excel columns to service data
        const name = getValue([
          "tên dịch vụ",
          "ten dich vu",
          "name",
          "service name",
          "Tên dịch vụ",
        ]);
        const code = getValue([
          "mã dịch vụ",
          "ma dich vu",
          "code",
          "service code",
          "Mã dịch vụ",
        ]);
        const category = getValue([
          "nhóm dịch vụ",
          "nhom dich vu",
          "category",
          "group",
          "Nhóm dịch vụ",
        ]);
        const description = getValue([
          "mô tả",
          "mo ta",
          "description",
          "Mô tả",
        ]);
        const priceStr = getValue([
          "giá dịch vụ",
          "gia dich vu",
          "price",
          "service price",
          "Giá dịch vụ",
        ]);
        const durationStr = getValue([
          "thời gian phục vụ (phút)",
          "thoi gian phuc vu (phut)",
          "duration",
          "time",
          "Thời gian phục vụ (phút)",
        ]);
        const englishName = getValue([
          "tên tiếng anh (nếu có)",
          "ten tieng anh (neu co)",
          "english name",
          "Tên tiếng Anh (nếu có)",
        ]);
        const englishDescription = getValue([
          "mô tả bằng tiếng anh (nếu có)",
          "mo ta bang tieng anh (neu co)",
          "english description",
          "Mô tả bằng Tiếng Anh (nếu có)",
        ]);

        // Skip if missing required fields
        if (!name || !category) {
          console.log("Skipping row - missing name or category:", {
            name,
            category,
            rowKeys: Object.keys(row),
          });
          continue;
        }

        service.name = name.trim();
        if (code) service.code = code.trim();
        service.category = category.trim();
        if (description) service.description = description.trim();
        service.price = parsePrice(priceStr);
        service.duration = parseDuration(durationStr);
        if (englishName) service.englishName = englishName.trim();
        if (englishDescription) service.englishDescription = englishDescription.trim();
        service.isActive = true;

        services.push(service);
      }

      console.log(`Parsed ${services.length} services from ${jsonData.length} rows`);

      if (services.length === 0) {
        const firstRowKeys = jsonData[0] ? Object.keys(jsonData[0]) : [];
        const firstRowSample = jsonData[0]
          ? JSON.stringify(jsonData[0], null, 2)
          : "{}";
        const errorMsg =
          `Không tìm thấy dữ liệu dịch vụ hợp lệ trong file.\n\n` +
          `Đã đọc ${jsonData.length} dòng từ file.\n\n` +
          `Các cột tìm thấy:\n${firstRowKeys.join(", ")}\n\n` +
          `Vui lòng kiểm tra:\n` +
          `- File có cột "Tên dịch vụ" không?\n` +
          `- File có cột "Nhóm dịch vụ" không?\n` +
          `- Dữ liệu có đầy đủ tên và nhóm dịch vụ không?\n\n` +
          `Dòng đầu tiên:\n${firstRowSample.substring(0, 500)}...\n\n` +
          `Xem Console (F12) để biết thêm chi tiết.`;
        alert(errorMsg);
        setLoading(false);
        return;
      }

      // Send to API
      const response = await fetch("/api/services/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          services,
          overwrite,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to import services");
      }

      alert(
        `Nhập thành công: ${result.data.created} dịch vụ mới, ${result.data.updated} dịch vụ cập nhật, ${result.data.skipped} dịch vụ bỏ qua`
      );

      setUploaded(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("Import error:", error);
      alert(error.message || "Có lỗi xảy ra khi nhập dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setOverwrite(false);
    setUploaded(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nhập dịch vụ từ Excel" size="lg">
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Hướng dẫn nhập dữ liệu:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>File Excel phải có các cột: Tên dịch vụ, Nhóm dịch vụ (bắt buộc)</li>
            <li>Các cột khác: Mã dịch vụ, Mô tả, Giá dịch vụ, Thời gian phục vụ (phút), Tên tiếng Anh, Mô tả bằng Tiếng Anh (tùy chọn)</li>
            <li>Giá dịch vụ có thể nhập số hoặc định dạng có dấu chấm/phẩy (ví dụ: 100.000)</li>
            <li>Nếu dịch vụ đã tồn tại (theo mã hoặc tên), sẽ bỏ qua hoặc cập nhật tùy chọn</li>
          </ul>
        </div>

        {/* Download Template */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-700">
              Chưa có file mẫu? Tải file mẫu để điền dữ liệu
            </p>
          </div>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download size={16} className="mr-2" />
            Tải file mẫu
          </Button>
        </div>

        {/* Import Method Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn phương thức nhập
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMethod"
                checked={!usePublicFile}
                onChange={() => setUsePublicFile(false)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Upload file từ máy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMethod"
                checked={usePublicFile}
                onChange={() => setUsePublicFile(true)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Sử dụng file trong thư mục public</span>
            </label>
          </div>
        </div>

        {/* Public File Selection */}
        {usePublicFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên file trong thư mục public
            </label>
            <Input
              type="text"
              value={publicFileName}
              onChange={(e) => setPublicFileName(e.target.value)}
              placeholder="Danh_sach_dich_vu.xlsx"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              File phải nằm trong thư mục /public của project
            </p>
          </div>
        )}

        {/* File Upload */}
        {!usePublicFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel
            </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex flex-col items-center">
                  <Check className="w-12 h-12 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click để chọn file khác
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Chỉ chấp nhận file .xlsx hoặc .xls
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
        )}

        {/* Overwrite Option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="overwrite"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="overwrite" className="text-sm text-gray-700">
            Cập nhật dịch vụ đã tồn tại (nếu không chọn, sẽ bỏ qua)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={(!usePublicFile && !file) || loading || uploaded}
          >
            {loading ? (
              "Đang nhập..."
            ) : uploaded ? (
              <>
                <Check size={16} className="mr-2" />
                Thành công
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} className="mr-2" />
                Nhập dữ liệu
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
