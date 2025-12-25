import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Tasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // Load Tasks
  // ======================
  const loadTasks = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/tasks?projectId=${projectId}`
      );

      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // Create Task
  // ======================
  const createTask = async () => {
    if (!title.trim()) return;

    try {
      await api.post("/tasks", {
        projectId,
        title
      });

      setTitle("");
      loadTasks();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  return (
    <div style={{ marginLeft: 20 }}>
      <h5>Tasks</h5>

      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={createTask}>Add</button>

      {loading && <p>Loading tasks...</p>}

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} — {t.status}
          </li>
        ))}
      </ul>

      {!loading && tasks.length === 0 && (
        <p>No tasks yet</p>
      )}
    </div>
  );
}
