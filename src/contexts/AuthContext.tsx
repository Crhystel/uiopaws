import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearStoredAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

    // Guard against corrupted storage (e.g. "undefined") that can break production builds.
    const parsedUser = storedUser ? safeParseUser(storedUser) : null;
    const normalizedToken =
      storedToken && storedToken !== 'undefined' && storedToken !== 'null' ? storedToken : null;

    if (normalizedToken && parsedUser) {
      setToken(normalizedToken);
      setUser(parsedUser);
    } else if (storedToken || storedUser) {
      // If something is present but invalid, clear it to avoid crash loops.
      clearStoredAuth();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
