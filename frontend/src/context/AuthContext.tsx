import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";

interface AuthState {
  userID: string | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = "nimbus.auth";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { userID: null, username: null };
    const parsed = JSON.parse(raw) as AuthState;
    return {
      userID: typeof parsed.userID === "string" ? parsed.userID : null,
      username: typeof parsed.username === "string" ? parsed.username : null,
    };
  } catch {
    return { userID: null, username: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readStored);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ok = await authApi.isAuthenticated();
        if (!cancelled && !ok) {
          setState({ userID: null, username: null });
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Server unreachable — keep session state so navigation still works.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const next = { userID: res.userID, username };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    await authApi.register(username, password);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({ userID: null, username: null });
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loading, signIn, signUp, signOut }),
    [state, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}