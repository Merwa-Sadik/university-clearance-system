import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentClearance from "./pages/student/StudentClearance";
import StudentProfile from "./pages/student/StudentProfile";
import StudentNotifications from "./pages/student/StudentNotifications";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffClearance from "./pages/staff/StaffClearance";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDepartments from "./pages/admin/AdminDepartments";

const STAFF_ROLES = ["Department", "Library", "Sport", "Dormitory", "Registrar", "FacultyDean", "DormitoryChief"];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={["Student"]}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/clearance" element={
            <ProtectedRoute allowedRoles={["Student"]}><StudentClearance /></ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={["Student"]}><StudentProfile /></ProtectedRoute>
          } />
          <Route path="/student/notifications" element={
            <ProtectedRoute allowedRoles={["Student"]}><StudentNotifications /></ProtectedRoute>
          } />

          {/* Staff */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}><StaffDashboard /></ProtectedRoute>
          } />
          <Route path="/staff/clearance" element={
            <ProtectedRoute allowedRoles={STAFF_ROLES}><StaffClearance /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["Admin"]}><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={["Admin"]}><AdminDepartments /></ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
