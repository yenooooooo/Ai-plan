/**
 * Cloudflare Turnstile 서버 사이드 검증
 * TURNSTILE_SECRET_KEY 미설정 시 검증 건너뜀 (개발 환경)
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResult {
  success: boolean;
  error?: string;
}

/**
 * Turnstile 토큰 서버 검증
 * @param token - 클라이언트에서 받은 cf-turnstile-response
 * @param ip - 요청자 IP (선택)
 */
export async function verifyTurnstile(token: string | null, ip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // 시크릿 미설정 시 건너뜀 (개발 환경)
  if (!secret) return { success: true };

  // 토큰 없으면 실패
  if (!token) return { success: false, error: "보안 인증이 필요합니다. 페이지를 새로고침 해주세요." };

  try {
    const body: Record<string, string> = { secret, response: token };
    if (ip) body.remoteip = ip;

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) return { success: true };
    return { success: false, error: "보안 인증에 실패했습니다. 다시 시도해주세요." };
  } catch {
    // 네트워크 오류 시 통과 (가용성 우선)
    return { success: true };
  }
}
