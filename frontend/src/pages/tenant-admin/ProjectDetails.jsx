import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Tasks from "./Tasks";
import "./Dashboard.css";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local edit state (initialized empty to avoid calling hooks conditionally)
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        if (mounted) setProject(res.data.data);
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => mounted = false;
  }, [projectId]);

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  const handleSave = async () => {
    setError("");
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    try {
      const res = await api.put(`/projects/${project.id}`, { name, status });
      setProject(res.data.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card page-card">
        <div className="page-header">
          <div>
            <h2 style={{ margin: 0 }}>{project.name} <small style={{ color: '#aaa' }}>— {project.status}</small></h2>
            <p style={{ marginTop: 8 }}>{project.description || 'No description'}</p>
          </div>

          <div className="page-actions">
            {!editing ? (
              <button className="btn" onClick={() => { setEditing(true); setName(project.name); setStatus(project.status); }}>Edit</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>

        <hr className="divider" />

        <section>
          <h4>Tasks</h4>
          <Tasks projectId={project.id} />
        </section>

        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
