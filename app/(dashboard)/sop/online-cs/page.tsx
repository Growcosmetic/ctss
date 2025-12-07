"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OnlineCSPage() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("all");

  useEffect(() => {
    loadScripts();
  }, [platform]);

  const loadScripts = async () => {
    try {
      const res = await fetch(`/api/online-cs/scripts?platform=${platform}`);
      const data = await res.json();
      if (data.success) {
        setScripts(data.scripts || []);
      }
    } catch (err) {
      console.error("Load scripts error:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">💬 SOP CSKH Online</h1>
        <p className="text-gray-600">
          Scripts nhắn tin và quy trình CSKH Online (Zalo, Instagram, Facebook)
        </p>
      </div>

      <Card className="p-4 border">
        <div className="flex gap-4">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            Platform:
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Tất cả</option>
            <option value="zalo">Zalo</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scripts.map((script) => (
          <Card
            key={script.id}
            className="p-4 border cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedScript(script)}
          >
            <div className="font-semibold text-gray-900 mb-2">
              {script.situation}
            </div>
            <div className="text-xs text-gray-500">
              Platform: {script.platform}
            </div>
          </Card>
        ))}
      </div>

      {selectedScript && (
        <Card className="p-6 border bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{selectedScript.situation}</h2>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(selectedScript.script);
                alert("Đã copy script!");
              }}
              className="text-sm"
            >
              📋 Copy Script
            </Button>
          </div>
          <div className="whitespace-pre-line text-sm bg-white p-4 rounded-lg border">
            {selectedScript.script}
          </div>
        </Card>
      )}
    </div>
  );
}

