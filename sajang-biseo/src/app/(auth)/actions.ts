"use server";

import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { checkLoginAttempt, resetLoginAttempts, checkSignupLimit } from "@/lib/security/rateLimiter";
import { isDisposableEmail } from "@/lib/security/disposableEmails";

/** 요청 IP 추출 */
async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? h.get("x-real-ip")
    ?? "unknown";
}

export async function signUp(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const turnstileToken = formData.get("cf-turnstile-response") as string | null;

  // 1. Turnstile CAPTCHA 검증
  const ip = await getClientIp();
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.success) {
    return { error: captcha.error ?? "보안 인증에 실패했습니다." };
  }

  // 2. 일회용 이메일 차단
  if (isDisposableEmail(email)) {
    return { error: "일회용 이메일은 사용할 수 없습니다. 실제 이메일을 사용해주세요." };
  }

  // 3. IP당 가입 수 제한 (24시간 내 3개)
  const signupCheck = checkSignupLimit(ip);
  if (!signupCheck.allowed) {
    return { error: "너무 많은 계정이 생성되었습니다. 24시간 후 다시 시도해주세요." };
  }

  // 4. 비밀번호 서버 검증
  if (!password || password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    return { error: "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sajangbiseo.com";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

export async function signIn(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || null;
  const turnstileToken = formData.get("cf-turnstile-response") as string | null;

  const ip = await getClientIp();

  // 1. 로그인 시도 제한 체크 (5회/15분)
  const loginCheck = checkLoginAttempt(ip);
  if (!loginCheck.allowed) {
    return {
      error: `로그인 시도가 너무 많습니다. ${loginCheck.lockoutMinutes}분 후 다시 시도해주세요.`,
      lockout: true,
    };
  }

  // 2. Turnstile CAPTCHA 검증
  const captcha = await verifyTurnstile(turnstileToken, ip);
  if (!captcha.success) {
    return { error: captcha.error ?? "보안 인증에 실패했습니다." };
  }

  // 3. 로그인 시도
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message === "Invalid login credentials"
        ? `이메일 또는 비밀번호가 올바르지 않습니다. (남은 시도: ${loginCheck.remaining}회)`
        : error.message,
      remaining: loginCheck.remaining,
    };
  }

  // 로그인 성공 → 시도 카운터 리셋
  resetLoginAttempts(ip);

  // 프로필 존재 여부 확인 → 없으면 온보딩
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("sb_user_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      redirect("/onboarding");
    }
  }

  redirect(redirectTo || "/home");
}

export async function signOut() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const email = formData.get("email") as string;

  if (!email) return { error: "이메일을 입력해주세요." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sajangbiseo.com";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password/confirm`,
  });

  if (error) return { error: error.message };
  return { success: true };
}
