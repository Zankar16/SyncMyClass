import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="admin-wrapper admin-root">

      <main className="admin-main">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="admin-subtitle">System overview & controls</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-card stat-card">
            <h2>120</h2>
            <p>Total Users</p>
          </div>

          <div className="admin-card stat-card">
            <h2>15</h2>
            <p>Subjects</p>
          </div>

          <div className="admin-card stat-card">
            <h2>38</h2>
            <p>Bookings</p>
          </div>

          <div className="admin-card stat-card">
            <h2>4</h2>
            <p>Pending Requests</p>
          </div>
        </div>

        {/* Recent Activity */}
        <h2 className="section-title">Recent Activity</h2>
        <div className="admin-card activity-card">
          <p> New user registered</p>
          <p> New subject added</p>
          <p> New booking created</p>
        </div>

        {/* Actions */}
        <h2 className="section-title">Admin Actions</h2>

        <div className="admin-actions">
          <Link to="/admin/users" className="admin-card action-card">
            👥 Manage Users
          </Link>

          <Link to="/admin/subjects" className="admin-card action-card">
            📚 Manage Subjects
          </Link>

          <Link to="/admin/slots" className="admin-card action-card">
            ⏱ Manage Time Slots
          </Link>
        </div>

      </main>
    </div>
  );
}