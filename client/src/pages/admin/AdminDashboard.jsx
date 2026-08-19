import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/admin")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Students", value: data?.total_students, color: "text-blue-700" },
          { label: "Total Users",    value: data?.total_users,    color: "text-indigo-600" },
          { label: "Pending",        value: data?.pending,        color: "text-amber-600" },
          { label: "Approved",       value: data?.approved,       color: "text-green-600" },
          { label: "Rejected",       value: data?.rejected,       color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Office stats */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Office Statistics</h3>
          <div className="space-y-3">
            {data?.office_stats?.map((o) => (
              <div key={o.office_name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">{o.office_name}</span>
                <div className="flex gap-3 text-xs">
                  <span className="text-amber-600">{o.pending} pending</span>
                  <span className="text-green-600">{o.approved} approved</span>
                  <span className="text-red-600">{o.rejected} rejected</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {!data?.recent_activity?.length ? (
            <p className="text-sm text-gray-500">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recent_activity.map((a, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium text-gray-800">{a.full_name || "System"}</span>
                  <span className="text-gray-500"> — {a.description}</span>
                  <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
