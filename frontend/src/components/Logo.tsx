import { Link } from "react-router-dom";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Nimbus home"
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-cyan-400 shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M4 16.5V8l6.5-5 6.5 5v8.5" />
          <path d="M9.5 16.5v-4a2.5 2.5 0 0 1 5 0v4" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-white">
        Nimbus
      </span>
    </Link>
  );
}