import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../index.css";

export default function GlassLogin() {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server");
    }
  };

  return (
    <div className="glass-bg">
      <div className="glass-card">

        {}
        <div className="glass-left">
          <img src="/logo.png" alt="Logo"></img>
          <h1>SyncMyClass</h1>
          <p>Map Your Goals, Master Your Time, Make It Count !!!</p>
        </div>

        {}
        <div className="glass-right">
          <h3>User Login</h3>

          <input
            className="glass-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="glass-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="glass-btn" onClick={handleLogin}>
            Login
          </button>

          {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

          <div className="glass-link">Forgot password?</div>
        </div>

      </div>
    </div>
  );
}
