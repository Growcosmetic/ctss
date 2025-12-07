"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ServiceCostPage() {
  const [serviceId, setServiceId] = useState("");
  const [servicePrice, setServicePrice] = useState(0);
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; productName?: string; unitPrice?: number }>
  >([]);
  const [products, setProducts] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    loadServices();
    loadProducts();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error("Load services error:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/inventory/product/list");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Load products error:", err);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill product name and unit price
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.pricePerUnit || 0;
      }
    }

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateCost = async () => {
    if (!serviceId || items.length === 0) {
      alert("Vui lòng chọn dịch vụ và thêm sản phẩm");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/services/cost/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          servicePrice,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert("Có lỗi: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Calculate cost error:", err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">💰 Service Cost Calculator</h1>
        <p className="text-gray-600">
          Tính chi phí sản phẩm cho từng dịch vụ
        </p>
      </div>

      {/* Service Selection */}
      <Card className="p-6 border">
        <h2 className="text-xl font-semibold mb-4">Chọn dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dịch vụ
            </label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                const service = services.find((s) => s.id === e.target.value);
                if (service) {
                  setServicePrice(service.price);
                }
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Chọn dịch vụ...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.price.toLocaleString("vi-VN")}đ
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá dịch vụ (đ)
            </label>
            <Input
              type="number"
              value={servicePrice}
              onChange={(e) => setServicePrice(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Products */}
      <Card className="p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sản phẩm sử dụng</h2>
          <Button onClick={addItem} variant="outline" size="sm">
            + Thêm sản phẩm
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có sản phẩm. Nhấn "Thêm sản phẩm" để bắt đầu.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              const itemTotal = item.quantity * (item.unitPrice || 0);

              return (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sản phẩm
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, "productId", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Chọn sản phẩm...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng ({product?.unit || ""})
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn giá (đ/{product?.unit || ""})
                      </label>
                      <Input
                        type="number"
                        value={item.unitPrice || 0}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thành tiền
                      </label>
                      <div className="px-3 py-2 border rounded-lg bg-white font-semibold">
                        {itemTotal.toLocaleString("vi-VN")}đ
                      </div>
                      <Button
                        onClick={() => removeItem(index)}
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <Button
          onClick={calculateCost}
          disabled={loading || !serviceId || items.length === 0}
          className="bg-blue-600 text-lg px-8 py-3"
        >
          {loading ? "⏳ Đang tính..." : "💰 Tính chi phí"}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <Card className="p-6 border bg-gradient-to-br from-blue-50 to-green-50">
          <h2 className="text-xl font-semibold mb-4">📊 Kết quả tính toán</h2>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Giá dịch vụ</div>
              <div className="text-2xl font-bold text-blue-600">
                {result.servicePrice?.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Tổng chi phí SP</div>
              <div className="text-2xl font-bold text-red-600">
                {result.totalCost?.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Lợi nhuận</div>
              <div className="text-2xl font-bold text-green-600">
                {result.profit?.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Margin</div>
              <div
                className={`text-2xl font-bold ${
                  result.margin >= 80
                    ? "text-green-600"
                    : result.margin >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {result.margin?.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Chi tiết sản phẩm:</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Sản phẩm</th>
                    <th className="border p-2 text-right">Số lượng</th>
                    <th className="border p-2 text-right">Đơn giá</th>
                    <th className="border p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="border p-2">
                        {item.product.name} ({item.product.unit})
                      </td>
                      <td className="border p-2 text-right">
                        {item.quantity} {item.product.unit}
                      </td>
                      <td className="border p-2 text-right">
                        {item.unitPrice.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="border p-2 text-right font-semibold">
                        {item.totalCost.toLocaleString("vi-VN")}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={3} className="border p-2 text-right">
                      Tổng chi phí:
                    </td>
                    <td className="border p-2 text-right">
                      {result.totalCost?.toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Breakdown Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">
                Tỷ lệ chi phí / doanh thu
              </div>
              <div className="text-xl font-bold">
                {result.breakdown?.costPercentage?.toFixed(2)}%
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">
                Tỷ lệ lợi nhuận
              </div>
              <div className="text-xl font-bold text-green-600">
                {result.breakdown?.profitPercentage?.toFixed(2)}%
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

