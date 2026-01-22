import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Diagnostics: helps confirm provider mounted in preview without relying on DevTools.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__UIO_PAWS_AUTH_PROVIDER_MOUNTED__ = true;

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearStoredAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
  };

  const safeParseUser = (value: string): User | null => {
    // Some environments end up persisting the literal string "undefined".
    if (!value || value === 'undefined' || value === 'null') return null;
    try {
      return JSON.parse(value) as User;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedRole = localStorage.getItem('auth_role');

    // Guard against corrupted storage (e.g. "undefined") that can break production builds.
    const parsedUser = storedUser ? safeParseUser(storedUser) : null;
    const normalizedToken =
      storedToken && storedToken !== 'undefined' && storedToken !== 'null' ? storedToken : null;

    if (normalizedToken && parsedUser) {
      setToken(normalizedToken);
      setUser(parsedUser);
      setRole(storedRole && storedRole !== 'undefined' && storedRole !== 'null' ? storedRole : null);
    } else if (storedToken || storedUser) {
      // If something is present but invalid, clear it to avoid crash loops.
      clearStoredAuth();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    // Persist immediately so interceptors can attach the token for the profile call.
    localStorage.setItem('auth_token', response.access_token);
    localStorage.setItem('auth_role', response.user_role);
    if (response.user) {
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    }

    setToken(response.access_token);
    setRole(response.user_role);

    // Fetch the full user profile (roles array) when available.
    try {
      const profile = await authApi.profile();
      setUser(profile);
      localStorage.setItem('auth_user', JSON.stringify(profile));
    } catch {
      // If /profile fails, we still keep token+role to allow routing.
      if (response.user) setUser(response.user);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
  };

  const hasRole = (required: string) => {
    // Prefer the role returned by login (fastest, always present).
    const current = role ?? null;

    // Hierarchy: Super Admin >= Admin >= User
    if (!current) {
      // Fallback to roles array from /profile if present
      const names = (user?.roles ?? []).map((r) => r.name);
      return names.includes(required);
    }

    if (required === 'Admin') return current === 'Admin' || current === 'Super Admin';
    if (required === 'User') return current === 'User' || current === 'Admin' || current === 'Super Admin';
    return current === required;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mounted = (globalThis as any).__UIO_PAWS_AUTH_PROVIDER_MOUNTED__;
    // eslint-disable-next-line no-console
    console.error('[Auth] useAuth called without provider. Provider mounted flag:', mounted);
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
