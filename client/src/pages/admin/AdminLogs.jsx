import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

const ACTION_COLORS = {
  LOGIN:              "bg-blue-100 text-blue-700",
  REGISTER:           "bg-green-100 text-green-700",
  SUBMIT_CLEARANCE:   "bg-indigo-100 text-indigo-700",
  CANCEL_CLEARANCE:   "bg-orange-100 text-orange-700",
  APPROVE_STEP:       "bg-green-100 text-green-700",
  REJECT_STEP:        "bg-red-100 text-red-700",
  ADMIN_CREATE_USER:  "bg-purple-100 text-purple-700",
  ADMIN_UPDATE_USER:  "bg-yellow-100 text-yellow-700",
  ADMIN_DELETE_USER:  "bg-red-100 text-red-700",
  CLEAR_LOGS:         "bg-gray-100 text-gray-700",
};

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    api.get("/admin/logs")
      .then((r) => setLogs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleClear = async () => {
    setClearing(true);
    try {
      await api.delete("/admin/logs");
      setToast({ message: "All audit logs cleared.", type: "success" });
      setShowConfirm(false);
      fetchLogs();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setClearing(false);
    }
  };

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">{logs.length} entries</p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Clear All Logs
        </button>
      </div>

      <div className="card overflow-x-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">No audit logs found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Action", "Description", "User", "Date"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 uppercase pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600 max-w-xs truncate">{log.description || "—"}</td>
                  <td className="py-3 pr-4 text-gray-700 font-medium">{log.full_name || "System"}</td>
                  <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="font-bold text-gray-900 mb-2">Clear All Audit Logs?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete all <span className="font-semibold">{logs.length}</span> log entries. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleClear}
                disabled={clearing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {clearing ? "Clearing..." : "Yes, Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminLogs;
