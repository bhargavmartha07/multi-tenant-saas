import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import useAuth from "../../auth/useAuth";
import "./Dashboard.css";

export default function TenantAdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    totalUsers: 0,
    completedTasks: 0,
    activeTasks: 0,
    maxUsers: 0,
    maxProjects: 0
  });

  const { user } = useAuth();

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Parallel fetch: Projects list and Tenant Stats
      const projectsPromise = api.get("/projects?limit=6"); // limit to recent
      const statsPromise = user?.tenantId ? api.get(`/tenants/${user.tenantId}`) : Promise.resolve({ data: { data: {} } });

      const [resProjects, resStats] = await Promise.all([projectsPromise, statsPromise]);

      setProjects(resProjects.data.data || []);

      const tData = resStats.data.data || {};
      const tStats = tData.stats || {};
      setStats({
        totalProjects: tStats.totalProjects || 0,
        totalTasks: tStats.totalTasks || 0,
        totalUsers: tStats.totalUsers || 0,
        completedTasks: tStats.completedTasks !== undefined ? tStats.completedTasks : 0,
        activeTasks: tStats.activeTasks !== undefined ? tStats.activeTasks : 0,
        maxUsers: tData.max_users || 0,
        maxProjects: tData.max_projects || 0
      });

    } catch (e) {
      console.error("Failed to load dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!name.trim()) {
      alert("Project name required");
      return;
    }

    try {
      await api.post("/projects", {
        name,
        description
      });

      setName("");
      setDescription("");
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create project");
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Manage your projects and tasks</p>
        </div>
        <Link to="/tenant-admin/users" className="btn btn-secondary">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 18.3333C0 14.6519 3.3181 11.6667 7.5 11.6667H12.5C16.6819 11.6667 20 14.6519 20 18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Manage Users
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProjects} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {stats.maxProjects}</span></div>
            <div className="stat-label">Projects Used</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {stats.maxUsers}</span></div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M16.6667 5L7.5 14.1667L3.33333 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M10 3.33333V10M10 16.6667H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeTasks}</div>
            <div className="stat-label">Active Tasks</div>
          </div>
        </div>
      </div>

      {/* Create Project Section */}
      <div className="card create-project-card">
        <h2 className="card-title">Create New Project</h2>
        <div className="create-project-form">
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-description">Description (Optional)</label>
            <textarea
              id="project-description"
              placeholder="Enter project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows="3"
            />
          </div>
          <button
            onClick={createProject}
            className="btn btn-primary"
            disabled={stats.totalProjects >= stats.maxProjects}
            title={stats.totalProjects >= stats.maxProjects ? "Project limit reached. Upgrade plan to create more." : ""}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {stats.totalProjects >= stats.maxProjects ? 'Limit Reached' : 'Create Project'}
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-section">
        <div className="section-header">
          <h2>Your Projects</h2>
          <Link to="/tenant-admin/projects" className="btn btn-secondary btn-sm">
            View All
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="rgba(99, 102, 241, 0.1)" />
              <path d="M32 20L44 28V40L32 48L20 40V28L32 20Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 6).map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 className="project-card-title">{project.name}</h3>
                  <span className={`status-badge status-${project.status || 'active'}`}>
                    {project.status || 'active'}
                  </span>
                </div>
                {project.description && (
                  <p className="project-card-description">{project.description}</p>
                )}
                <div className="project-card-footer">
                  <Link
                    to={`/tenant-admin/projects/${project.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
                {/* Tasks removed for performance */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
