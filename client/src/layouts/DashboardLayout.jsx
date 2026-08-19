import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = {
  Student: [
    { to: "/student/dashboard",      label: "Dashboard",      icon: "🏠" },
    { to: "/student/clearance",      label: "Clearance",      icon: "📋" },
    { to: "/student/profile",        label: "Profile",        icon: "👤" },
    { to: "/student/notifications",  label: "Notifications",  icon: "🔔" },
  ],
  Admin: [
    { to: "/admin/dashboard",   label: "Dashboard",   icon: "🏠" },
    { to: "/admin/users",       label: "Users",       icon: "👥" },
    { to: "/admin/departments", label: "Departments", icon: "🏛️" },
  ],
};

const staffNav = [
  { to: "/staff/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/staff/clearance", label: "Clearance",  icon: "📋" },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isStaff = !["Student", "Admin"].includes(user?.role);
  const links = isStaff ? staffNav : (navItems[user?.role] || []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-blue-800">
          <h1 className="font-bold text-sm leading-tight">Student Clearance<br />Management System</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <p className="text-xs text-blue-300 truncate">{user?.full_name}</p>
          <p className="text-xs text-blue-400 mb-3">{user?.role}</p>
          <button onClick={handleLogout} className="w-full text-left text-xs text-blue-300 hover:text-white transition-colors">
            → Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
