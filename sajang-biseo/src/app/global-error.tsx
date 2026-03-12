"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#fafafa" }}>
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center",
          justifyContent: "center", padding: 24,
        }}>
          <div style={{ textAlign: "center", maxWidth: 360 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#171717", marginBottom: 8 }}>
              오류가 발생했습니다
            </h2>
            <p style={{ fontSize: 14, color: "#737373", marginBottom: 20 }}>
              페이지를 새로고침해주세요.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px", borderRadius: 12,
                background: "#ef4444", color: "#fff", border: "none",
                fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
