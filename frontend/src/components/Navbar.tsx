import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu, User, Upload } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/format";

export function Navbar() {
  const { username, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = (
    <>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `text-sm font-medium transition ${
            isActive ? "text-white" : "text-slate-400 hover:text-white"
          }`
        }
      >
        Overview
      </NavLink>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `text-sm font-medium transition ${
            isActive ? "text-white" : "text-slate-400 hover:text-white"
          }`
        }
      >
        Files
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-6 md:flex">{links}</div>
        </div>

        <div className="flex items-center gap-3">
          {username ? (
            <Link to="/dashboard" className="btn-primary hidden !px-4 sm:inline-flex">
              <Upload className="h-4 w-4" /> Upload
            </Link>
          ) : null}
          <div className="relative" ref={menuRef}>
            {username ? (
              <>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-brand-500/30 ring-2 ring-white/10 transition hover:ring-white/30"
                  aria-label="Account menu"
                >
                  {initials(username)}
                </button>
                {menuOpen && (
                  <div className="glass-strong absolute right-0 mt-2 w-56 animate-pop rounded-2xl p-2 shadow-2xl">
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-bold text-white">
                        {initials(username)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {username}
                        </p>
                        <p className="text-xs text-slate-500">Signed in</p>
                      </div>
                    </div>
                    <div className="my-2 h-px bg-white/10" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/login" className="btn-ghost !px-4">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !px-4">
                  Get started
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="glass-strong mx-4 mb-4 animate-pop rounded-2xl p-3 md:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          <div className="my-2 h-px bg-white/10" />
          {username ? (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-300">
                <User className="h-4 w-4" /> {username}
              </span>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}