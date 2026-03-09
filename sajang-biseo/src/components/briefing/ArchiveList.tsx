"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";
import { parseDate, formatDateShort } from "@/lib/utils/date";
import type { WeeklyBriefing } from "@/lib/supabase/types";

interface ArchiveListProps {
  archives: WeeklyBriefing[];
  onSelect: (weekStart: string) => void;
}

export function ArchiveList({ archives, onSelect }: ArchiveListProps) {
  if (archives.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Calendar size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-body-small text-[var(--text-tertiary)]">
          아직 저장된 브리핑이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {archives.map((archive, i) => {
        const start = parseDate(archive.week_start);
        const end = parseDate(archive.week_end);

        return (
          <motion.button
            key={archive.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(archive.week_start)}
            className="w-full text-left glass-card p-3 press-effect flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <Calendar size={14} className="text-primary-500" />
              </div>
              <div>
                <p className="text-body-small font-medium text-[var(--text-primary)]">
                  {formatDateShort(start)} ~ {formatDateShort(end)}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  {archive.email_sent ? "이메일 발송 완료" : "이메일 미발송"}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
          </motion.button>
        );
      })}
    </div>
  );
}
