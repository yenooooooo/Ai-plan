"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="text-center space-y-6 max-w-sm">
        {/* 404 숫자 */}
        <div className="relative">
          <p className="text-[120px] font-display font-extrabold text-primary-500/15 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-white">비</span>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-2">
          <h1 className="text-heading-lg text-[var(--text-primary)] font-bold">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-body-small text-[var(--text-secondary)] leading-relaxed">
            요청하신 페이지가 존재하지 않거나<br />
            주소가 변경되었을 수 있습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-500 text-white text-body-small font-semibold press-effect"
          >
            <Home size={16} />
            홈으로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-body-small font-medium press-effect"
          >
            <ArrowLeft size={16} />
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
