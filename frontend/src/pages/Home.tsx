import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Clock,
  RotateCcw,
  Eye,
  Download,
  Share2,
  FileUp,
  Layers,
  Globe,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { AmbientBackground } from "../components/AmbientBackground";

const FEATURES = [
  {
    icon: FileUp,
    title: "Instant uploads",
    text: "Drag, drop, done. Files up to 100 MB upload in seconds.",
    color: "text-brand-400",
    glow: "from-brand-500/20 to-brand-600/0",
  },
  {
    icon: Share2,
    title: "Link sharing",
    text: "One click generates a private share link for any file.",
    color: "text-violet-400",
    glow: "from-violet-500/20 to-violet-600/0",
  },
  {
    icon: Clock,
    title: "Expiring links",
    text: "Set a lifetime — 1 hour, 1 day, or a custom deadline.",
    color: "text-cyan-400",
    glow: "from-cyan-500/20 to-cyan-600/0",
  },
  {
    icon: RotateCcw,
    title: "Revoke anytime",
    text: "Turn a link off instantly. No more access, immediately.",
    color: "text-amber-400",
    glow: "from-amber-500/20 to-amber-600/0",
  },
  {
    icon: Eye,
    title: "Private by default",
    text: "Every file is locked behind your account from upload to delete.",
    color: "text-rose-400",
    glow: "from-rose-500/20 to-rose-600/0",
  },
  {
    icon: Zap,
    title: "Blazing fast",
    text: "Lightweight, low-latency transfers. No unnecessary overhead.",
    color: "text-emerald-400",
    glow: "from-emerald-500/20 to-emerald-600/0",
  },
];

const STEPS = [
  {
    num: "1",
    icon: Layers,
    title: "Upload",
    text: "Create a free account, drag a file onto the dashboard, and it's stored securely.",
    color: "text-brand-400",
  },
  {
    num: "2",
    icon: Share2,
    title: "Share",
    text: "Choose an expiration, generate a link, and send it however you like.",
    color: "text-violet-400",
  },
  {
    num: "3",
    icon: Download,
    title: "Done",
    text: "Anyone with the link downloads it instantly — no login needed.",
    color: "text-cyan-400",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pt-20 pb-28 sm:pt-32 sm:pb-36">
          <AmbientBackground />
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <div className="animate-fade-up mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm text-slate-400">
              <Shield className="h-4 w-4 text-brand-400" />
              Secure, expiring share links
            </div>
            <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-7xl">
              Share files{" "}
              <span className="text-gradient">before they're gone.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              Nimbus is a lightweight file-sharing service. Upload, generate
              an expiring link, and let anyone download it — privately,
              quickly, and on your terms.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/register" className="btn-primary !px-7 !py-3.5 text-base">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="btn-ghost !px-7 !py-3.5 text-base"
              >
                Sign in
              </Link>
            </div>

            {/* Floating decorative cards */}
            <div className="pointer-events-none relative mx-auto mt-20 hidden h-[360px] max-w-3xl sm:block" aria-hidden>
              <FloatingCard delay={0} top="0" left="0" kind="PDF" color="from-rose-500 to-rose-600" />
              <FloatingCard delay={1} top="40px" left="180px" kind="PNG" color="from-fuchsia-500 to-violet-600" />
              <FloatingCard delay={2} top="80px" right="0" kind="ZIP" color="from-cyan-500 to-brand-600" />
              <FloatingCard delay={3} top="160px" left="60px" kind="DOCX" color="from-sky-500 to-indigo-600" />
              <FloatingCard delay={4} top="200px" right="40px" kind="CSV" color="from-emerald-500 to-teal-600" />
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="relative border-t border-white/[0.06] bg-ink-950/60 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                Features
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need to share
              </h2>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="glass card-hover group relative overflow-hidden rounded-2xl p-6"
                  >
                    <div
                      className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${f.glow} blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0`}
                      aria-hidden
                    />
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] ${f.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-bold text-white">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                      {f.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Three steps. Zero friction.
              </h2>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="relative text-center">
                    <span
                      className={`absolute -top-3 -left-3 text-7xl font-black leading-none text-white/[0.04]`}
                      aria-hidden
                    >
                      {s.num}
                    </span>
                    <div
                      className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] ring-1 ring-white/10 ${s.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-base font-bold text-white">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {s.text}
                    </p>
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:block" aria-hidden>
                        <svg
                          viewBox="0 0 100 40"
                          className="pointer-events-none absolute top-14 -right-4 h-10 w-12 text-white/[0.08]"
                        >
                          <path
                            d="M5 20 h70 l-10-10 M75 20 l-10 10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="relative border-t border-white/[0.06] bg-ink-950/70 py-24 sm:py-32">
          <AmbientBackground />
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Globe className="mx-auto h-12 w-12 text-brand-400/80" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to ship your first file?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
              Create a free account in seconds and share a file with one
              link. No credit card required.
            </p>
            <Link
              to="/register"
              className="btn-primary mx-auto mt-10 !px-8 !py-3.5 text-base"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06] bg-ink-950">
          <div className="mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
            <p className="text-sm text-slate-600">
              &copy; {new Date().getFullYear()} Nimbus. Built with Go, React &amp; Tailwind.
            </p>
            <div className="flex items-center gap-5">
              <a
                href="https://github.com/arya237/file-sharing"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 transition hover:text-white"
                aria-label="View source on GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ── Floating Card (decorative) ───────────────────────────────────── */
function FloatingCard({
  top,
  left,
  right,
  delay,
  kind,
  color,
}: {
  top: string;
  left?: string;
  right?: string;
  delay: number;
  kind: string;
  color: string;
}) {
  return (
    <div
      className="glass absolute flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl shadow-black/60"
      style={{ top, left, right, animationDelay: `${delay * 1.3}s` }}
      aria-hidden
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-xs font-bold text-white`}
      >
        {kind}
      </span>
      <div className="flex flex-col gap-1">
        <span className="h-2 w-24 rounded-full bg-white/[0.12]" />
        <span className="h-2 w-16 rounded-full bg-white/[0.06]" />
      </div>
    </div>
  );
}