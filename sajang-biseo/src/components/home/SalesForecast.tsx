"use client";

import { useState } from "react";
import { TrendingUp, Loader2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useStoreSettings } from "@/stores/useStoreSettings";
import { useToast } from "@/stores/useToast";

interface Prediction { date: string; expectedSales: number; confidence: string }
interface ForecastData {
  predictions: Prediction[];
  trend: string;
  insight: string;
  weeklyEstimate: number;
}

export function SalesForecast() {
  const { storeId } = useStoreSettings();
  const toast = useToast((s) => s.show);
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateForecast = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const result = await res.json();
      if (!res.ok) { toast(result.error, "error"); return; }
      setData(result.data);
    } catch { toast("예측 실패", "error"); }
    finally { setLoading(false); }
  };

  const TrendIcon = data?.trend === "상승" ? ArrowUp : data?.trend === "하락" ? ArrowDown : Minus;
  const trendColor = data?.trend === "상승" ? "text-success" : data?.trend === "하락" ? "text-danger" : "text-[var(--text-tertiary)]";

  return (
    <section className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-500" />
          <h3 className="text-body-default font-semibold text-[var(--text-primary)]">AI 매출 예측</h3>
        </div>
        <button onClick={generateForecast} disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-caption font-medium disabled:opacity-50 press-effect">
          {loading ? <Loader2 size={13} className="animate-spin" /> : <TrendingUp size={13} />}
          {loading ? "분석 중..." : data ? "재분석" : "예측 생성"}
        </button>
      </div>

      {!data && !loading && (
        <p className="text-body-small text-[var(--text-tertiary)] text-center py-4">
          최근 매출 데이터 기반으로 7일간 매출을 예측합니다
        </p>
      )}

      {data && (
        <>
          <div className="flex items-center gap-3 py-2">
            <div className="flex items-center gap-1">
              <TrendIcon size={16} className={trendColor} />
              <span className={`text-body-default font-semibold ${trendColor}`}>{data.trend}</span>
            </div>
            <span className="text-caption text-[var(--text-secondary)]">{data.insight}</span>
          </div>

          <div className="bg-[var(--bg-tertiary)] rounded-xl p-3 text-center">
            <p className="text-caption text-[var(--text-tertiary)]">예상 주간 매출</p>
            <p className="text-heading-lg font-display text-[var(--text-primary)]">
              {data.weeklyEstimate.toLocaleString()}원
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {data.predictions.map((p) => {
              const day = new Date(p.date).toLocaleDateString("ko", { weekday: "short" });
              const confColor = p.confidence === "high" ? "bg-success" : p.confidence === "medium" ? "bg-warning" : "bg-[var(--text-tertiary)]";
              return (
                <div key={p.date} className="text-center space-y-1">
                  <p className="text-[10px] text-[var(--text-tertiary)]">{day}</p>
                  <p className="text-[11px] font-medium text-[var(--text-primary)]">
                    {(p.expectedSales / 10000).toFixed(0)}만
                  </p>
                  <div className={`w-1.5 h-1.5 rounded-full mx-auto ${confColor}`} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
