import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🗳️</span>
          SyncMyClass
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/polls" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Polls
          </NavLink>
          <NavLink to="/subjects" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Subjects
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Notifications
          </NavLink>
          <NavLink to="/allocations" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Allocations
          </NavLink>
          {user.role === 'admin' && (
            <>
              <NavLink to="/create-poll" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Create Poll
              </NavLink>
              <NavLink to="/admin/subjects" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Manage Subjects
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-user">
          <span className="navbar-role">{user.role}</span>
          <span className="navbar-username">{user.name}</span>
          <div className="navbar-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
