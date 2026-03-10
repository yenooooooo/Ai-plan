import Link from "next/link";

export const metadata = { title: "개인정보처리방침 — 사장님비서" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-5 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-primary-500 text-caption hover:underline mb-6 inline-block">
          ← 홈으로
        </Link>
        <h1 className="text-heading-lg text-[var(--text-primary)] mb-8">개인정보처리방침</h1>

        <div className="space-y-6 text-body-small text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">1. 수집하는 개인정보</h2>
            <p>서비스는 다음 정보를 수집합니다:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>이메일 주소 (회원가입, 로그인, 이메일 브리핑 발송)</li>
              <li>매장 정보 (상호명, 업종, 주소 — 서비스 제공 목적)</li>
              <li>매출 데이터 (마감 정산, 수수료 분석 목적)</li>
              <li>영수증 이미지 (AI OCR 인식 목적, 처리 후 저장)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">2. 개인정보 이용 목적</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스 제공 및 운영 (매출 분석, AI 추천, 리포트 생성)</li>
              <li>이메일 브리핑 발송 (Pro+ 플랜, 사용자 동의 시)</li>
              <li>서비스 개선 및 통계 분석 (비식별 처리)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">3. 개인정보 보유 기간</h2>
            <p>이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 회원 탈퇴 시 즉시 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보존합니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">4. 개인정보의 제3자 제공</h2>
            <p>서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우 예외입니다:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>법령에 의한 요청이 있는 경우</li>
              <li>AI 분석을 위한 데이터 처리 (Anthropic Claude API — 개인 식별 불가 형태로 전송)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">5. 데이터 보안</h2>
            <p>모든 데이터는 SSL/TLS로 암호화 전송되며, Supabase 클라우드에 안전하게 저장됩니다. 서비스 관리자 외 접근이 불가하도록 Row Level Security(RLS) 정책을 적용합니다.</p>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">6. 이용자의 권리</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>개인정보 열람, 수정, 삭제 요청 가능</li>
              <li>설정 페이지에서 직접 회원 탈퇴 가능 (데이터 즉시 삭제)</li>
              <li>이메일 브리핑 수신 거부 가능</li>
            </ul>
          </section>

          <section>
            <h2 className="text-body-default font-semibold text-[var(--text-primary)] mb-2">7. 문의</h2>
            <p>개인정보 관련 문의는 서비스 내 설정 또는 이메일을 통해 접수할 수 있습니다.</p>
          </section>

          <p className="text-caption text-[var(--text-tertiary)] pt-4 border-t border-[var(--border-subtle)]">
            시행일: 2024년 1월 1일
          </p>
        </div>
      </div>
    </main>
  );
}
