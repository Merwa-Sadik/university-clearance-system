import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

const StaffClearance = () => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { step, action }
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchSteps = () => {
    setLoading(true);
    api.get("/clearance/pending")
      .then((r) => setSteps(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSteps(); }, []);

  const openModal = (step, action) => { setModal({ step, action }); setComment(""); };
  const closeModal = () => { setModal(null); setComment(""); };

  const handleAction = async () => {
    setProcessing(true);
    const path = `/clearance/steps/${modal.step.step_id}/${modal.action}`;
    try {
      await api.patch(path, { comment });
      setToast({ message: `Step ${modal.action}d successfully`, type: "success" });
      closeModal();
      fetchSteps();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-2xl font-bold text-gray-900 mb-1">Pending Clearances</h2>
      <p className="text-gray-500 text-sm mb-6">{steps.length} student(s) awaiting your approval</p>

      {steps.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-semibold text-gray-900">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">No pending clearance requests for your office.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Student ID", "Name", "Department", "Year", "Request Date", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 uppercase pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {steps.map((s) => (
                <tr key={s.step_id}>
                  <td className="py-3 pr-4 font-mono text-xs">{s.student_id}</td>
                  <td className="py-3 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{s.department_name}</td>
                  <td className="py-3 pr-4 text-gray-500">Year {s.year_of_study}</td>
                  <td className="py-3 pr-4 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => openModal(s, "approve")} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg font-medium transition-colors">
                      Approve
                    </button>
                    <button onClick={() => openModal(s, "reject")} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg font-medium transition-colors">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-1 capitalize">{modal.action} Clearance Step</h3>
            <p className="text-sm text-gray-500 mb-4">
              Student: <span className="font-medium text-gray-800">{modal.step.full_name}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment {modal.action === "reject" ? "(required)" : "(optional)"}
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleAction}
                disabled={processing || (modal.action === "reject" && !comment.trim())}
                className={`flex-1 font-medium py-2 px-4 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  modal.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing ? "Processing..." : `Confirm ${modal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StaffClearance;
