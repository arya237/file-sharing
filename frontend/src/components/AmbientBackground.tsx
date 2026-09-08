export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="bg-grid absolute inset-x-0 top-0 h-[70vh]" />
      <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px]" />
      <div className="absolute top-1/3 right-[-120px] h-[420px] w-[420px] rounded-full bg-violet-500/15 blur-[140px]" />
      <div className="absolute bottom-[-140px] left-[-80px] h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
    </div>
  );
}