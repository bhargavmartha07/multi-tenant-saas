import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../auth/useAuth";
import api from "../../api/axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        tenantSubdomain: subdomain || null
      });

      const { token, user } = res.data.data;

      await login(token);

      if (user.role === "super_admin") {
        navigate("/super-admin");
      } else if (user.role === "tenant_admin") {
        navigate("/tenant-admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '480px', background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: '20px', padding: '3rem 2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.1)', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="url(#gradient)"/>
              <path d="M20 12L28 18V26L20 32L12 26V18L20 12Z" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="subdomain">Tenant Subdomain <span className="text-muted">(optional for super admin)</span></label>
            <div className="input-wrapper">
              <input
                id="subdomain"
                type="text"
                placeholder="your-company"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                className="input"
              />
              <span className="input-suffix">.yourapp.com</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.66667L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66667M4.16667 15H15.8333C16.7538 15 17.5 14.2538 17.5 13.3333V6.66667C17.5 5.74619 16.7538 5 15.8333 5H4.16667C3.24619 5 2.5 5.74619 2.5 6.66667V13.3333C2.5 14.2538 3.24619 15 4.16667 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.625 9.375H4.375C3.33947 9.375 2.5 10.2145 2.5 11.25V15.625C2.5 16.6605 3.33947 17.5 4.375 17.5H15.625C16.6605 17.5 17.5 16.6605 17.5 15.625V11.25C17.5 10.2145 16.6605 9.375 15.625 9.375Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.625 9.375V5.625C5.625 4.31536 6.25312 3.05924 7.35023 2.22509C8.44734 1.39094 9.90689 1.0625 11.25 1.0625C12.5931 1.0625 14.0527 1.39094 15.1498 2.22509C16.2469 3.05924 16.875 4.31536 16.875 5.625V9.375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89131 8.77535 7.5 9.44102 7.5 10C7.5 10.8284 8.17157 11.5 9 11.5C9.55898 11.5 10.2247 11.1087 10.6667 10.6667M5.83333 5.83333C4.72876 6.9379 3.75 8.45833 3.75 10C3.75 12.7614 6.23858 15.25 9 15.25C10.5417 15.25 12.0621 14.2712 13.1667 13.1667M12.5 8.75C12.5 6.67893 10.8211 5 8.75 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.25 12.5C16.25 12.5 15.4167 14.1667 13.75 15.4167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3.75C6.23858 3.75 3.75 6.23858 3.75 10C3.75 13.7614 6.23858 16.25 10 16.25C13.7614 16.25 16.25 13.7614 16.25 10C16.25 6.23858 13.7614 3.75 10 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="auth-footer">
            <p className="text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">Create one now</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
