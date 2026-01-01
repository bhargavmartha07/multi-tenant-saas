import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import useAuth from "../../auth/useAuth";

export default function UsersModal({ open, onClose, onSuccess, initial = null, tenants = [], selectedTenantId = null }) {
  const { user } = useAuth();
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [is_active, setIsActive] = useState(true);
  const [tenantId, setTenantId] = useState(selectedTenantId || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initial) {
      setFullName("");
      setEmail("");
      setRole("user");
      setPassword("");
      setIsActive(true);
      setTenantId(selectedTenantId || "");
    } else {
      setFullName(initial.full_name || "");
      setEmail(initial.email || "");
      setRole(initial.role || "user");
      setPassword("");
      setIsActive(initial.is_active === true);
      // preserve tenant for edit (not editable here)
    }
  }, [initial, open, selectedTenantId]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = { full_name, role, is_active };
      if (!initial) payload.email = email;
      if (password) payload.password = password;

      // super_admin must supply tenantId when creating
      if (!initial && user?.role === "super_admin") {
        if (!tenantId) throw new Error("Tenant is required for super-admin");
        payload.tenantId = tenantId;
      }

      if (initial) {
        await api.put(`/users/${initial.id}`, payload);
      } else {
        await api.post(`/users`, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initial ? "Edit User" : "Add New User"}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          {!initial && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@company.com"
                  required
                />
              </div>

              {user?.role === "super_admin" && (
                <div className="form-group">
                  <label>Assign to Tenant</label>
                  <select
                    className="input"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Tenant --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subdomain})</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <input
              className="input"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label>System Role</label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User / Member</option>
              <option value="tenant_admin">Tenant Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password {initial ? "(leave blank to keep)" : ""}</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={initial ? "Enter new password" : "Enter password"}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "var(--text-primary)" }}>
              <input
                type="checkbox"
                checked={is_active}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: "auto", margin: 0 }}
              />
              <span>User account is active</span>
            </label>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Saving..." : initial ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 