/* global process */
import axios from "axios";

const getEnvApiUrl = () => {
  // Prefer Vite's import.meta.env when available
  try {
    // Access `import.meta.env` directly inside try to let bundlers replace it at build time
    if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
  } catch {
    // ignore when import.meta is not supported in this environment
  }

  // Create-React-App style env at build time
  try {
    if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  } catch {
    // ignore
  }

  // Allow injection via global window (runtime env injection pattern)
  try {
    if (typeof window !== "undefined" && window.__API_URL__) {
      return window.__API_URL__;
    }
  } catch {
    // ignore
  }

  // Fallbacks
  if (typeof window !== "undefined") {
    return "http://127.0.0.1:5000/api";
  }

  return "http://backend:5000/api";
};

const api = axios.create({ baseURL: getEnvApiUrl() });

api.interceptors.request.use((config) => {
  try {
    const token = (typeof localStorage !== "undefined") ? localStorage.getItem("token") : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore (e.g., SSR or restricted storage)
  }
  return config;
});

export default api;
