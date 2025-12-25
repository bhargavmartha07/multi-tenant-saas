import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects")
      .then(res => {
        setProjects(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading projects...</p>;

  return (
    <div>
      <h2>Projects</h2>
      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <ul>
          {projects.map(p => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
