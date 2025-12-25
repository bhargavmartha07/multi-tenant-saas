import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get("/tenants").then(res => {
      setTenants(res.data.data);
    });
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Super Admin Dashboard</h1>

      <h3>Tenants</h3>
      <ul>
        {tenants.map(t => (
          <li key={t.id}>
            {t.name} ({t.subdomain})
          </li>
        ))}
      </ul>
    </div>
  );
}
