"use client";

import { useState } from "react";
import { Info, Download, ExternalLink } from "lucide-react";

interface AppInfoSectionProps {
  onExportData: () => Promise<void>;
}

export function AppInfoSection({ onExportData }: AppInfoSectionProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExportData();
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Info size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">앱 정보</h3>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-body-small text-[var(--text-secondary)]">버전</span>
          <span className="text-body-small font-display text-[var(--text-tertiary)]">1.0.0 MVP</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-body-small text-[var(--text-secondary)]">이용약관</span>
          <button className="flex items-center gap-1 text-body-small text-primary-500 press-effect">
            보기 <ExternalLink size={11} />
          </button>
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full h-10 rounded-xl bg-[var(--bg-tertiary)] text-body-small font-medium text-[var(--text-secondary)]
          flex items-center justify-center gap-2 hover:text-primary-500 transition-colors press-effect
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={15} />
        {exporting ? "내보내는 중..." : "매출 데이터 CSV 내보내기"}
      </button>

      <p className="text-[10px] text-[var(--text-tertiary)] text-center">
        문의: support@sajang-biseo.app
      </p>
    </section>
  );
}
