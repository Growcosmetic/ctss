"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContentLibraryPage() {
  const [filterType, setFilterType] = useState("");
  const [platform, setPlatform] = useState("");
  const [tag, setTag] = useState("");
  const [style, setStyle] = useState("");

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/marketing/library/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: filterType || undefined,
          platform: platform || undefined,
          tag: tag || undefined,
          style: style || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load content");
      }

      setList(data.results || []);
    } catch (err: any) {
      setError(err.message);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, platform, tag, style]);

  useEffect(() => {
    load();
  }, [load]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã copy!");
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa nội dung này?")) return;

    try {
      const res = await fetch(`/api/marketing/library/delete?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        load(); // Reload list
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      post: "📝",
      reels: "🎬",
      calendar_item: "📅",
      remarketing: "🎯",
    };
    return icons[type] || "📄";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📚 Content Library</h1>
        <p className="text-gray-600">
          Kho nội dung marketing - Tái sử dụng và quản lý tất cả content AI tạo ra
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Loại nội dung
            </label>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="post">Post</option>
              <option value="reels">Reels</option>
              <option value="remarketing">Remarketing</option>
              <option value="calendar_item">Calendar Item</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Platform
            </label>
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="zalo">Zalo</option>
              <option value="youtube">YouTube</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tag
            </label>
            <Input
              placeholder="Ví dụ: uốn, nhuộm..."
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Style
            </label>
            <Select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="friendly">Friendly</option>
              <option value="luxury">Luxury</option>
              <option value="professional">Professional</option>
              <option value="viral">Viral</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {!loading && list.length > 0 && (
        <div className="text-sm text-gray-600">
          Tìm thấy <strong>{list.length}</strong> nội dung
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">⏳ Đang tải...</div>
      )}

      {/* Error */}
      {error && (
        <Card className="p-6 border bg-red-50">
          <div className="text-red-600">Lỗi: {error}</div>
          <Button onClick={load} variant="outline" className="mt-2">
            Thử lại
          </Button>
        </Card>
      )}

      {/* List */}
      {!loading && list.length === 0 && !error && (
        <Card className="p-6 border text-center">
          <div className="text-gray-500">
            Không tìm thấy nội dung phù hợp
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {list.map((item: any) => (
          <Card
            key={item.id}
            className="p-6 border rounded-xl bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(item.type)}</span>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {item.type} — {item.platform || "N/A"}
                  </div>
                  <div className="font-semibold text-lg text-gray-900 mt-1">
                    {item.topic || "Không có chủ đề"}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </div>
            </div>

            {/* Content Display */}
            {item.content && (
              <div className="space-y-3 mb-4">
                {item.content.headline && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      📌 Headline:
                    </div>
                    <div className="text-gray-900 font-medium">
                      {item.content.headline}
                    </div>
                  </div>
                )}

                {item.content.content && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      ✍️ Content:
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-line bg-gray-50 p-3 rounded border">
                      {item.content.content}
                    </div>
                  </div>
                )}

                {item.content.script && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      📝 Script:
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-line bg-gray-50 p-3 rounded border">
                      {item.content.script}
                    </div>
                  </div>
                )}

                {item.content.hook && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      🎯 Hook:
                    </div>
                    <div className="text-pink-700 font-medium">
                      {item.content.hook}
                    </div>
                  </div>
                )}

                {item.content.visualGuide && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      🎥 Visual Guide:
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {Array.isArray(item.content.visualGuide) &&
                        item.content.visualGuide.map((v: string, i: number) => (
                          <li key={i}>• {v}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {item.content.hashtags && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      # Hashtags:
                    </div>
                    <div className="text-gray-600 text-sm">
                      {item.content.hashtags}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            {item.cta && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="text-xs font-semibold text-indigo-700 mb-1">
                  🎯 CTA:
                </div>
                <div className="text-indigo-900 font-medium">{item.cta}</div>
              </div>
            )}

            {/* Tags & Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                {item.tags && item.tags.length > 0 && (
                  <>
                    {item.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </>
                )}
                {item.style && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {item.style}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fullContent = JSON.stringify(item.content, null, 2);
                    copyToClipboard(fullContent);
                  }}
                >
                  📋 Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteContent(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  🗑️ Xóa
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

