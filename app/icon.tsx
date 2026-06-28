import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Tiny "L" mark on a near-black square. Matches the brand gradient.
export default function Icon() {
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
          borderRadius: 6,
          fontSize: 22,
          fontWeight: 800,
          color: "#000",
          letterSpacing: -0.5,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
