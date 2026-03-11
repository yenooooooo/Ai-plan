import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeSync } from "@/components/shared/ThemeSync";

/* ── Plus Jakarta Sans: 숫자/금액 전용 ── */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

/* ── Pretendard: 한국어 본문 ── */
const pretendard = localFont({
  src: [
    {
      path: "./fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: [
    "Pretendard Variable",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Helvetica Neue",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sajangbiseo.com"),
  title: "사장님비서 — AI 매장 운영 비서",
  description:
    "매일 밤 1시간 걸리던 마감 업무를 5분으로. 마감 정산, 식자재 발주, 영수증 경비 장부, 리뷰 답글, 경영 브리핑까지. 외식업 사장님을 위한 올인원 AI 운영 비서.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "사장님비서",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "사장님비서 — AI 매장 운영 비서",
    description: "매일 밤 1시간 걸리던 마감 업무를 5분으로. 외식업 사장님을 위한 올인원 AI 운영 비서.",
    type: "website",
    locale: "ko_KR",
    siteName: "사장님비서",
  },
  twitter: {
    card: "summary_large_image",
    title: "사장님비서 — AI 매장 운영 비서",
    description: "매일 밤 1시간 걸리던 마감 업무를 5분으로.",
  },
  keywords: ["외식업", "매장관리", "마감정산", "AI비서", "수수료계산", "발주추천", "리뷰답글", "경비장부"],
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0C0C0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`dark ${plusJakartaSans.variable} ${pretendard.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem('sajang-theme')||'{}');var m=s.state&&s.state.mode;if(m==='light')document.documentElement.classList.remove('dark');else if(m==='system'&&window.matchMedia('(prefers-color-scheme:light)').matches)document.documentElement.classList.remove('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
