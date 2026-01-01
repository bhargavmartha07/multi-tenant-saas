import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ProjectModal({ open, onClose, onSuccess, initial = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initial) {
      setName("");
      setDescription("");
      setStatus("active");
    } else {
      setName(initial.name || "");
      setDescription(initial.description || "");
      setStatus(initial.status || "active");
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Project name is required");

    setLoading(true);
    try {
      if (initial) {
        await api.put(`/projects/${initial.id}`, { name, description, status });
      } else {
        await api.post(`/projects`, { name, description, status });
      }
      onSuccess();
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
          <h3>{initial ? "Edit Project" : "Create Project"}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter project description"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
