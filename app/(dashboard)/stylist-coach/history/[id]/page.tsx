import { prisma } from "@/lib/prisma";
import { StylistCoachPanel } from "@/features/stylistCoach/components/StylistCoachPanel";

export default async function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let item;
  try {
    // @ts-ignore - Model may not be generated yet
    item = await prisma.stylistAnalysis.findUnique({
      where: { id: params.id },
    });
  } catch (error: any) {
    // Return not found if model doesn't exist
    if (error.message?.includes("Property 'stylistAnalysis'")) {
      return <div className="p-6">Không tìm thấy dữ liệu.</div>;
    }
    throw error;
  }

  if (!item) return <div className="p-6">Không tìm thấy dữ liệu.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        📝 Chi tiết phân tích ngày{" "}
        {new Date(item.createdAt).toLocaleString("vi-VN")}
      </h1>

      <StylistCoachPanel data={item.resultJson} />
    </div>
  );
}

