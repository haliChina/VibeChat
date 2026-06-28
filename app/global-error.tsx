"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to your monitoring service of choice.
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 480 }}>
          <h1 style={{ fontSize: 20, margin: 0, letterSpacing: -0.3 }}>
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            A critical error broke the app shell. Reload to recover.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 16,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#fff",
              color: "#000",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
