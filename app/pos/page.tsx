"use client";

import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Search,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
  Banknote,
  Tag,
  FileText,
  Printer,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import CancelOrderModal from "@/components/pos/CancelOrderModal";
import DiscountModal from "@/components/pos/DiscountModal";
import NoteModal from "@/components/pos/NoteModal";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  image?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  servicePrices: Array<{
    price: number;
  }>;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "product" | "service";
  productId?: string;
  serviceId?: string;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"products" | "services">("products");
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderNote, setOrderNote] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory?limit=100");
      const result = await response.json();
      if (result.success) {
        setProducts(result.data.products.filter((p: Product) => p.stockQuantity > 0));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?limit=100");
      const result = await response.json();
      if (result.success) {
        setServices(result.data.services);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const addToCart = (item: Product | Service, type: "product" | "service") => {
    const existingItem = cart.find(
      (c) =>
        (type === "product" && c.productId === item.id) ||
        (type === "service" && c.serviceId === item.id)
    );

    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.id === existingItem.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      const price =
        type === "product"
          ? (item as Product).price
          : (item as Service).servicePrices[0]?.price || 0;

      setCart([
        ...cart,
        {
          id: `${type}-${item.id}-${Date.now()}`,
          name: item.name,
          price,
          quantity: 1,
          type,
          ...(type === "product" ? { productId: item.id } : { serviceId: item.id }),
        },
      ]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalDiscount = discount || 0;
  const tax = 0; // Can be calculated
  const total = subtotal - finalDiscount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/pos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            serviceId: item.serviceId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: 0,
          })),
          discount: finalDiscount,
          tax,
          paymentMethod,
          notes: orderNote || null,
          createdById: user?.id || "system",
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Thanh toán thành công!");
        setCart([]);
        setDiscount(0);
        setOrderNote("");
        await fetchProducts(); // Refresh products
      } else {
        alert(result.error || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Failed to checkout:", error);
      alert("Thanh toán thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = () => {
    setCart([]);
    setDiscount(0);
    setOrderNote("");
    setCustomerSearch("");
    setPaymentMethod("CASH");
  };

  const handlePrintInvoice = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    // TODO: Implement print invoice functionality
    window.print();
  };

  const handleApplyDiscount = (discountAmount: number, voucherCode?: string) => {
    setDiscount(discountAmount);
    if (voucherCode) {
      // TODO: Validate voucher code
      console.log("Voucher code:", voucherCode);
    }
  };

  const handleSaveNote = (note: string) => {
    setOrderNote(note);
  };

  // Check if user can process payment
  const canProcessPayment = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "RECEPTIONIST";

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RoleGuard roles={[CTSSRole.ADMIN, CTSSRole.MANAGER, CTSSRole.RECEPTIONIST]}>
      <MainLayout>
        <h1 className="sr-only">Thu ngân</h1>
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS</h1>
          <p className="text-gray-500 mt-1">Hệ thống bán hàng tại quầy</p>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Products & Services */}
          <div className="lg:col-span-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedCategory("products")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === "products"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Sản phẩm
                </button>
                <button
                  onClick={() => setSelectedCategory("services")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === "services"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Dịch vụ
                </button>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="h-[600px] overflow-y-auto">
                {selectedCategory === "products" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product, "product")}
                        className="p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-left"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <p className="font-medium text-sm mb-1">{product.name}</p>
                        <p className="text-primary-600 font-semibold">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tồn: {product.stockQuantity}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => addToCart(service, "service")}
                        className="w-full p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-500">
                              {service.duration} phút
                            </p>
                          </div>
                          <p className="text-primary-600 font-semibold">
                            {formatCurrency(service.servicePrices[0]?.price || 0)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Column 2: Cart */}
          <div className="lg:col-span-4">
            <Card title="Giỏ hàng" className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-primary-600 font-semibold">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-semibold text-blue-700">-{formatCurrency(discount)}</span>
                  </div>
                )}
                {orderNote && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Ghi chú:</span> {orderNote}
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 3: Checkout */}
          <div className="lg:col-span-3">
            <Card title="Thanh toán" className="h-full flex flex-col">
              <div className="flex-1 space-y-4">
                {/* Customer Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khách hàng (tùy chọn)
                  </label>
                  <Input
                    placeholder="Tìm khách hàng..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        paymentMethod === "CASH"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Banknote size={24} />
                      <span className="text-sm font-medium">Tiền mặt</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("CARD")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        paymentMethod === "CARD"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard size={24} />
                      <span className="text-sm font-medium">Thẻ</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("TRANSFER")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        paymentMethod === "TRANSFER"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Wallet size={24} />
                      <span className="text-sm font-medium">Chuyển khoản</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("WALLET")}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        paymentMethod === "WALLET"
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Wallet size={24} />
                      <span className="text-sm font-medium">Ví điện tử</span>
                    </button>
                  </div>
                </div>

                {/* Total Display */}
                <div className="p-4 bg-primary-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Tổng thanh toán</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </div>
              </div>

            </Card>
          </div>
        </div>

        {/* Action Buttons Area - Refactored */}
        <div className="space-y-4 mt-6">
          {/* Khu vực 1: Xử lý đơn hàng */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Xử lý đơn hàng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Hủy */}
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="secondary"
                className="flex items-center justify-center gap-2"
                title="Hủy đơn hàng hiện tại"
                aria-label="Hủy đơn hàng"
              >
                <X size={20} />
                Hủy
              </Button>
              
              {/* Áp dụng giảm giá */}
              <Button
                onClick={() => setShowDiscountModal(true)}
                variant="outline"
                className="flex items-center justify-center gap-2"
                title="Áp dụng giảm giá hoặc voucher"
                aria-label="Áp dụng giảm giá"
              >
                <Tag size={20} />
                Giảm giá/Voucher
              </Button>
              
              {/* Thêm ghi chú */}
              <Button
                onClick={() => setShowNoteModal(true)}
                variant="outline"
                className="flex items-center justify-center gap-2"
                title="Thêm ghi chú cho đơn hàng"
                aria-label="Thêm ghi chú"
              >
                <FileText size={20} />
                Ghi chú
              </Button>
            </div>
          </div>

          {/* Khu vực 2: Hoàn tất giao dịch */}
          {canProcessPayment && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Hoàn tất giao dịch</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* In hóa đơn */}
                <Button
                  onClick={handlePrintInvoice}
                  disabled={cart.length === 0 || isProcessing}
                  variant="secondary"
                  isLoading={isProcessing}
                  className="flex items-center justify-center gap-2 shadow-md"
                  title="In hóa đơn"
                  aria-label="In hóa đơn"
                >
                  <Printer size={20} />
                  In hóa đơn
                </Button>
                
                {/* Thanh toán */}
                <Button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isProcessing || !paymentMethod}
                  variant="success"
                  isLoading={isProcessing}
                  className="flex items-center justify-center gap-2 shadow-lg"
                  title="Thanh toán đơn hàng"
                  aria-label="Thanh toán"
                >
                  <CreditCard size={20} />
                  Thanh toán
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelOrder}
          itemCount={cart.length}
        />
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          onApply={handleApplyDiscount}
          currentDiscount={discount}
          subtotal={subtotal}
        />
        <NoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onSave={handleSaveNote}
          currentNote={orderNote}
        />
      </div>
      </MainLayout>
    </RoleGuard>
  );
}
