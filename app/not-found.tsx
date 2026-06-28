import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-black px-6 text-center text-white">
      <div className="max-w-md">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/95 to-white/40 shadow-2xl">
          <span className="font-mono text-lg font-bold text-black">L</span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">
          404
        </p>
        <h1 className="mt-2 text-lg font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-white/50">
          This is a single-page chat app — head back to the main interface.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Open chat
        </Link>
      </div>
    </div>
  );
}
