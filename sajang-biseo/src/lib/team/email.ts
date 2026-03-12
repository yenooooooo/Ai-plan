/** 팀원 초대 이메일 발송 */

interface InvitationEmailParams {
  email: string;
  storeName: string;
  inviterName: string;
  role: "viewer" | "editor";
}

const ROLE_LABEL: Record<string, string> = {
  viewer: "조회",
  editor: "편집",
};

export async function sendInvitationEmail({
  email,
  storeName,
  inviterName,
  role,
}: InvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "이메일 서비스 미설정" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sajang-biseo.vercel.app";
  const roleText = ROLE_LABEL[role] || role;

  const html = `
<div style="font-family:'Apple SD Gothic Neo',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff">
  <h2 style="color:#ef4444;font-size:20px;margin:0 0 24px">사장님비서</h2>
  <p style="font-size:16px;color:#111;margin:0 0 8px">
    <strong>${inviterName}</strong>님이 <strong>${storeName}</strong> 매장에 초대했습니다.
  </p>
  <p style="font-size:14px;color:#666;margin:0 0 24px">
    부여된 권한: <strong>${roleText}</strong>
  </p>
  <a href="${appUrl}/login" style="display:inline-block;padding:12px 32px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
    로그인하여 수락하기
  </a>
  <p style="font-size:12px;color:#999;margin:24px 0 0">
    사장님비서에 계정이 없다면 먼저 회원가입이 필요합니다.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="font-size:11px;color:#bbb">이 이메일은 사장님비서에서 발송되었습니다.</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "사장님비서 <onboarding@resend.dev>",
        to: [email],
        subject: `[사장님비서] ${storeName} 매장에 초대되었습니다`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Invitation email error:", errText);
      return { success: false, error: "이메일 발송 실패" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "이메일 발송 중 오류" };
  }
}
