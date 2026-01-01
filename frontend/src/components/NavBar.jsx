import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";
import "./NavBar.css";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const role = user?.role;

  const homeHref = role === "super_admin" ? "/super-admin" : role === "tenant_admin" ? "/tenant-admin" : "/user";

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setShowUserMenu(false);
  };

  return (
    <header className="app-nav">
      <div className="nav-inner">
        <div className="brand">
          <Link to={homeHref} className="brand-link">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="url(#navGradient)" />
              <path d="M20 12L28 18V26L20 32L12 26V18L20 12Z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="navGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <span>Multi Tenant SaaS</span>
          </Link>
          <button
            className="hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        <nav className={`nav-links ${open ? "open" : ""}`} aria-expanded={open}>
          <Link
            to={homeHref}
            onClick={() => setOpen(false)}
            className={isActive(homeHref) ? "active" : ""}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 10L10 2.5L17.5 10M4.16667 9.16667V16.6667C4.16667 17.5871 4.91286 18.3333 5.83333 18.3333H8.33333V13.3333C8.33333 12.4129 9.07952 11.6667 10 11.6667H10C10.9205 11.6667 11.6667 12.4129 11.6667 13.3333V18.3333H14.1667C15.0871 18.3333 15.8333 17.5871 15.8333 16.6667V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          {role === "tenant_admin" && (
            <>
              <Link
                to="/tenant-admin/projects"
                onClick={() => setOpen(false)}
                className={isActive("/tenant-admin/projects") ? "active" : ""}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3.33333 5.83333H16.6667C17.5871 5.83333 18.3333 6.57952 18.3333 7.5V15.8333C18.3333 16.7538 17.5871 17.5 16.6667 17.5H3.33333C2.41286 17.5 1.66667 16.7538 1.66667 15.8333V7.5C1.66667 6.57952 2.41286 5.83333 3.33333 5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1.66667 9.16667H18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Projects
              </Link>
              <Link
                to="/tenant-admin/users"
                onClick={() => setOpen(false)}
                className={isActive("/tenant-admin/users") ? "active" : ""}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0 18.3333C0 14.6519 3.3181 11.6667 7.5 11.6667H12.5C16.6819 11.6667 20 14.6519 20 18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Users
              </Link>
              <Link
                to="/tenant-admin/tasks"
                onClick={() => setOpen(false)}
                className={isActive("/tenant-admin/tasks") ? "active" : ""}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 7.5H17.5M13.3333 2.5V5M6.66667 2.5V5M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Tasks
              </Link>
            </>
          )}

          {role === "super_admin" && (
            <Link
              to="/super-admin"
              onClick={() => setOpen(false)}
              className={isActive("/super-admin") ? "active" : ""}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33333 15.8333V4.16667C3.33333 3.24619 4.07952 2.5 4.99999 2.5H15C15.9205 2.5 16.6667 3.24619 16.6667 4.16667V15.8333C16.6667 16.7538 15.9205 17.5 15 17.5H4.99999C4.07952 17.5 3.33333 16.7538 3.33333 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.66667 6.66667H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tenants
            </Link>
          )}

          <div className="nav-right">
            <div className="user-menu-wrapper">
              <button
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                <div className="user-avatar">
                  {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.full_name || user?.email || "User"}</span>
                  <span className="user-role">{role?.replace('_', ' ')}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className="user-avatar-large">
                      {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="user-menu-name">{user?.full_name || "User"}</div>
                      <div className="user-menu-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button className="user-menu-item" onClick={handleLogout}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.3333 14.1667L17.5 10L13.3333 5.83333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {
        showUserMenu && (
          <div className="user-menu-backdrop" onClick={() => setShowUserMenu(false)}></div>
        )
      }
    </header >
  );
}
