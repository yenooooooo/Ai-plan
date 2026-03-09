"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface UsageChartDataPoint {
  label: string;
  usage: number;
  waste: number;
}

interface UsageChartProps {
  data: UsageChartDataPoint[];
  itemName: string;
  unit: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-caption text-[var(--text-tertiary)] mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-caption font-display" style={{ color: p.color }}>
          {p.name === "usage" ? "사용" : "폐기"}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function UsageChart({ data, itemName, unit }: UsageChartProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-heading-md text-[var(--text-primary)] mb-1">
        {itemName} 사용량 추이
      </h3>
      <p className="text-caption text-[var(--text-tertiary)] mb-3">단위: {unit}</p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[200px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ fill: "#F97316", r: 3 }}
              name="usage"
            />
            <Line
              type="monotone"
              dataKey="waste"
              stroke="#EF4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={{ fill: "#EF4444", r: 2 }}
              name="waste"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
