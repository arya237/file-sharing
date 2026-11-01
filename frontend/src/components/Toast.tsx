import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ToastKind = "success" | "error" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, { icon: LucideIcon; className: string }> = {
  success: { icon: CheckCircle2, className: "text-emerald-400" },
  error: { icon: XCircle, className: "text-rose-400" },
  info: { icon: Info, className: "text-cyan-400" },
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-4), { id, kind, title, message }]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((toast) => {
          const { icon: Icon, className } = ICONS[toast.kind];
          return (
            <div
              key={toast.id}
              className="glass-strong flex w-full max-w-sm animate-pop items-start gap-3 rounded-2xl p-4 shadow-2xl"
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${className}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}