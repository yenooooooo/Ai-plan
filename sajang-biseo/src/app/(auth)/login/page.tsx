"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { signIn } from "../actions";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (redirectTo) formData.set("redirect", redirectTo);

    const result = await signIn(formData);
    if (result?.error) {
      setError(
        result.error === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : result.error
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* 로고 */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-4"
          >
            <span className="text-5xl">🍳</span>
          </motion.div>
          <h1 className="font-body text-heading-lg text-[var(--text-primary)]">
            사장님비서
          </h1>
          <p className="text-body-small text-[var(--text-secondary)] mt-1">
            매장 운영의 든든한 AI 파트너
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-body-small text-[var(--text-secondary)] mb-2">
              이메일
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="이메일 주소를 입력하세요"
              className="
                w-full h-[52px] px-4 rounded-xl
                bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                border border-[var(--border-default)]
                placeholder:text-[var(--text-tertiary)]
                focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                transition-colors duration-200
                text-body-default font-display
              "
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-body-small text-[var(--text-secondary)] mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                className="
                  w-full h-[52px] px-4 pr-12 rounded-xl
                  bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                  border border-[var(--border-default)]
                  placeholder:text-[var(--text-tertiary)]
                  focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                  transition-colors duration-200
                  text-body-default
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
          </div>

          {/* 에러 메시지 */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-body-small text-danger text-center py-2"
            >
              {error}
            </motion.p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full h-14 rounded-[14px] mt-2
              bg-primary-500 text-white font-body font-semibold text-[1rem]
              press-effect
              transition-all duration-200 ease-smooth
              hover:bg-primary-600 hover:shadow-lg
              active:scale-[0.98]
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
            ) : (
              <>
                로그인
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center mt-6 text-body-small text-[var(--text-tertiary)]">
          아직 계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="text-primary-500 font-medium hover:underline"
          >
            회원가입
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
