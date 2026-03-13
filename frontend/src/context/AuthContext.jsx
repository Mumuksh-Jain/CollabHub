import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import API from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Try restoring session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authAPI.me();
        setUser(res.data.user);
        setIsLoggedIn(true);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Axios interceptor: if any API call returns 401, auto-logout (skip /me check)
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      (err) => {
        const isAuthCheck = err.config?.url?.includes('/auth/me');
        if (err.response?.status === 401 && !isAuthCheck) {
          setIsLoggedIn(false);
          setUser(null);
        }
        return Promise.reject(err);
      }
    );
    return () => API.interceptors.response.eject(interceptor);
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    setIsLoggedIn(true);
    // Fetch user data
    try {
      const me = await authAPI.me();
      setUser(me.data.user);
    } catch { setUser(null); }
    return res.data;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    setIsLoggedIn(true);
    try {
      const me = await authAPI.me();
      setUser(me.data.user);
    } catch { setUser(null); }
    return res.data;
  };

  const logout = async () => {
    await authAPI.logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
