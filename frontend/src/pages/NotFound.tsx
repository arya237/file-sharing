import { Link } from "react-router-dom";
import { Ghost } from "lucide-react";
import { AmbientBackground } from "../components/AmbientBackground";
import { Logo } from "../components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <AmbientBackground />
      <div className="relative z-10 px-4 text-center">
        <Logo className="mx-auto mb-8" />
        <span className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white/[0.04]">
          <Ghost className="h-12 w-12 text-brand-400/80" />
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-white">
          404 — page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-slate-400">
          This page doesn't exist — or it's been moved somewhere else. 
          Head back and try again.
        </p>
        <Link to="/" className="btn-primary mx-auto mt-8 !px-7 !py-3.5 text-base">
          Back to home
        </Link>
      </div>
    </div>
  );
}