import React, { useEffect, useState } from "react";
import api from "../../api/axios";

export default function TenantModal({ open, onClose, initial = null, onSuccess }) {
    const [name, setName] = useState("");
    const [status, setStatus] = useState("active");
    const [plan, setPlan] = useState("free");
    const [maxUsers, setMaxUsers] = useState(5);
    const [maxProjects, setMaxProjects] = useState(3);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Preset limits based on plan
    const planLimits = {
        free: { users: 5, projects: 3 },
        pro: { users: 25, projects: 15 },
        enterprise: { users: 100, projects: 50 }
    };

    useEffect(() => {
        if (initial) {
            setName(initial.name || "");
            setStatus(initial.status || "active");
            setPlan(initial.subscription_plan || "free");
            setMaxUsers(initial.max_users || 5);
            setMaxProjects(initial.max_projects || 3);
        } else {
            // Defaults for create (if we were supporting create here, but currently only update is requested)
            setName("");
            setStatus("active");
            setPlan("free");
            setMaxUsers(5);
            setMaxProjects(3);
        }
    }, [initial, open]);

    const handlePlanChange = (newPlan) => {
        setPlan(newPlan);
        if (planLimits[newPlan]) {
            setMaxUsers(planLimits[newPlan].users);
            setMaxProjects(planLimits[newPlan].projects);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = {
                name,
                status,
                subscription_plan: plan,
                max_users: Number(maxUsers),
                max_projects: Number(maxProjects)
            };

            if (initial?.id) {
                await api.put(`/tenants/${initial.id}`, payload);
            } else {
                // Create not supported in this modal yet based on requirements, but could be added
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to save tenant");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{initial ? "Edit Organization" : "Tenant Administration"}</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Organization Name</label>
                        <input
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter org name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Operating Status</label>
                        <select
                            className="input"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended / Deactivated</option>
                            <option value="trial">Trial Period</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Subscription Tier</label>
                        <select
                            className="input"
                            value={plan}
                            onChange={(e) => handlePlanChange(e.target.value)}
                        >
                            <option value="free">Standard (Free)</option>
                            <option value="pro">Pro Edition</option>
                            <option value="enterprise">Enterprise Logic</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: "16px" }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Max Users</label>
                            <input
                                type="number"
                                className="input"
                                value={maxUsers}
                                onChange={(e) => setMaxUsers(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Max Projects</label>
                            <input
                                type="number"
                                className="input"
                                value={maxProjects}
                                onChange={(e) => setMaxProjects(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Save Configuration"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
