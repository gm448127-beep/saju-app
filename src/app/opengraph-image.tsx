import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "사주도우미 - AI 맞춤 사주 분석";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #F5F0EB 0%, #E8E2DC 50%, #D4CEC8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단 장식 */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <span style={{ fontSize: "40px" }}>🔮</span>
          <span style={{ fontSize: "40px" }}>📜</span>
          <span style={{ fontSize: "40px" }}>💕</span>
          <span style={{ fontSize: "40px" }}>🌤️</span>
          <span style={{ fontSize: "40px" }}>💬</span>
        </div>

        {/* 메인 아이콘 */}
        <div style={{ fontSize: "100px", marginBottom: "10px" }}>🏮</div>

        {/* 제목 */}
        <div
          style={{
            fontSize: "60px",
            fontWeight: "bold",
            color: "#3D3338",
            marginBottom: "15px",
          }}
        >
          사주도우미
        </div>

        {/* 부제목 */}
        <div
          style={{
            fontSize: "28px",
            color: "#5A4A42",
            marginBottom: "30px",
          }}
        >
          AI 맞춤 사주 분석 서비스
        </div>

        {/* 기능 태그들 */}
        <div style={{ display: "flex", gap: "15px" }}>
          {["사주팔자", "오늘의 운세", "토정비결", "궁합", "AI 상담"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  background: "white",
                  border: "2px solid #E8E2DC",
                  borderRadius: "30px",
                  padding: "10px 25px",
                  fontSize: "22px",
                  color: "#5A4A42",
                  fontWeight: "500",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "18px",
            color: "#9B8E86",
          }}
        >
          saju-app-vert.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}

