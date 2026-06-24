import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api';
import '../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      loginUser(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-bg">
      <div className="glass-login-card">

        {/* LEFT BRAND */}
        <div className="glass-left">
          <img src="/logo.png" alt="Logo" className="glass-logo" />
          <h1>SyncMyClass</h1>
          <p>Map Your Goals, Master Your Time, Make It Count !!!</p>
        </div>

        {/* RIGHT FORM */}
        <div className="glass-right">
          <h3>User Login</h3>
          
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              className="glass-input"
              type="email"
              placeholder="College Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="glass-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="glass-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {error && <div className="message message-error" style={{ marginTop: "10px", width: '100%', textAlign: 'center' }}>{error}</div>}

          <div className="glass-link" style={{ marginTop: '20px' }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
