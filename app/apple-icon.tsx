import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.45) 100%)",
          borderRadius: 36,
          fontSize: 120,
          fontWeight: 800,
          color: "#000",
          letterSpacing: -2,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
