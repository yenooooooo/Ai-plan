import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 패널 — 사장님비서",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-50 bg-[var(--bg-elevated)] border-b border-[var(--border-default)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 text-xs font-bold">A</div>
            <h1 className="text-body-default font-semibold text-[var(--text-primary)]">관리자 패널</h1>
          </div>
          <a href="/home" className="text-caption text-[var(--text-tertiary)] hover:text-primary-500 transition-colors">
            앱으로 돌아가기
          </a>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
