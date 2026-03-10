import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase Auth 세션 리프레시 + 인증 가드 미들웨어
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로 (대시보드)
  const isProtectedRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/closing") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/receipt") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/briefing") ||
    pathname.startsWith("/fees") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding");

  const isAdminRoute = pathname.startsWith("/admin");

  // 인증 페이지
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // 미로그인 + 보호된 경로 → 로그인으로
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 관리자 전용 경로 — 이메일 체크
  const adminEmails = (process.env.ADMIN_EMAILS || "yaya01234@naver.com").split(",").map(e => e.trim());
  if (isAdminRoute && user && !adminEmails.includes(user.email ?? "")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // 로그인 상태 + 인증 페이지 → 대시보드로
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|api).*)",
  ],
};
