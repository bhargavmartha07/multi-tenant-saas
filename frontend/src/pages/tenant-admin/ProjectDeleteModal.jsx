import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ProjectDeleteModal({ open, onClose, project = null, onSuccess }) {
  const [force, setForce] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setForce(false);
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open || !project) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = `/projects/${project.id}${force ? "?force=true" : ""}`;
      await api.delete(url);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to archive project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Archive Project</h3>
        </div>

        <p>Are you sure you want to archive the project <strong style={{ color: "var(--primary-light)" }}>{project.name}</strong>?</p>
        <div className="form-group" style={{ background: "rgba(234, 179, 8, 0.1)", padding: "12px", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.85rem", color: "#facc15", margin: 0 }}>
            ⚠️ If the project has active tasks, archiving will fail unless you enable <strong>Force archive</strong>.
          </p>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                style={{ width: "auto", margin: 0 }}
              />
              <span>Force archive (Delete active tasks)</span>
            </label>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-danger">
              {loading ? "Archiving..." : "Confirm Archive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
