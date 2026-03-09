import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "사장님비서 — AI 매장 운영 비서";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0C0C0A 0%, #1A1A16 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #FF6B2C, #FF8F5C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              color: "white",
              fontWeight: 800,
            }}
          >
            비
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#FAFAF8",
            }}
          >
            사장님비서
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "#A3A39A",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.5,
          }}
        >
          매일 밤 1시간 걸리던 마감 업무를 5분으로
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["마감정산", "발주추천", "경비장부", "리뷰답글", "AI브리핑"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 20px",
                  borderRadius: "24px",
                  background: "rgba(255, 107, 44, 0.15)",
                  color: "#FF8F5C",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
