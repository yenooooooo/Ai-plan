"use client";

import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface HeatmapRow {
  date: string;
  closing_save: number;
  receipt_ocr: number;
  review_generate: number;
  order_save: number;
  briefing_view: number;
}

interface HeatmapData {
  heatmap: HeatmapRow[];
  actions: string[];
  dates: string[];
}

const ACTION_LABELS: Record<string, string> = {
  closing_save: "마감",
  receipt_ocr: "영수증",
  review_generate: "리뷰",
  order_save: "발주",
  briefing_view: "브리핑",
};

const ACTION_COLORS: Record<string, string> = {
  closing_save: "#ef4444",
  receipt_ocr: "#3b82f6",
  review_generate: "#8b5cf6",
  order_save: "#22c55e",
  briefing_view: "#f59e0b",
};

export function AdminFeatureHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/heatmap")
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(setData)
      .catch((err) => console.error("Heatmap load failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-center text-[var(--text-tertiary)]">데이터 로드 실패</p>;

  const chartData = data.heatmap.map((row) => ({
    ...row,
    label: row.date.slice(5),
  }));

  const actionKeys = data.actions.length > 0
    ? data.actions.filter((a) => a in ACTION_LABELS)
    : Object.keys(ACTION_LABELS);

  return (
    <div className="space-y-5">
      <section className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-primary-500" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">기능별 사용 히트맵</h3>
        </div>

        {chartData.length === 0 ? (
          <p className="text-body-small text-[var(--text-tertiary)] text-center py-8">데이터가 부족합니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-default)" }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 12,
                  fontSize: 11,
                }}
                labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                formatter={(value: unknown, name: unknown) => [
                  `${value}건`,
                  ACTION_LABELS[String(name)] ?? String(name),
                ]}
                labelFormatter={(label: unknown) => `날짜: ${label}`}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value: string) => ACTION_LABELS[value] ?? value}
              />
              {actionKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={ACTION_COLORS[key] ?? "#6b7280"}
                  radius={key === actionKeys[actionKeys.length - 1] ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* 범례 요약 카드 */}
      <div className="grid grid-cols-5 gap-2">
        {actionKeys.map((key) => {
          const total = chartData.reduce((sum, row) => sum + ((row as unknown as Record<string, number>)[key] ?? 0), 0);
          return (
            <div key={key} className="bg-[var(--bg-tertiary)] rounded-xl p-2.5 text-center space-y-1">
              <div className="w-2 h-2 rounded-full mx-auto" style={{ backgroundColor: ACTION_COLORS[key] }} />
              <p className="text-[11px] font-medium text-[var(--text-primary)]">{ACTION_LABELS[key]}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{total}건</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
