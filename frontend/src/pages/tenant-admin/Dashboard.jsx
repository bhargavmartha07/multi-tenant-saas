import { useEffect, useState } from "react";
import api from "../../api/axios";
import Tasks from "./Tasks";

export default function TenantAdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // ======================
  // Load Projects
  // ======================
  const loadProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data.data);
  };

  // ======================
  // Create Project
  // ======================
  const createProject = async () => {
    if (!name) return alert("Project name required");

    await api.post("/projects", {
      name,
      description
    });

    setName("");
    setDescription("");
    loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Tenant Admin Dashboard</h1>

      {/* ======================
          CREATE PROJECT
      ====================== */}
      <h3>Create Project</h3>

      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br /><br />

      <button onClick={createProject}>Create</button>

      <hr />

      {/* ======================
          PROJECTS + TASKS
      ====================== */}
      <h3>Projects</h3>

      {projects.map((p) => (
        <div key={p.id} style={{ marginBottom: "30px" }}>
          <h4>
            {p.name} — {p.description || "No description"}
          </h4>

          {/* 🔗 STEP 7.2 — THIS IS THE LINE */}
          <Tasks projectId={p.id} />
        </div>
      ))}
    </div>
  );
}
