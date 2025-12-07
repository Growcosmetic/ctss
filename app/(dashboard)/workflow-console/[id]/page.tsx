import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default async function WorkflowDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await prisma.workflowRun.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Không tìm thấy workflow.</p>
          <Link
            href="/workflow-console"
            className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const getWorkflowTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "stylist-coach": "Stylist Coach",
      "booking-optimizer": "Booking Optimizer",
      "sop-assistant": "SOP Assistant",
      "customer-insight": "Customer Insight",
    };
    return labels[type] || type;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔍 Chi tiết Workflow</h1>
        <Link
          href="/workflow-console"
          className="text-indigo-600 hover:text-indigo-700 text-sm"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <Card className="p-6 shadow-sm border">
        <div className="space-y-6">
          {/* HEADER */}
          <div className="border-b border-gray-200 pb-4">
            <div className="font-semibold text-xl mb-2">
              Loại: {getWorkflowTypeLabel(item.type)}
            </div>
            <div className="text-sm text-gray-600">
              Ngày chạy: {new Date(item.createdAt).toLocaleString("vi-VN")}
            </div>
            <div className="text-xs text-gray-500 mt-1">ID: {item.id}</div>
          </div>

          {/* INPUT */}
          <div>
            <h2 className="font-semibold mb-2 text-lg">📥 Input</h2>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto border max-h-96">
              {JSON.stringify(item.input, null, 2)}
            </pre>
          </div>

          {/* OUTPUT */}
          <div>
            <h2 className="font-semibold mb-2 text-lg">📤 Output</h2>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto border max-h-96">
              {JSON.stringify(item.output, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}

