"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
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
    // Create Excel template matching the format from the image
    const templateData = [
      {
        "code": "CS100767",
        "full name": "Nguyễn Thị Minh",
        "email": "nguyenthiminh@example.com",
        "mobile": "0903028440",
        "facebook_gender": "",
        "gender": "Nữ",
        "zalo": "",
        "card_code dob": "28/3",
        "": "",
        "loyalty_point": "0",
        "tag_name": "FACEBOOK",
        "job": "",
        "organizati": "",
        "tax_code": "",
        "address": "123 Đường ABC",
        "city_name district_na": "TP Hồ Chí Minh Quận 1",
        "country_o": "VN",
        "": "",
        "last_visited": "13/2/25",
        "note": "",
        "location": "Hair Salon Chí 7 Thường",
        "rank": "Thường",
        "refer_sour": "",
        "createdAt": "15/10/21",
        "total_paid_amount": "0"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");
    XLSX.writeFile(wb, "mau_du_lieu_khach_hang.xlsx");
  };

  // Helper function to parse date from DD/MM/YY or DD/MM/YYYY format
  const parseDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === "") return null;
    
    // Handle DD/MM format (birthday without year)
    if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
      const [day, month] = dateStr.split("/");
      // Use current year or a default year
      return `2000-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    
    // Handle DD/MM/YY or DD/MM/YYYY format
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      let [day, month, year] = parts;
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum > 50 ? `19${year}` : `20${year}`;
      }
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    
    return null;
  };

  // Helper function to parse amount (remove dots, handle thousands separator)
  const parseAmount = (amountStr: string): number => {
    if (!amountStr || amountStr.trim() === "") return 0;
    // Remove dots (thousands separator) and convert to number
    const cleaned = amountStr.replace(/\./g, "").replace(/,/g, "");
    return parseInt(cleaned) || 0;
  };

  // Helper function to parse city/district from "TP Hồ Chí Minh Quận 1" format
  const parseCityDistrict = (cityDistrictStr: string): { city?: string; province?: string } => {
    if (!cityDistrictStr || cityDistrictStr.trim() === "") return {};
    
    // Try to split by common patterns
    const parts = cityDistrictStr.split(/\s+/);
    const province = parts[0] || "";
    const city = parts.slice(1).join(" ") || "";
    
    return {
      city: city || undefined,
      province: province || undefined,
    };
  };

  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel");
      return;
    }

    setLoading(true);
    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON - use header: 1 to skip first row if it's header
      // Try with header row first
      let jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        defval: "", // Default value for empty cells
        blankrows: false // Skip blank rows
      });
      
      // If no data, try reading without header (treat first row as data)
      if (!jsonData || jsonData.length === 0) {
        jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,
          defval: "",
          blankrows: false,
          header: 1 // Read as array of arrays
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
      console.log("First row:", jsonData[0]);
      if (jsonData[0]) {
        console.log("All column names in first row:", Object.keys(jsonData[0]));
        console.log("Column values:", Object.entries(jsonData[0]));
      }
      
      if (!jsonData || jsonData.length === 0) {
        alert("File không có dữ liệu. Vui lòng kiểm tra lại.");
        setLoading(false);
        return;
      }

      const customers: any[] = [];

      for (const row of jsonData as any[]) {
        const customer: any = {};

        // Normalize keys to lowercase for comparison
        const rowKeys = Object.keys(row).map(k => k.toLowerCase());
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            // Try exact match first
            if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
              return String(row[key]).trim();
            }
            // Try case-insensitive match
            const foundKey = rowKeys.find(k => k === key.toLowerCase());
            if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== "") {
              return String(row[foundKey]).trim();
            }
          }
          return "";
        };

        // Map Excel columns to customer data - try all possible variations
        // Also try column index if header names don't match
        const fullName = getValue(["full name", "họ và tên", "name", "fullname", "tên", "họ tên", "ho ten", "full_name", "họ và tên", "Họ và tên", "FULL NAME"]) 
          || (row[1] ? String(row[1]).trim() : "") // Try column B (index 1) as fallback
          || "";
        const phone = getValue(["mobile", "số điện thoại", "phone", "sdt", "điện thoại", "dien thoai", "phone number", "Số điện thoại", "Mobile", "MOBILE"]) 
          || (row[3] ? String(row[3]).trim() : "") // Try column D (index 3) as fallback
          || "";
        const email = getValue(["email", "e-mail", "Email", "EMAIL"]) || "";
        const gender = getValue(["gender", "giới tính", "gioi tinh", "sex"]) || "";
        const dob = getValue(["card_code dob", "ngày sinh", "ngay sinh", "dateofbirth", "birthday", "dob", "sinh nhật"]) || "";
        const address = getValue(["address", "địa chỉ", "dia chi"]) || "";
        const cityDistrict = getValue(["city_name district_na", "tỉnh/thành quận/huy", "tinh/thanh quan/huy", "city district", "tỉnh thành"]) || "";
        const country = getValue(["country_o", "quốc gia", "quoc gia", "country"]) || "";
        const loyaltyPoints = getValue(["loyalty_point", "điểm", "diem", "points", "loyalty points"]) || "0";
        const tagName = getValue(["tag_name", "nhóm", "nhom", "tag", "group"]) || "";
        const rank = getValue(["rank", "xếp hạng", "xep hang", "hạng", "hang"]) || "";
        const referSource = getValue(["refer_sour", "nguồn giới thiệu", "nguon gioi thieu", "referral source", "nguồn"]) || "";
        const note = getValue(["note", "ghi chú", "ghi chu", "notes", "mô tả"]) || "";
        const location = getValue(["location", "chi nhánh", "chi nhanh", "branch"]) || "";
        const totalPaid = getValue(["total_paid_amount", "tổng tiền chi tiêu", "tong tien chi tieu", "total paid", "tổng tiền"]) || "0";
        const createdAt = getValue(["createdat", "ngày tạo", "ngay tao", "created at", "created"]) || "";
        const lastVisited = getValue(["last_visited", "lần cuối đến", "lan cuoi den", "last visited", "lần cuối"]) || "";

        // Debug: log row data
        console.log("Processing row:", {
          fullName,
          phone,
          email,
          hasName: !!fullName,
          hasPhone: !!phone,
          rowKeys: Object.keys(row)
        });

        // Skip if missing required fields
        if (!fullName || !phone) {
          console.log("Skipping row - missing name or phone:", { fullName, phone, rowKeys: Object.keys(row) });
          continue;
        }

        // Parse name (handle prefixes like "-", ".")
        let cleanName = fullName.trim();
        if (cleanName.startsWith("-") || cleanName.startsWith(".")) {
          cleanName = cleanName.substring(1).trim();
        }
        
        // Split name into firstName and lastName
        const nameParts = cleanName.split(" ");
        const lastName = nameParts.pop() || "";
        const firstName = nameParts.join(" ") || lastName;

        customer.name = cleanName;
        customer.firstName = firstName;
        customer.lastName = lastName;
        customer.phone = phone.replace(/\D/g, ""); // Remove non-digits
        
        if (email) customer.email = email;
        
        // Parse date of birth
        if (dob) {
          const parsedDob = parseDate(dob);
          if (parsedDob) customer.dateOfBirth = parsedDob;
        }
        
        // Parse gender
        if (gender) {
          customer.gender = gender === "Nam" || gender === "MALE" || gender === "Male" ? "MALE" 
            : gender === "Nữ" || gender === "FEMALE" || gender === "Female" ? "FEMALE" 
            : null;
        }
        
        if (address) customer.address = address;
        
        // Parse city and province
        if (cityDistrict) {
          const { city, province } = parseCityDistrict(cityDistrict);
          if (city) customer.city = city;
          if (province) customer.province = province;
        }
        
        if (country) customer.country = country;
        
        // Parse preferences
        customer.preferences = {};
        if (tagName) customer.preferences.customerGroup = tagName;
        if (rank) customer.preferences.rank = rank;
        if (referSource) customer.preferences.referralSource = referSource;
        if (note) customer.notes = note;
        
        // Parse loyalty points
        customer.loyaltyPoints = parseInt(loyaltyPoints) || 0;
        
        // Parse total paid amount
        customer.totalSpent = parseAmount(totalPaid);
        
        // Use tag_name as group if no group specified
        if (!customerGroup && tagName) {
          customer.preferences.customerGroup = tagName;
        } else if (customerGroup) {
          customer.preferences.customerGroup = customerGroup;
        }

        customers.push(customer);
      }

      console.log(`Parsed ${customers.length} customers from ${jsonData.length} rows`);
      
      if (customers.length === 0) {
        // Show more detailed error message
        const firstRowKeys = jsonData[0] ? Object.keys(jsonData[0]) : [];
        const firstRowSample = jsonData[0] ? JSON.stringify(jsonData[0], null, 2) : "{}";
        const errorMsg = `Không tìm thấy dữ liệu khách hàng hợp lệ trong file.\n\n` +
          `Đã đọc ${jsonData.length} dòng từ file.\n\n` +
          `Các cột tìm thấy:\n${firstRowKeys.join(", ")}\n\n` +
          `Vui lòng kiểm tra:\n` +
          `- File có cột "full name" hoặc "Họ và tên" không?\n` +
          `- File có cột "mobile" hoặc "Số điện thoại" không?\n` +
          `- Dữ liệu có đầy đủ tên và số điện thoại không?\n\n` +
          `Dòng đầu tiên:\n${firstRowSample.substring(0, 500)}...\n\n` +
          `Xem Console (F12) để biết thêm chi tiết.`;
        alert(errorMsg);
        setLoading(false);
        return;
      }

      // Send to API
      const response = await fetch("/api/crm/customers/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customers,
          groupName: customerGroup || undefined,
          overwrite,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to import customers");
      }

      alert(`Nhập thành công: ${result.data.created} khách hàng mới, ${result.data.updated} khách hàng cập nhật, ${result.data.skipped} khách hàng bỏ qua`);
      
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
                <label htmlFor="file-upload" className="cursor-pointer inline-block">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <Upload size={18} className="mr-2" />
                    Chọn tệp dữ liệu khách hàng
                  </span>
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

