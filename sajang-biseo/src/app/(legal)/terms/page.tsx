import Link from "next/link";

export const metadata = { title: "이용약관 — 사장님비서" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-5 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-primary-500 text-caption hover:underline mb-6 inline-block">
          ← 홈으로
        </Link>
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-8">이용약관</h1>

        <div className="space-y-6 text-body-small text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제1조 (목적)</h2>
            <p>이 약관은 사장님비서(이하 &quot;서비스&quot;)가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제2조 (정의)</h2>
            <p>① &quot;서비스&quot;란 사장님비서가 제공하는 AI 기반 매장 운영 지원 웹 애플리케이션을 말합니다.</p>
            <p>② &quot;이용자&quot;란 이 약관에 동의하고 서비스를 이용하는 자를 말합니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제3조 (약관의 효력 및 변경)</h2>
            <p>① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
            <p>② 서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제4조 (서비스 이용)</h2>
            <p>① 서비스는 매장 매출 관리, AI 분석, 발주 추천, 영수증 인식, 리뷰 답글 생성, 경영 브리핑 등의 기능을 제공합니다.</p>
            <p>② 무료 플랜과 유료 플랜(Pro, Pro+)의 이용 범위는 서비스 내 안내를 따릅니다.</p>
            <p>③ AI 기능의 결과물은 참고용이며, 최종 판단은 이용자의 책임입니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제5조 (개인정보)</h2>
            <p>서비스는 개인정보처리방침에 따라 이용자의 개인정보를 수집·이용합니다. 자세한 내용은 <Link href="/privacy" className="text-primary-500 hover:underline">개인정보처리방침</Link>을 참고하세요.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제6조 (서비스 중단)</h2>
            <p>서비스는 시스템 점검, 장비 교체 등 불가피한 사유로 서비스 제공을 일시 중단할 수 있으며, 사전에 공지합니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">제7조 (면책)</h2>
            <p>① 서비스는 천재지변, 전쟁 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</p>
            <p>② AI가 생성한 분석 결과, 추천 사항은 참고 정보이며 이를 기반으로 한 의사결정의 결과에 대해 서비스는 책임을 지지 않습니다.</p>
          </section>

          <p className="text-caption text-[var(--text-tertiary)] pt-4 border-t border-[var(--border-subtle)]">
            시행일: 2024년 1월 1일
          </p>
        </div>
      </div>
    </main>
  );
}
