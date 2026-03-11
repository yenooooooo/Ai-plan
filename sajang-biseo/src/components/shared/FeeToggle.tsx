"use client";

import { motion } from "framer-motion";
import { useFeeToggle } from "@/stores/useFeeToggle";

export function FeeToggle() {
  const { mode, setMode } = useFeeToggle();

  return (
    <div className="relative flex h-9 w-[140px] sm:w-[180px] rounded-xl bg-[var(--bg-tertiary)] p-0.5">
      {/* 슬라이딩 배경 */}
      <motion.div
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-[10px] ${
          mode === "gross"
            ? "bg-primary-500/15"
            : "bg-success/15"
        }`}
        animate={{
          x: mode === "gross" ? 2 : "calc(100% + 2px)",
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* 총매출 */}
      <button
        onClick={() => setMode("gross")}
        className={`relative z-10 flex-1 flex items-center justify-center gap-1 text-[13px] font-medium transition-colors duration-200 ${
          mode === "gross"
            ? "text-primary-500"
            : "text-[var(--text-tertiary)]"
        }`}
      >
        총매출
      </button>

      {/* 순매출 */}
      <button
        onClick={() => setMode("net")}
        className={`relative z-10 flex-1 flex items-center justify-center gap-1 text-[13px] font-medium transition-colors duration-200 ${
          mode === "net"
            ? "text-success"
            : "text-[var(--text-tertiary)]"
        }`}
      >
        순매출
      </button>
    </div>
  );
}
