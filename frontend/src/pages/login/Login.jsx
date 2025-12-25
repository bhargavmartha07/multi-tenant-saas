import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ CRITICAL

    console.log("LOGIN CLICKED"); // ✅ DEBUG

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE", res.data);

      const { token, user } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "super_admin") navigate("/super-admin");
      else if (user.role === "tenant_admin") navigate("/tenant-admin");
      else navigate("/user");

    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ padding: 40 }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button type="submit">Login</button>
    </form>
  );
}
