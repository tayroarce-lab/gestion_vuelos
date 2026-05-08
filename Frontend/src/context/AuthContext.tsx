import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { User } from '../types/api.types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate              = useNavigate();
  const expiredListenerAdded  = useRef(false);

  // ── Verificar cookie al montar ────────────────────────────────────────────
  useEffect(() => {
    authApi.getMe()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Escuchar evento global 'auth:expired' ─────────────────────────────────
  useEffect(() => {
    if (expiredListenerAdded.current) return;
    expiredListenerAdded.current = true;

    const handler = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [navigate]);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    setUser(res.data);
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignorar errores de red */ }
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
