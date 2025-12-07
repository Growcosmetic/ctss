import { CustomerInsightPanel } from "@/features/customer360/components/CustomerInsightPanel";

export default function CustomerInsightPage({
  params,
}: {
  params: { phone: string };
}) {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔮 AI Customer Insight</h1>
      </div>

      <CustomerInsightPanel phone={params.phone} />
    </div>
  );
}

