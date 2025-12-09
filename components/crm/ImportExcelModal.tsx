"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Upload, Download, FileSpreadsheet, Check } from "lucide-react";

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
  const [customerGroup, setCustomerGroup] = useState("");
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
    // Create a sample Excel template
    const templateData = [
      ["Họ tên", "Số điện thoại", "Email", "Ngày sinh", "Giới tính", "Địa chỉ", "Quận/Huyện", "Tỉnh/Thành phố"],
      ["Nguyễn Văn A", "0901234567", "nguyenvana@example.com", "1990-01-01", "Nam", "123 Đường ABC", "Quận 1", "TP Hồ Chí Minh"],
    ];

    // Convert to CSV for simplicity (in production, use a library like xlsx)
    const csv = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_du_lieu_khach_hang.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual Excel import
      // For now, simulate import
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setUploaded(true);
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Import error:", error);
      alert("Có lỗi xảy ra khi nhập dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCustomerGroup("");
    setOverwrite(false);
    setUploaded(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tải lên và nhập dữ liệu danh sách khách hàng từ tệp"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            <X size={18} className="mr-2" />
            Đóng
          </Button>
          <Button onClick={handleImport} disabled={!file || loading || uploaded}>
            {uploaded ? (
              <>
                <Check size={18} className="mr-2" />
                Đã nhập
              </>
            ) : (
              <>
                <Upload size={18} className="mr-2" />
                {loading ? "Đang nhập..." : "Nhập dữ liệu"}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Download Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-blue-600" size={20} />
            <p className="text-sm text-gray-700">
              Tải tệp dữ liệu mẫu (.xlsx) tại đây.
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download size={16} className="mr-1" />
              Tải mẫu
            </Button>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {file ? (
            <div className="space-y-2">
              <Check className="mx-auto text-green-600" size={48} />
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                className="mt-2"
              >
                Chọn file khác
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto text-gray-400" size={48} />
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Tải lên (Định dạng .xlsx)
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Kéo thả tệp dữ liệu vào đây để tải lên.
                </p>
                <label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button as="span" variant="outline">
                    <Upload size={18} className="mr-2" />
                    Chọn tệp dữ liệu khách hàng
                  </Button>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Customer Group */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhóm khách hàng
          </label>
          <Input
            placeholder="Nhập tên nhóm khách hàng (tùy chọn)"
            value={customerGroup}
            onChange={(e) => setCustomerGroup(e.target.value)}
          />
        </div>

        {/* Overwrite Option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="overwrite"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="overwrite" className="text-sm text-gray-700">
            Sẽ ghi đè dữ liệu mới nhất từ tệp nếu có trùng lặp.
          </label>
        </div>

        {uploaded && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Check size={20} />
              <p className="font-medium">Đã nhập dữ liệu thành công!</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

