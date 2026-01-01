import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Tasks from "../tenant-admin/Tasks";
import "../tenant-admin/Dashboard.css";

export default function UserDashboard() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    // Load recent projects
    api.get("/projects?limit=5").then(res => {
      setProjects(res.data.data || []);
      setLoadingProjects(false);
    }).catch(err => {
      console.error("Failed to load projects", err);
      setLoadingProjects(false);
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <h1>My Dashboard</h1>
        <p className="dashboard-subtitle">Track your work and projects</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Left Column: My Tasks */}
        <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0 }}>My Tasks</h3>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            {/* assignedTo=me is handled by backend default for user role, 
                or explicitly passed here to be safe */}
            <Tasks apiUrl="/tasks?assignedTo=me" />
          </div>
        </div>

        {/* Right Column: Recent Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="dashboard-card">
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Recent Projects</h3>
            {loadingProjects ? (
              <p>Loading...</p>
            ) : projects.length === 0 ? (
              <p className="text-muted">No projects found.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {projects.map(p => (
                  <li key={p.id} style={{ marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                    <div style={{ fontWeight: 600 }}>
                      <Link to={`/tenant-admin/projects/${p.id}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      <span className={`status-dot ${p.status}`}></span> {p.status}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: 16 }}>
              <Link to="/tenant-admin/projects" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                View All Projects
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
