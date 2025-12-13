# POS UI Improvements Plan - Phase 3

## 📋 Plan (Kế hoạch thực thi)

### 1. Phân tích giao diện POS hiện tại
- Xem lại layout và các nút hành động hiện có
- Xác định các vấn đề UX
- Xác định các nút cần cải thiện

### 2. Thiết kế lại khu vực nút hành động
- **Khu vực 1: Xử lý đơn hàng**
  - Nút "Hủy" (màu trung tính - gray)
  - Nút "Áp dụng giảm giá/Voucher" (màu secondary - blue)
  - Nút "Thêm ghi chú" (màu secondary - blue)
  
- **Khu vực 2: Hoàn tất giao dịch**
  - Nút "In hóa đơn" (màu info - indigo)
  - Nút "Thanh toán" (màu primary - green, nổi bật nhất)

### 3. Cải thiện UX
- Thêm tooltip cho các nút
- Confirmation modal cho nút "Hủy"
- Loading states cho "Thanh toán" và "In hóa đơn"
- Disable "Thanh toán" khi giỏ hàng rỗng hoặc có lỗi
- Hiển thị trạng thái rõ ràng

### 4. Responsive Design
- Desktop: Các nút theo hàng ngang, chia 2 khu vực
- Mobile: Grid 2 cột hoặc stack vertical
- Tablet: Layout linh hoạt

### 5. Role-based Access
- Check role trước khi hiển thị nút "Thanh toán" và "In hóa đơn"
- Chỉ ADMIN, MANAGER, RECEPTIONIST có thể thanh toán

---

## 📁 Files Changed

### Frontend
1. `app/pos/page.tsx` - Refactor layout và action buttons
2. `components/pos/CancelOrderModal.tsx` (NEW) - Confirmation modal cho hủy đơn
3. `components/pos/DiscountModal.tsx` (NEW) - Modal để áp dụng giảm giá/voucher
4. `components/pos/NoteModal.tsx` (NEW) - Modal để thêm ghi chú

---

## 🔧 Patch (Code Changes)

### 1. Refactor Action Buttons Area

**File: `app/pos/page.tsx`**
```typescript
// Thêm states
const [showCancelModal, setShowCancelModal] = useState(false);
const [showDiscountModal, setShowDiscountModal] = useState(false);
const [showNoteModal, setShowNoteModal] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);
const [orderNote, setOrderNote] = useState("");

// Action Buttons Layout
<div className="space-y-4">
  {/* Khu vực 1: Xử lý đơn hàng */}
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Xử lý đơn hàng</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Hủy */}
      <button
        onClick={() => setShowCancelModal(true)}
        className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
        title="Hủy đơn hàng hiện tại"
      >
        <X size={20} />
        Hủy
      </button>
      
      {/* Áp dụng giảm giá */}
      <button
        onClick={() => setShowDiscountModal(true)}
        className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center justify-center gap-2"
        title="Áp dụng giảm giá hoặc voucher"
      >
        <Tag size={20} />
        Giảm giá/Voucher
      </button>
      
      {/* Thêm ghi chú */}
      <button
        onClick={() => setShowNoteModal(true)}
        className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center justify-center gap-2"
        title="Thêm ghi chú cho đơn hàng"
      >
        <FileText size={20} />
        Ghi chú
      </button>
    </div>
  </div>

  {/* Khu vực 2: Hoàn tất giao dịch */}
  <div className="bg-green-50 p-4 rounded-lg">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Hoàn tất giao dịch</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* In hóa đơn */}
      <button
        onClick={handlePrintInvoice}
        disabled={cart.length === 0 || isProcessing}
        className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="In hóa đơn"
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Printer size={20} />
            In hóa đơn
          </>
        )}
      </button>
      
      {/* Thanh toán */}
      <button
        onClick={handleCheckout}
        disabled={cart.length === 0 || isProcessing || !paymentMethod}
        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        title="Thanh toán đơn hàng"
      >
        {isProcessing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Thanh toán
          </>
        )}
      </button>
    </div>
  </div>
</div>
```

### 2. Cancel Confirmation Modal

**File: `components/pos/CancelOrderModal.tsx` (NEW)**
```typescript
interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
}: CancelOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Xác nhận hủy đơn hàng</h2>
        <p className="text-gray-600 mb-6">
          Bạn có chắc muốn hủy đơn hàng này? Đơn hàng có {itemCount} sản phẩm/dịch vụ sẽ bị xóa.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Không
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Discount Modal

**File: `components/pos/DiscountModal.tsx` (NEW)**
```typescript
interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (discount: number, voucherCode?: string) => void;
  currentDiscount: number;
}

export default function DiscountModal({
  isOpen,
  onClose,
  onApply,
  currentDiscount,
}: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState("");
  const [voucherCode, setVoucherCode] = useState("");

  const handleApply = () => {
    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) return;
    
    onApply(value, voucherCode || undefined);
    onClose();
  };

  // ... UI implementation
}
```

### 4. Note Modal

**File: `components/pos/NoteModal.tsx` (NEW)**
```typescript
interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  currentNote: string;
}

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  currentNote,
}: NoteModalProps) {
  const [note, setNote] = useState(currentNote);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  // ... UI implementation
}
```

---

## ✅ Manual Test Checklist

### Layout & Design
- [ ] Các nút được chia thành 2 khu vực rõ ràng
- [ ] Màu sắc phân biệt đúng (Hủy: gray, Thanh toán: green)
- [ ] Kích thước và khoảng cách đồng đều
- [ ] Responsive trên desktop, tablet, mobile

### Functionality
- [ ] Nút "Hủy" hiển thị confirmation modal
- [ ] Nút "Giảm giá/Voucher" mở discount modal
- [ ] Nút "Ghi chú" mở note modal
- [ ] Nút "In hóa đơn" hoạt động đúng
- [ ] Nút "Thanh toán" hoạt động đúng

### UX Improvements
- [ ] Tooltip hiển thị khi hover
- [ ] Loading state khi xử lý
- [ ] Disable "Thanh toán" khi giỏ hàng rỗng
- [ ] Disable "Thanh toán" khi chưa chọn payment method
- [ ] Error messages rõ ràng

### Role-based
- [ ] Chỉ ADMIN, MANAGER, RECEPTIONIST thấy nút "Thanh toán"
- [ ] Nhân viên khác không thể thanh toán

---

## 🎯 Kết quả mong muốn

✅ **Layout**: 2 khu vực rõ ràng, dễ phân biệt
✅ **UX**: Tooltip, confirmation, loading states
✅ **Responsive**: Hoạt động tốt trên mọi device
✅ **Role-based**: Phân quyền đúng

