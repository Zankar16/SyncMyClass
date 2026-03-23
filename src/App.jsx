import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GlassLogin from "./components/GlassLogin";
import Home from "./components/Home";
import Queue from "./components/Queue";
import Booking from "./components/Booking";
import Confirmation from "./components/Confirmation";
import SubjectList from "./components/SubjectList";
import SubjectPage from "./components/SubjectPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

/* Admin */
import AdminDashboard from "./admin/AdminDashboard";
import ManageUsers from "./admin/ManageUsers";
import ManageSubjects from "./admin/ManageSubjects";
import AdminLayout from "./admin/AdminLayout";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/" element={<GlassLogin />} />

        {/* User */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/confirmation" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
        <Route path="/subject" element={<ProtectedRoute><SubjectList /></ProtectedRoute>} />
        <Route path="/subject/:id" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />

        {/* Admin */}
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<ManageUsers />} />
  <Route path="subjects" element={<ManageSubjects />} />
</Route>

      </Routes>
    </Router>
  );
}

export default App;