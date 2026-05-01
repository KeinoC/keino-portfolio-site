import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Keino Chichester — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          backgroundColor: "#090909",
          color: "#F5F5F0",
          padding: "80px",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#555",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          KC · Brooklyn, NY
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-4px",
            }}
          >
            Keino
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-4px",
            }}
          >
            Chichester
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#888",
              marginTop: 24,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Software Engineer
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#888", maxWidth: 680 }}>
            3+ years shipping production web apps. 8 years in healthcare
            finance. Code meets business context.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#F5F5F0",
              fontWeight: 500,
            }}
          >
            keino.dev
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
