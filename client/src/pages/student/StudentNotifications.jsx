import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get("/notifications")
      .then((r) => setNotifications(r.data.notifications))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(fetchNotifications);
  };

  const markAll = () => {
    api.patch("/notifications/read-all").then(fetchNotifications);
  };

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-secondary text-sm">Mark all as read</button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li key={n.id} className={`flex items-start justify-between gap-4 py-4 ${!n.is_read ? "bg-blue-50 -mx-6 px-6" : ""}`}>
                <div className="flex-1">
                  <p className={`text-sm ${!n.is_read ? "font-medium text-gray-900" : "text-gray-600"}`}>{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-blue-700 hover:underline shrink-0">
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentNotifications;
