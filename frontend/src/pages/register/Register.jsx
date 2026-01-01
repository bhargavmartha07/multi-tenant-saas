import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import "./Register.css";

const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export default function Register() {
  const [tenantName, setTenantName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFullName, setAdminFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    if (!tenantName.trim()) return "Organization name is required";
    if (!subdomain.trim()) return "Subdomain is required";
    if (!subdomainRegex.test(subdomain)) return "Subdomain must be lowercase alphanumeric with hyphens";
    if (subdomain.length < 3) return "Subdomain must be at least 3 characters";
    if (subdomain.length > 63) return "Subdomain must be less than 63 characters";
    if (!adminEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) return "Valid admin email is required";
    if (!adminFullName.trim()) return "Admin full name is required";
    if (!password || password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!terms) return "You must accept Terms & Conditions";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validation = validate();
    if (validation) return setError(validation);

    setLoading(true);

    try {
      await api.post('/auth/register-tenant', {
        tenantName,
        subdomain,
        adminEmail,
        adminPassword: password,
        adminFullName
      });

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
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
          <h1>Create Your Organization</h1>
          <p className="auth-subtitle">Get started with your multi-tenant SaaS account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tenantName">Organization Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33333 15.8333V4.16667C3.33333 3.24619 4.07952 2.5 4.99999 2.5H15C15.9205 2.5 16.6667 3.24619 16.6667 4.16667V15.8333C16.6667 16.7538 15.9205 17.5 15 17.5H4.99999C4.07952 17.5 3.33333 16.7538 3.33333 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66667 6.66667H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66667 10H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="tenantName"
                type="text"
                placeholder="Your Company Name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subdomain">Subdomain</label>
            <div className="input-wrapper">
              <input
                id="subdomain"
                type="text"
                placeholder="your-company"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                className="input"
                style={{ paddingRight: '140px' }}
              />
              <span className="input-suffix">.yourapp.com</span>
            </div>
            {subdomain && (
              <p className="input-hint">
                Your URL will be: <strong>{subdomain}.yourapp.com</strong>
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="adminFullName">Admin Full Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0 18.3333C0 14.6519 3.3181 11.6667 7.5 11.6667H12.5C16.6819 11.6667 20 14.6519 20 18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="adminFullName"
                type="text"
                placeholder="John Doe"
                value={adminFullName}
                onChange={(e) => setAdminFullName(e.target.value)}
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="adminEmail">Admin Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.66667L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66667M4.16667 15H15.8333C16.7538 15 17.5 14.2538 17.5 13.3333V6.66667C17.5 5.74619 16.7538 5 15.8333 5H4.16667C3.24619 5 2.5 5.74619 2.5 6.66667V13.3333C2.5 14.2538 3.24619 15 4.16667 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="adminEmail"
                type="email"
                placeholder="admin@company.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
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
                placeholder="At least 8 characters"
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
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3.75C6.23858 3.75 3.75 6.23858 3.75 10C3.75 13.7614 6.23858 16.25 10 16.25C13.7614 16.25 16.25 13.7614 16.25 10C16.25 6.23858 13.7614 3.75 10 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {password && password.length < 8 && (
              <p className="input-hint text-warning">Password must be at least 8 characters</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.625 9.375H4.375C3.33947 9.375 2.5 10.2145 2.5 11.25V15.625C2.5 16.6605 3.33947 17.5 4.375 17.5H15.625C16.6605 17.5 17.5 16.6605 17.5 15.625V11.25C17.5 10.2145 16.6605 9.375 15.625 9.375Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.625 9.375V5.625C5.625 4.31536 6.25312 3.05924 7.35023 2.22509C8.44734 1.39094 9.90689 1.0625 11.25 1.0625C12.5931 1.0625 14.0527 1.39094 15.1498 2.22509C16.2469 3.05924 16.875 4.31536 16.875 5.625V9.375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 2.5L17.5 17.5M8.33333 8.33333C7.89131 8.77535 7.5 9.44102 7.5 10C7.5 10.8284 8.17157 11.5 9 11.5C9.55898 11.5 10.2247 11.1087 10.6667 10.6667M5.83333 5.83333C4.72876 6.9379 3.75 8.45833 3.75 10C3.75 12.7614 6.23858 15.25 9 15.25C10.5417 15.25 12.0621 14.2712 13.1667 13.1667M12.5 8.75C12.5 6.67893 10.8211 5 8.75 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3.75C6.23858 3.75 3.75 6.23858 3.75 10C3.75 13.7614 6.23858 16.25 10 16.25C13.7614 16.25 16.25 13.7614 16.25 10C16.25 6.23858 13.7614 3.75 10 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="input-hint text-error">Passwords do not match</p>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="checkbox-input"
              />
              <span>I agree to the <Link to="/terms" className="auth-link">Terms & Conditions</Link> and <Link to="/privacy" className="auth-link">Privacy Policy</Link></span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading || !terms}>
            {loading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="auth-footer">
            <p className="text-muted">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
