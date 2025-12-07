"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function VisitDetailModal({
  visit,
  onClose,
}: {
  visit: any;
  onClose: () => void;
}) {
  const technical = visit.technical || {};
  const productsUsed = visit.productsUsed || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold">📋 Chi tiết Dịch vụ</h2>
            <Button onClick={onClose} variant="outline">
              ✕ Đóng
            </Button>
          </div>

          {/* Service Info */}
          <div>
            <h3 className="text-xl font-semibold mb-2">{visit.service}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                📅 Ngày: {new Date(visit.date).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              {visit.stylist && (
                <div>💇 Stylist: {visit.stylist}</div>
              )}
              {visit.assistant && (
                <div>🧪 Assistant: {visit.assistant}</div>
              )}
              {visit.rating && (
                <div className="flex items-center gap-2">
                  ⭐ Đánh giá:{" "}
                  <span className="font-semibold text-yellow-600">
                    {visit.rating}/5
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details */}
          {technical && Object.keys(technical).length > 0 && (
            <Card className="p-4 border bg-blue-50">
              <h4 className="font-semibold text-blue-700 mb-3">
                🔬 Chi tiết Kỹ thuật
              </h4>

              {/* Hair Condition */}
              {technical.hairCondition && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">
                    Tình trạng tóc:
                  </div>
                  <div className="text-sm space-y-1 pl-4">
                    {technical.hairCondition.elasticity && (
                      <div>
                        • Độ đàn hồi: {technical.hairCondition.elasticity}
                      </div>
                    )}
                    {technical.hairCondition.porosity && (
                      <div>
                        • Độ xốp: {technical.hairCondition.porosity}
                      </div>
                    )}
                    {technical.hairCondition.breakageRisk && (
                      <div>
                        • Rủi ro đứt gãy:{" "}
                        <span
                          className={
                            technical.hairCondition.breakageRisk === "HIGH"
                              ? "text-red-600 font-semibold"
                              : technical.hairCondition.breakageRisk === "MEDIUM"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                        >
                          {technical.hairCondition.breakageRisk}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technique Used */}
              {technical.techniqueUsed && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">
                    Kỹ thuật sử dụng:
                  </div>
                  <div className="text-sm pl-4">
                    {technical.techniqueUsed}
                  </div>
                </div>
              )}

              {/* Process */}
              {technical.process && (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Quy trình:</div>
                  <div className="text-sm space-y-1 pl-4">
                    {Object.entries(technical.process).map(([key, value]) => (
                      <div key={key}>
                        • {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {technical.warnings && Array.isArray(technical.warnings) && technical.warnings.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-red-700 mb-1">
                    ⚠️ Cảnh báo:
                  </div>
                  <ul className="text-sm space-y-1 pl-4 list-disc">
                    {technical.warnings.map((w: string, i: number) => (
                      <li key={i} className="text-red-700">{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Summary */}
              {technical.aiSummary && (
                <div>
                  <div className="text-sm font-medium mb-1">
                    🤖 Tóm tắt từ AI:
                  </div>
                  <div className="text-sm pl-4 p-3 bg-white rounded border">
                    {technical.aiSummary}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Products Used */}
          {Array.isArray(productsUsed) && productsUsed.length > 0 && (
            <Card className="p-4 border bg-green-50">
              <h4 className="font-semibold text-green-700 mb-3">
                🧴 Sản phẩm đã dùng
              </h4>
              <div className="space-y-2">
                {productsUsed.map((p: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div>
                      <div className="font-medium">{p.product || p.name}</div>
                      <div className="text-xs text-gray-600">
                        {p.gram}g × {p.unitPrice?.toLocaleString("vi-VN") || 0}
                        ₫
                      </div>
                    </div>
                    <div className="font-semibold text-green-700">
                      {p.total?.toLocaleString("vi-VN") || 0}₫
                    </div>
                  </div>
                ))}
                {visit.totalCharge && (
                  <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                    <div>Tổng chi phí:</div>
                    <div className="text-green-700">
                      {visit.totalCharge.toLocaleString("vi-VN")}₫
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Photos */}
          {(visit.photosBefore?.length > 0 ||
            visit.photosAfter?.length > 0) && (
            <div>
              <h4 className="font-semibold mb-3">📷 Hình ảnh</h4>
              <div className="grid grid-cols-2 gap-4">
                {visit.photosBefore?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Before
                    </div>
                    <div className="space-y-2">
                      {visit.photosBefore.map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Before ${i + 1}`}
                          className="w-full rounded-lg border object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {visit.photosAfter?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      After
                    </div>
                    <div className="space-y-2">
                      {visit.photosAfter.map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt={`After ${i + 1}`}
                          className="w-full rounded-lg border object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {visit.notes && (
            <Card className="p-4 border bg-gray-50">
              <h4 className="font-semibold mb-2">📝 Ghi chú</h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {visit.notes}
              </div>
            </Card>
          )}

          {/* Follow-up Notes */}
          {visit.followUpNotes && (
            <Card className="p-4 border bg-blue-50">
              <h4 className="font-semibold text-blue-700 mb-2">
                📞 Follow-up
              </h4>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {visit.followUpNotes}
              </div>
            </Card>
          )}

          {/* Tags */}
          {visit.tags && visit.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">🏷️ Tags</h4>
              <div className="flex gap-2 flex-wrap">
                {visit.tags.map((tag: string, i: number) => {
                  const tagColors: Record<string, string> = {
                    VIP: "bg-purple-100 text-purple-700 border-purple-200",
                    Risky: "bg-red-100 text-red-700 border-red-200",
                    Overdue: "bg-orange-100 text-orange-700 border-orange-200",
                    Loyal: "bg-green-100 text-green-700 border-green-200",
                    Premium: "bg-blue-100 text-blue-700 border-blue-200",
                  };
                  return (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        tagColors[tag] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

