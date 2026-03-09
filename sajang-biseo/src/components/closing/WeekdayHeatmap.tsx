"use client";

import { motion } from "framer-motion";
import { formatCompact } from "@/lib/utils/format";

interface WeekdayData {
  day: string;
  avg: number;
}

interface WeekdayHeatmapProps {
  data: WeekdayData[];
}

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export function WeekdayHeatmap({ data }: WeekdayHeatmapProps) {
  const maxAvg = Math.max(...data.map((d) => d.avg), 1);

  return (
    <div className="glass-card p-5">
      <h3 className="text-heading-md text-[var(--text-primary)] mb-4">
        요일별 평균 매출
      </h3>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => {
          const found = data.find((d) => d.day === day);
          const avg = found?.avg ?? 0;
          const intensity = maxAvg > 0 ? avg / maxAvg : 0;

          // 강도에 따라 색상 변화
          const bgOpacity = Math.max(0.08, intensity * 0.6);
          const textClass = intensity > 0.7 ? "text-primary-500" : "text-[var(--text-secondary)]";

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-caption text-[var(--text-tertiary)]">{day}</span>
              <div
                className="w-full aspect-square rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `rgba(249, 115, 22, ${bgOpacity})` }}
              >
                <span className={`text-[11px] font-display font-semibold ${textClass}`}>
                  {avg > 0 ? formatCompact(avg) : "-"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
