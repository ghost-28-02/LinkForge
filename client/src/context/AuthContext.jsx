import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api/client.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'linkforge_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (token) {
        setToken(token);
        try {
          const me = await api.me();
          setUser(me);
        } catch {
          logout();
        }
      }
      setLoading(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);
    setTokenState(token);
    setUser(user);
  }

  async function login(email, password) {
    const { token, user } = await api.login(email, password);
    persist(token, user);
  }

  async function register(email, password) {
    const { token, user } = await api.register(email, password);
    persist(token, user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
