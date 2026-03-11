"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-[var(--bg-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto">
            <Mail size={36} className="text-primary-500" />
          </div>
        </motion.div>

        <h1 className="font-body text-heading-lg text-[var(--text-primary)] mb-3">
          이메일을 확인해주세요
        </h1>
        <p className="text-body-small text-[var(--text-secondary)] leading-relaxed mb-2">
          {email ? (
            <>
              <span className="text-[var(--text-primary)] font-medium">{email}</span>으로<br />
              인증 링크를 보내드렸습니다.
            </>
          ) : (
            "입력하신 이메일로 인증 링크를 보내드렸습니다."
          )}
        </p>
        <p className="text-caption text-[var(--text-tertiary)] mb-8">
          링크를 클릭하면 바로 서비스를 이용하실 수 있어요.<br />
          메일이 안 보이면 스팸함을 확인해주세요.
        </p>

        <div className="glass-card p-4 text-left space-y-2 mb-6">
          <p className="text-caption font-medium text-[var(--text-secondary)]">확인 중이신가요?</p>
          <p className="text-caption text-[var(--text-tertiary)]">
            이미 인증을 완료하셨다면 아래 버튼으로 로그인하세요.
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full py-3.5 rounded-[14px] bg-primary-500 text-white font-semibold text-[1rem] text-center press-effect hover:bg-primary-600 transition-colors"
        >
          로그인하러 가기
        </Link>
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
