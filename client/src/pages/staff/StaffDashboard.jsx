import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/staff")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  const s = data?.stats || {};

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Staff Dashboard</h2>
      <p className="text-gray-500 text-sm mb-6">{user?.full_name} — {user?.role} Office</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Pending",  value: s.pending,        color: "text-amber-600" },
          { label: "Approved", value: s.approved_today, color: "text-green-600" },
          { label: "Rejected", value: s.rejected,       color: "text-red-600"   },
          { label: "Total",    value: s.total,           color: "text-blue-700"  },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Requests</h3>
        {!data?.recent_requests?.length ? (
          <p className="text-sm text-gray-500">No requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Student ID", "Name", "Department", "Date", "Status"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recent_requests.map((r) => (
                  <tr key={r.step_id}>
                    <td className="py-3 pr-4 font-mono text-xs">{r.student_id}</td>
                    <td className="py-3 pr-4">{r.full_name}</td>
                    <td className="py-3 pr-4 text-gray-500">{r.department_name}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
