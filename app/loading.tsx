export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-black">
      <div
        aria-label="Loading"
        className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-white/70"
      />
    </div>
  );
}
