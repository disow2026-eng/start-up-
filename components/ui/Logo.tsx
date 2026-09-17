export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold ${className}`}>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950">
        <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="34" stroke="#E8590C" strokeWidth="10" />
          <path d="M50 30v20l14 10" stroke="#E8590C" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </span>
      <span className={dark ? "text-white" : "text-ink-950"}>DockClock</span>
    </span>
  );
}
