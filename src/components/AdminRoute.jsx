import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // expected: "admin"

  if (!token) {
    // not logged in
    return <Navigate to="/" />;
  }

  if (role !== "admin") {
    // logged in but not admin
    return <Navigate to="/home" />;
  }

  return children;
}

export default AdminRoute;