import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { AmbientBackground } from "../components/AmbientBackground";
import { Logo } from "../components/Logo";
import { Spinner } from "../components/Spinner";
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Register() {
  const { signUp, loading: authLoading, userID } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authLoading && userID) return <Navigate to="/dashboard" replace />;

  const trimmed = username.trim();
  const pwTooShort = password.length < 6;
  const pwMismatch = confirm && password !== confirm;
  const canSubmit = trimmed && !pwTooShort && !pwMismatch && loading === false;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(trimmed, password);
      toast.push("success", "Account created", "You can now sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.push("error", "Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />
      <div className="mx-auto grid flex-1 w-full max-w-lg place-items-center px-4 py-20">
        <div className="animate-fade-up w-full">
          <div className="mb-8 text-center">
            <Logo className="mx-auto mb-5" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Free forever. Share up to 100 MB per file.
            </p>
          </div>

          <div className="glass-strong rounded-3xl p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="pick a username"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="at least 6 characters"
                    className="input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-white"
                    tabIndex={-1}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password && (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                      pwTooShort ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {pwTooShort ? (
                      <>At least 6 characters required</>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Looks good
                      </>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="repeat your password"
                  className="input"
                />
                {pwMismatch && (
                  <p className="mt-1.5 text-xs text-rose-400">
                    Passwords don't match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary w-full !py-3.5 text-base"
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" /> Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-400 transition hover:text-brand-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}