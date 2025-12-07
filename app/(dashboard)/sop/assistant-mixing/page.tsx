"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AssistantMixingPage() {
  const [serviceType, setServiceType] = useState("");
  const [formulas, setFormulas] = useState<any[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [customFormula, setCustomFormula] = useState({
    product: "",
    ratio: "",
    oxygen: "",
    hairCondition: "",
  });
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceType) {
      loadFormulas();
    }
  }, [serviceType]);

  const loadFormulas = async () => {
    try {
      const res = await fetch(
        `/api/assistant/formulas?serviceType=${serviceType}`
      );
      const data = await res.json();
      if (data.success) {
        setFormulas(data.formulas || []);
      }
    } catch (err) {
      console.error("Load formulas error:", err);
    }
  };

  const validateFormula = async () => {
    if (!selectedFormula && !customFormula.product) {
      alert("Vui lòng chọn công thức hoặc nhập công thức tùy chỉnh");
      return;
    }

    setLoading(true);
    try {
      const formula = selectedFormula?.formula || customFormula;

      const res = await fetch("/api/assistant/mixing-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formula,
          serviceType,
          hairCondition: customFormula.hairCondition,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setValidation(data.validation);
      }
    } catch (err) {
      console.error("Validate error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSafetyColor = (safety: string) => {
    if (safety === "SAFE") return "bg-green-100 text-green-700 border-green-200";
    if (safety === "CAUTION") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🧪 AI Hỗ trợ Pha thuốc</h1>
        <p className="text-gray-600">
          Xác thực công thức pha thuốc và cảnh báo rủi ro
        </p>
      </div>

      <Card className="p-6 border space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Loại dịch vụ *
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Chọn loại dịch vụ...</option>
            <option value="uốn nóng">Uốn nóng</option>
            <option value="nhuộm">Nhuộm</option>
            <option value="phục hồi">Phục hồi</option>
          </select>
        </div>

        {serviceType && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Chọn công thức chuẩn (hoặc nhập tùy chỉnh)
              </label>
              <select
                value={selectedFormula?.id || ""}
                onChange={(e) => {
                  const formula = formulas.find((f) => f.id === e.target.value);
                  setSelectedFormula(formula);
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Hoặc nhập công thức tùy chỉnh --</option>
                {formulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFormula && (
              <Card className="p-4 border bg-blue-50">
                <h3 className="font-semibold mb-2">{selectedFormula.name}</h3>
                <div className="text-sm space-y-1">
                  <div>Sản phẩm: {selectedFormula.formula.product}</div>
                  <div>Tỉ lệ: {selectedFormula.formula.ratio}</div>
                  {selectedFormula.formula.oxygen && (
                    <div>Oxy: {selectedFormula.formula.oxygen}</div>
                  )}
                  <div>Thời gian: {selectedFormula.formula.mixingTime}</div>
                </div>
              </Card>
            )}

            {!selectedFormula && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Sản phẩm
                  </label>
                  <Input
                    value={customFormula.product}
                    onChange={(e) =>
                      setCustomFormula({
                        ...customFormula,
                        product: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: Plexis Hot Perm S1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Tỉ lệ pha
                  </label>
                  <Input
                    value={customFormula.ratio}
                    onChange={(e) =>
                      setCustomFormula({
                        ...customFormula,
                        ratio: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: 1:1, 1:1.5, 100%"
                  />
                </div>
                {(serviceType === "nhuộm" || serviceType === "uốn nóng") && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Nồng độ Oxy
                    </label>
                    <Input
                      value={customFormula.oxygen}
                      onChange={(e) =>
                        setCustomFormula({
                          ...customFormula,
                          oxygen: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: 6%, 9%, 12%"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Tình trạng tóc (tùy chọn)
                  </label>
                  <Input
                    value={customFormula.hairCondition}
                    onChange={(e) =>
                      setCustomFormula({
                        ...customFormula,
                        hairCondition: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: Tóc khỏe, tóc trung bình, tóc yếu, đã tẩy..."
                  />
                </div>
              </div>
            )}

            <Button
              onClick={validateFormula}
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? "⏳ Đang kiểm tra..." : "✅ Xác thực công thức"}
            </Button>
          </>
        )}
      </Card>

      {validation && (
        <Card className={`p-6 border ${getSafetyColor(validation.safety)}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {validation.safety === "SAFE"
                ? "✅ An toàn"
                : validation.safety === "CAUTION"
                ? "⚠️ Cần thận trọng"
                : "❌ Không an toàn"}
            </h2>
            <div className="text-sm font-semibold">
              {validation.recommendation}
            </div>
          </div>

          {validation.reason && (
            <div className="mb-4">
              <div className="font-semibold mb-2">Lý do:</div>
              <div className="text-sm">{validation.reason}</div>
            </div>
          )}

          {validation.warnings && validation.warnings.length > 0 && (
            <div className="mb-4">
              <div className="font-semibold mb-2">⚠️ Cảnh báo:</div>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                {validation.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.suggestions && validation.suggestions.length > 0 && (
            <div>
              <div className="font-semibold mb-2">💡 Gợi ý:</div>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                {validation.suggestions.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

