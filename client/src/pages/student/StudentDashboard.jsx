import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";

const STEP_ICONS = { Approved: "✅", Rejected: "❌", Pending: "⏳" };

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/student")
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;
  if (error)   return <DashboardLayout><p className="text-red-600">{error}</p></DashboardLayout>;

  const cr = data?.clearance_request;

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.full_name}</h2>
      <p className="text-gray-500 text-sm mb-6">Here's your clearance overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Clearance Status</p>
          <div className="mt-2">
            {cr ? <StatusBadge status={cr.overall_status} /> : <span className="text-sm text-gray-400">Not submitted</span>}
          </div>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{cr ? `${cr.progress}%` : "0%"}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Unread Notifications</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{data?.unread_count || 0}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clearance Progress</h3>
        {!cr ? (
          <p className="text-sm text-gray-500">You have not submitted a clearance request yet.</p>
        ) : cr.overall_status === "Approved" ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🎉</span>
            </div>
            <h4 className="font-bold text-green-700 text-lg">Clearance Fully Approved!</h4>
            <p className="text-sm text-gray-500 mt-1">Congratulations! All offices have approved your clearance.</p>
          </div>
        ) : (
          <>
            {cr.overall_status === "Rejected" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">Request rejected — go to the Clearance page to resubmit.</p>
              </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
              <div className="bg-blue-700 h-2 rounded-full transition-all duration-500" style={{ width: `${cr.progress}%` }} />
            </div>
            <div className="space-y-3">
              {cr.steps.map((step) => (
                <div key={step.step_id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-lg">{STEP_ICONS[step.status]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{step.office_name}</p>
                      <StatusBadge status={step.status} />
                    </div>
                    {step.comment && <p className="text-xs text-gray-500 mt-1">Comment: {step.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Notifications</h3>
        {!data?.notifications?.length ? (
          <p className="text-sm text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.notifications.map((n) => (
              <li key={n.id} className={`text-sm p-3 rounded-lg border ${n.is_read ? "bg-white border-gray-100 text-gray-500" : "bg-blue-50 border-blue-100 text-gray-800 font-medium"}`}>
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
