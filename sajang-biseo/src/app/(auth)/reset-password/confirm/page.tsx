"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const checks = {
    length: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
  const isValid = Object.values(checks).every(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("비밀번호 변경에 실패했습니다. 링크가 만료됐을 수 있어요.");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/home"), 2000);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-10">
          <span className="text-5xl">🔐</span>
          <h1 className="font-body text-heading-lg text-[var(--text-primary)] mt-4">
            새 비밀번호 설정
          </h1>
          <p className="text-body-small text-[var(--text-secondary)] mt-1">
            새로 사용할 비밀번호를 입력해주세요
          </p>
        </div>

        {done ? (
          <div className="glass-card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check size={24} className="text-success" />
            </div>
            <p className="text-body-default font-medium text-[var(--text-primary)]">
              비밀번호가 변경되었습니다
            </p>
            <p className="text-caption text-[var(--text-tertiary)]">잠시 후 이동합니다...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-small text-[var(--text-secondary)] mb-2">
                새 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="새 비밀번호 입력"
                  className="
                    w-full h-[52px] px-4 pr-12 rounded-xl
                    bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                    border border-[var(--border-default)]
                    placeholder:text-[var(--text-tertiary)]
                    focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                    transition-colors duration-200 text-body-default
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-1.5"
                >
                  {[
                    { key: "length" as const, label: "8자 이상" },
                    { key: "hasLetter" as const, label: "영문 포함" },
                    { key: "hasNumber" as const, label: "숫자 포함" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${checks[key] ? "bg-success text-white" : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"}`}>
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span className={`text-caption transition-colors duration-200 ${checks[key] ? "text-success" : "text-[var(--text-tertiary)]"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-body-small text-danger text-center py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !isValid}
              className="
                w-full h-14 rounded-[14px] mt-2
                bg-primary-500 text-white font-body font-semibold text-[1rem]
                press-effect transition-all duration-200 ease-smooth
                hover:bg-primary-600 hover:shadow-lg active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : "비밀번호 변경하기"}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  );
}
