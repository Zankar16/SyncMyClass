import { Outlet, Link } from "react-router-dom";
import "./admin.css";

function AdminLayout() {
  return (
    <div className="admin-root admin-wrapper">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>

        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/users">Manage Users</Link>
          <Link to="/admin/subjects">Manage Subjects</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;