import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import ProjectDeleteModal from "./ProjectDeleteModal";
import ProjectModal from "./ProjectModal";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const navigate = useNavigate();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const q = query ? `?search=${encodeURIComponent(query)}${statusFilter ? `&status=${statusFilter}` : ''}` : (statusFilter ? `?status=${statusFilter}` : '');
      const res = await api.get(`/projects${q}`);
      setProjects(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div>
      <h2>Projects</h2>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn" onClick={() => { setEditing(null); setShowModal(true); }}>Create New Project</button>
        <input className="input" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn" onClick={loadProjects}>Search</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <div className="projects-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="project-card">
              <div style={{ width: '60%' }} className="skeleton" />
              <div style={{ height: 10 }} className="skeleton" />
              <div style={{ width: '40%', height: 12 }} className="skeleton" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card">
              <div>
                <h4 className="project-title">{p.name}</h4>
                <p className="project-desc">{p.description}</p>
              </div>

              <div className="project-footer">
                <div className="project-meta">{p.status} • {new Date(p.created_at).toLocaleDateString()}</div>
                <div>
                  <button className="btn" onClick={() => navigate(`/tenant-admin/projects/${p.id}`)}>View</button>
                  <button className="btn" style={{ marginLeft: 6 }} onClick={() => { setEditing(p); setShowModal(true); }}>Edit</button>
                  <button className="btn" style={{ marginLeft: 6 }} onClick={() => { setSelectedProject(p); setShowDelete(true); }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectModal open={showModal} onClose={() => setShowModal(false)} initial={editing} onSuccess={() => loadProjects()} />

      <ProjectDeleteModal
        open={showDelete}
        onClose={() => { setShowDelete(false); setSelectedProject(null); }}
        project={selectedProject}
        onSuccess={() => loadProjects()}
      />
    </div>
  );
}
