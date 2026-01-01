import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import * as jwtDecodeModule from "jwt-decode";
const jwtDecode = jwtDecodeModule?.default || jwtDecodeModule?.jwtDecode || jwtDecodeModule;
import { useNavigate } from "react-router-dom";
import AuthContext from "./context";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const logoutTimerRef = React.useRef(null);
  const logoutRef = React.useRef(null);

  const logout = React.useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    navigate("/login");
  }, [navigate]);

  // Keep a ref to the latest logout to avoid TDZ / HMR ordering issues
  React.useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const scheduleAutoLogout = useCallback((token) => {
    try {
      const { exp } = jwtDecode(token) || {};
      if (!exp) return;
      const ms = Math.max(0, exp * 1000 - Date.now());

      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

      if (ms <= 0) {
        // token already expired
        logoutRef.current && logoutRef.current();
        return;
      }

      const t = setTimeout(() => {
        logoutRef.current && logoutRef.current();
      }, ms);
      logoutTimerRef.current = t;
    } catch {
      // ignore schedule errors
    }
  }, []);

  const verify = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data);
      scheduleAutoLogout(token);
    } catch (err) {
      console.error("Auth verification failed:", err);
      // token invalid or expired
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleAutoLogout]);
  useEffect(() => {
    verify();

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [verify]);

  const login = async (token) => {
    localStorage.setItem("token", token);
    await verify();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verify }}>
      {children}
    </AuthContext.Provider>
  );
}
