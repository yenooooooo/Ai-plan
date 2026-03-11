"use client";

import { useState } from "react";
import { Ticket, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLAN_LABEL: Record<string, string> = { pro: "Pro", pro_plus: "Pro+" };

interface RedeemResult {
  plan: string;
  planExpiresAt: string;
  durationDays: number;
}

export function CouponSection() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RedeemResult | null>(null);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/coupon/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "쿠폰 적용 실패");
      return;
    }

    setResult(data);
    setCode("");
    // 플랜 변경됐으므로 페이지 새로고침
    setTimeout(() => window.location.reload(), 2000);
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Ticket size={16} className="text-primary-500" />
        <h3 className="text-body-default font-semibold text-[var(--text-primary)]">쿠폰 등록</h3>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 py-4 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Check size={20} className="text-success" />
            </div>
            <p className="text-body-small font-semibold text-[var(--text-primary)]">
              {PLAN_LABEL[result.plan] ?? result.plan} 플랜 적용 완료!
            </p>
            <p className="text-caption text-[var(--text-tertiary)]">
              {result.durationDays}일간 이용 가능 · {new Date(result.planExpiresAt).toLocaleDateString("ko-KR")} 만료
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleRedeem} className="space-y-3">
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="쿠폰 코드 입력"
                required
                maxLength={20}
                className="flex-1 h-10 px-3 rounded-xl bg-[var(--bg-tertiary)] text-body-small font-display text-[var(--text-primary)] border border-[var(--border-default)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 uppercase tracking-widest"
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="h-10 px-4 rounded-xl bg-primary-500 text-white text-body-small font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors press-effect"
              >
                {loading ? "확인 중..." : "적용"}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-caption text-danger"
              >
                {error}
              </motion.p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
