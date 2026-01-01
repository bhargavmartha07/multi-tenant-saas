import React from "react";
import Tasks from "./Tasks";
import "./Dashboard.css";

export default function TasksPage() {
    return (
        <div className="dashboard-container">
            <div className="dashboard-card page-card">
                <div className="page-header">
                    <div>
                        <h1>All Tasks</h1>
                        <p className="dashboard-subtitle">Manage all tasks across projects</p>
                    </div>
                </div>

                {/* We use the generic /tasks endpoint to fetch all tasks for tenant */}
                <Tasks apiUrl="/tasks" />
            </div>
        </div>
    );
}
