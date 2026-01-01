import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../tenant-admin/Dashboard.css";
import TenantModal from "./TenantModal";

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tenants");
      setTenants(res.data.data || []);
    } catch (err) {
      console.error("Failed to load tenants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card page-card">
        <div className="page-header">
          <div>
            <h1>Super Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage all organizations</p>
          </div>
          <button className="btn primary" onClick={fetchTenants}>Refresh</button>
        </div>

        <section style={{ marginTop: 24 }}>
          {loading ? (
            <p>Loading tenants...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px' }}>Organization</th>
                    <th style={{ padding: '12px' }}>Subdomain</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Plan</th>
                    <th style={{ padding: '12px' }}>Users</th>
                    <th style={{ padding: '12px' }}>Projects</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{t.name}</strong>
                        <div style={{ fontSize: 12, color: '#888' }}>ID: {t.id.substring(0, 8)}...</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <a href={`http://${t.subdomain}.localhost:3000`} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>
                          {t.subdomain}
                        </a>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${t.status === 'active' ? 'success' : 'warning'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 700 }}>{t.subscription_plan}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {t.total_users || 0} / {t.max_users}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {t.total_projects || 0} / {t.max_projects}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          className="btn sm"
                          onClick={() => { setEditing(t); setModalOpen(true); }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>No tenants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <TenantModal
          open={modalOpen}
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchTenants();
          }}
        />
      </div>
    </div>
  );
}
