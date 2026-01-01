import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function TaskModal({ open, onClose, onSuccess, initial = null, projectId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initial) {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssignedTo("");
      setDueDate("");
    } else {
      setTitle(initial.title || "");
      setDescription(initial.description || "");
      setStatus(initial.status || "todo");
      setPriority(initial.priority || "medium");
      setAssignedTo(initial.assigned_to || "");
      // normalize due date to YYYY-MM-DD if present
      setDueDate(initial.due_date ? (initial.due_date.split ? initial.due_date.split('T')[0] : initial.due_date) : "");
    }
  }, [initial, open]);

  // fetch project -> tenant users for assignee dropdown
  useEffect(() => {
    if (!open || !projectId) return;
    let mounted = true;

    const loadUsers = async () => {
      try {
        // get project to learn tenant id
        const p = await api.get(`/projects/${projectId}`);
        const tenantId = p.data.data.tenant_id;
        if (!tenantId) return;
        const res = await api.get(`/tenants/${tenantId}/users`);
        if (mounted) setUsers(res.data.data || []);
      } catch (err) {
        // silently ignore (may not have permission); leave users empty
        console.warn('Could not load tenant users', err.response?.status || err.message);
      }
    };

    loadUsers();

    return () => { mounted = false; };
  }, [open, projectId]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Title is required");
    setLoading(true);
    try {
      const payload = {
        title,
        description: description || null,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null
      };

      if (initial) {
        // include status when editing
        payload.status = status;
        await api.put(`/tasks/${initial.id}`, payload);
      } else {
        await api.post(`/projects/${projectId}/tasks`, payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initial ? "Edit Task" : "Assign New Task"}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task summary"
              required
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details about this task..."
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            {initial && (
              <div className="form-group" style={{ flex: 1 }}>
                <label>Current Status</label>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            <div className="form-group" style={{ flex: 1 }}>
              <label>Priority Tier</label>
              <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Responsible Assignee</label>
            <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Unassigned (Open list)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Deadline / Due Date</label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : initial ? 'Save Updates' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
