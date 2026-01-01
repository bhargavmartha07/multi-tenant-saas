import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import useAuth from "../../auth/useAuth";
import UsersModal from "./UsersModal";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [tenant, setTenant] = useState(null);

  const fetchTenantDetails = useCallback(async (tid) => {
    try {
      const res = await api.get(`/tenants/${tid}`);
      setTenant(res.data.data);
    } catch (err) {
      console.error("Failed to load tenant details", err);
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    try {
      const res = await api.get(`/tenants`);
      const tenantData = res.data.data || [];
      setTenants(tenantData);
      if (tenantData.length > 0 && !selectedTenantId) {
        setSelectedTenantId(tenantData[0].id);
      }
    } catch (err) {
      console.error("Failed to load tenants", err);
    }
  }, [selectedTenantId]);

  const fetchUsers = useCallback(async (tid = null) => {
    setLoading(true);
    setError("");
    try {
      // 🔑 FIXED: Resolution of tenantId based on role
      const tenantId = user?.role === "super_admin"
        ? (tid || selectedTenantId)
        : user?.tenantId; // Use tenantId directly from user object

      if (!tenantId) {
        if (user?.role === "super_admin") setError("Please select a tenant");
        setUsers([]);
        setLoading(false);
        return;
      }

      const res = await api.get(`/tenants/${tenantId}/users`);
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user, selectedTenantId]);

  // Initial Load
  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchTenants();
    } else if (user?.tenantId) {
      fetchUsers();
      fetchTenantDetails(user.tenantId);
    }
  }, [user, fetchTenants, fetchTenantDetails]);

  // Reload users when super admin changes tenant selector
  useEffect(() => {
    if (user?.role === "super_admin" && selectedTenantId) {
      fetchUsers(selectedTenantId);
      fetchTenantDetails(selectedTenantId);
    }
  }, [selectedTenantId, user, fetchTenantDetails]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card page-card">
        <div className="page-header">
          <h2>Team Members</h2>
          <div className="page-actions">
            {user?.role === "super_admin" && (
              <select
                className="input"
                value={selectedTenantId || ""}
                onChange={(e) => setSelectedTenantId(e.target.value)}
              >
                <option value="">-- Select Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            {tenant && (
              <span className="text-muted" style={{ marginRight: '1rem', fontSize: '0.85rem' }}>
                Usage: <strong>{users.length}</strong> / {tenant.max_users} users
              </span>
            )}
            <button
              className="btn primary"
              onClick={() => { setEditing(null); setModalOpen(true); }}
              disabled={tenant && users.length >= tenant.max_users}
              title={tenant && users.length >= tenant.max_users ? "User limit reached for this plan" : ""}
            >
              {tenant && users.length >= tenant.max_users ? 'Limit Reached' : '+ Add User'}
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5}>No users found for this tenant.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                  <td>{u.is_active ? "✅ Active" : "❌ Inactive"}</td>
                  <td>
                    <button className="btn sm" onClick={() => { setEditing(u); setModalOpen(true); }}>Edit</button>
                    <button
                      className="btn sm danger"
                      disabled={u.id === user.id}
                      title={u.id === user.id ? "You cannot delete yourself" : "Delete user"}
                      onClick={async () => {
                        if (window.confirm("Are you sure?")) {
                          await api.delete(`/users/${u.id}`);
                          fetchUsers();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <UsersModal
          open={modalOpen}
          initial={editing}
          selectedTenantId={user?.role === "super_admin" ? selectedTenantId : user?.tenantId}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchUsers(); // 👈 This triggers the UI refresh
          }}
        />
      </div>
    </div>
  );
}