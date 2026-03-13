// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, default as API } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const restoreSession = async () => {
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
    restoreSession();
  }, []);

  // Logout on 401 from protected routes
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (res) => res,
      (err) => {
        const isAuthCheck = err.config?.url?.includes("/auth/me");
        if (err.response?.status === 401 && !isAuthCheck) {
          setUser(null);
          setIsLoggedIn(false);
        }
        return Promise.reject(err);
      }
    );
    return () => API.interceptors.response.eject(interceptor);
  }, []);

  const login = async (credentials) => {
    await authAPI.login(credentials); // cookie handles auth
    const me = await authAPI.me();
    setUser(me.data.user);
    setIsLoggedIn(true);
  };

  const register = async (data) => {
    await authAPI.register(data);
    const me = await authAPI.me();
    setUser(me.data.user);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setIsLoggedIn(false);
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}