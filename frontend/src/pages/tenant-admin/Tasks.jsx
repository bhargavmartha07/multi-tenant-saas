import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import TaskModal from "./TaskModal";
import "./Dashboard.css";
import "./Tasks.css";

export default function Tasks({ projectId, apiUrl, compact = false }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showFilters, setShowFilters] = useState(!compact);

  // Filters + pagination
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(compact ? 3 : 10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [users, setUsers] = useState([]);

  const loadTasks = useCallback(async () => {
    if (!projectId && !apiUrl) return;
    try {
      setLoading(true);

      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assignedFilter) params.assignedTo = assignedFilter === '__unassigned' ? '' : assignedFilter;
      if (search) params.search = search;

      const url = apiUrl || `/projects/${projectId}/tasks`;
      const res = await api.get(url, { params });

      setTasks(res.data.data || []);
      if (res.data.pagination) setPagination(res.data.pagination);
      else setPagination({ page, limit, total: (res.data.data || []).length, pages: 1 });
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, apiUrl, page, limit, statusFilter, priorityFilter, assignedFilter, search]);

  useEffect(() => {
    let mounted = true;
    if (!projectId) return; // Only load project users if attached to a project

    const loadUsers = async () => {
      try {
        const p = await api.get(`/projects/${projectId}`);
        const tenantId = p.data.data.tenant_id;
        if (!tenantId) return;
        const res = await api.get(`/tenants/${tenantId}/users`);
        if (mounted) setUsers(res.data.data || []);
      } catch (err) {
        console.warn('Could not load tenant users for filter', err.response?.status || err.message);
      }
    };

    loadUsers();
    return () => { mounted = false; };
  }, [projectId]);

  const createTask = async () => {
    if (!title.trim()) return;

    try {
      await api.post(`/projects/${projectId}/tasks`, { title });
      setTitle("");
      setPage(1);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm("Delete task?")) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const changeStatus = async (task, status) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  useEffect(() => {
    if (projectId || apiUrl) {
      loadTasks();
    }
  }, [projectId, apiUrl, loadTasks]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'low': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.2)' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
      case 'in_progress': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' };
      case 'todo': return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' };
    }
  };

  return (
    <div className={`tasks-container ${compact ? 'compact' : ''}`}>
      <div className="tasks-header">
        <h5 className="tasks-title">Tasks</h5>
        {compact && tasks.length > 0 && projectId && (
          <Link
            to={`/tenant-admin/projects/${projectId}`}
            className="tasks-view-all"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
      </div>

      {/* Quick add - Only available within a project context */}
      {projectId && (
        <div className="task-quick-add">
          <input
            className="task-input"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createTask()}
          />
          <button className="btn btn-primary btn-sm" onClick={createTask}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add
          </button>
          {!compact && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
              Advanced
            </button>
          )}
        </div>
      )}

      {/* Filters - Collapsible in compact mode */}
      {(!compact || showFilters) && (
        <div className="task-filters">
          <div className="filter-row">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              className="filter-select"
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              <option value="__unassigned">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>

            <input
              className="filter-search"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => { setPage(1); loadTasks(); }}>
              Apply Filters
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              setAssignedFilter('');
              setSearch('');
              setPage(1);
              loadTasks();
            }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {compact && !showFilters && tasks.length > 0 && (
        <button
          className="toggle-filters-btn"
          onClick={() => setShowFilters(true)}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M3.33333 5H16.6667M6.66667 10H13.3333M8.33333 15H11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Show Filters
        </button>
      )}

      {/* Task List */}
      {loading ? (
        <div className="tasks-loading">
          {Array.from({ length: compact ? 2 : 3 }).map((_, i) => (
            <div key={i} className="task-item-skeleton">
              <div className="skeleton-line" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '40%' }}></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="tasks-empty">
          <p>No tasks yet. Add your first task above!</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => {
            const priorityStyle = getPriorityColor(t.priority);
            const statusStyle = getStatusColor(t.status);

            return (
              <li key={t.id} className="task-item">
                <div className="task-content">
                  <div className="task-main">
                    <h6 className="task-title">{t.title}</h6>
                    <div className="task-meta">
                      <span className="task-status-badge" style={{
                        background: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {t.status.replace('_', ' ')}
                      </span>
                      {t.priority && (
                        <span className="task-priority-badge" style={{
                          background: priorityStyle.bg,
                          color: priorityStyle.color,
                          border: `1px solid ${priorityStyle.border}`
                        }}>
                          {t.priority}
                        </span>
                      )}
                    </div>
                    {(t.assigned_to_name || t.due_date) && (
                      <div className="task-details">
                        {t.assigned_to_name && (
                          <span className="task-detail-item">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                              <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            {t.assigned_to_name}
                          </span>
                        )}
                        {t.due_date && (
                          <span className="task-detail-item">
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                              <path d="M2.5 7.5H17.5M13.3333 2.5V5M6.66667 2.5V5M4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            {new Date(t.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="task-actions">
                    <select
                      className="task-status-select"
                      value={t.status}
                      onChange={(e) => changeStatus(t, e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      className="btn-icon"
                      onClick={() => { setEditing(t); setModalOpen(true); }}
                      title="Edit task"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M11.6667 2.5L17.5 8.33333M15.8333 3.33333L17.5 1.66667L18.3333 2.5L16.6667 4.16667M15.8333 3.33333L11.6667 7.5M15.8333 3.33333L17.5 1.66667M2.5 17.5H6.66667L15.4167 8.75L11.25 4.58333L2.5 13.3333V17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(t)}
                      title="Delete task"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M5 5H15M8.33333 8.33333V13.3333M11.6667 8.33333V13.3333M4.16667 5V16.6667C4.16667 17.5871 4.91286 18.3333 5.83333 18.3333H14.1667C15.0871 18.3333 15.8333 17.5871 15.8333 16.6667V5M6.66667 5V3.33333C6.66667 2.41286 7.41286 1.66667 8.33333 1.66667H11.6667C12.5871 1.66667 13.3333 2.41286 13.3333 3.33333V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pagination - Hidden in compact mode */}
      {!compact && tasks.length > 0 && (
        <div className="task-pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Prev
          </button>
          <span className="pagination-info">
            Page {pagination.page} / {pagination.pages} — {pagination.total} tasks
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <label className="pagination-limit">
            Per page:
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="limit-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
        </div>
      )}

      {compact && tasks.length > limit && (
        <div className="tasks-more-indicator">
          <Link to={`/tenant-admin/projects/${projectId}`} className="tasks-view-more">
            +{pagination.total - tasks.length} more tasks
          </Link>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        initial={editing}
        projectId={projectId}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSuccess={() => loadTasks()}
      />
    </div>
  );
}
