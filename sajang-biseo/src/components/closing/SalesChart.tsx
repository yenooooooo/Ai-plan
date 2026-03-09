"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils/format";

type ViewMode = "daily" | "weekly" | "monthly";

interface SalesDataPoint {
  label: string;
  sales: number;
  netSales?: number;
  date: string;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  mode?: ViewMode;
  onModeChange?: (mode: ViewMode) => void;
}

const MODE_LABELS: Record<ViewMode, string> = {
  daily: "일별",
  weekly: "주별",
  monthly: "월별",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-caption text-[var(--text-tertiary)] mb-0.5">{label}</p>
      <p className="text-body-small font-display text-[var(--text-primary)]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function SalesChart({ data, mode = "daily", onModeChange }: SalesChartProps) {
  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const minSales = Math.min(...data.map((d) => d.sales));

  return (
    <div className="glass-card p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading-md text-[var(--text-primary)]">매출 추이</h3>
        {onModeChange && (
          <div className="flex h-8 bg-[var(--bg-tertiary)] rounded-lg p-0.5">
            {(Object.keys(MODE_LABELS) as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`px-3 rounded-md text-[12px] font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-primary-500/15 text-primary-500"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 차트 */}
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-[200px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatCompact(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249, 115, 22, 0.05)" }} />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.sales === maxSales
                      ? "#F97316"
                      : entry.sales === minSales && data.length > 2
                      ? "#EF4444"
                      : "#FDBA74"
                  }
                  fillOpacity={entry.sales === maxSales ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
