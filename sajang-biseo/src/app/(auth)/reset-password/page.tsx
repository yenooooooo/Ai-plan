"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { resetPassword } from "../actions";

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
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
        <div className="text-center mb-10">
          <div className="mb-4">
            <span className="text-5xl">🔑</span>
          </div>
          <h1 className="font-body text-heading-lg text-[var(--text-primary)]">
            비밀번호 재설정
          </h1>
          <p className="text-body-small text-[var(--text-secondary)] mt-1">
            가입한 이메일로 재설정 링크를 보내드려요
          </p>
        </div>

        {sent ? (
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Mail size={24} className="text-success" />
            </div>
            <p className="text-body-default text-[var(--text-primary)]">
              이메일을 확인해주세요
            </p>
            <p className="text-caption text-[var(--text-secondary)]">
              비밀번호 재설정 링크가 발송되었습니다.<br />
              메일이 보이지 않으면 스팸함을 확인해주세요.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-small text-[var(--text-secondary)] mb-2">
                이메일
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="가입한 이메일 주소"
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
              disabled={loading}
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
              ) : (
                "재설정 링크 보내기"
              )}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-body-small text-[var(--text-tertiary)]">
          <Link href="/login" className="text-primary-500 font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            로그인으로 돌아가기
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
