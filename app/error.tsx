"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-black px-6 text-center text-white">
      <div className="max-w-md">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/95 to-white/40 shadow-2xl">
          <span className="font-mono text-lg font-bold text-black">L</span>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-white/50">
          The chat UI hit an unexpected error. Your local conversations are
          safe — try again.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-white/25">
            ref: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="mt-5 rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
