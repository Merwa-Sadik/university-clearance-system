import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

const StudentClearance = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchRequest = () => {
    setLoading(true);
    api.get("/clearance/my-request")
      .then((r) => setRequest(r.data))
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequest(); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/clearance", {});
      setToast({ message: "Clearance request submitted!", type: "success" });
      fetchRequest();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-2xl font-bold text-gray-900 mb-1">My Clearance</h2>
      <p className="text-gray-500 text-sm mb-6">Track your clearance request status</p>

      {!request ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="font-semibold text-gray-900 mb-2">No Active Clearance Request</h3>
          <p className="text-sm text-gray-500 mb-6">Submit a clearance request to begin the process.</p>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Submit Clearance Request"}
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={request.overall_status} />
              {request.overall_status === "Rejected" && (
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm">
                  {submitting ? "Submitting..." : "Resubmit Request"}
                </button>
              )}
            </div>
          </div>

          {request.overall_status === "Rejected" && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700">Your clearance request was rejected.</p>
              <p className="text-xs text-red-600 mt-1">Review the comments below and click "Resubmit Request" to start a new clearance process.</p>
            </div>
          )}

          <div className="space-y-3">
            {request.steps.map((step, i) => (
              <div key={step.step_id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${step.status === "Approved" ? "bg-green-100 text-green-700" :
                      step.status === "Rejected" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-500"}`}>
                    {i + 1}
                  </div>
                  {i < request.steps.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{step.office_name}</p>
                    <StatusBadge status={step.status} />
                  </div>
                  {step.approved_by_name && (
                    <p className="text-xs text-gray-500 mt-0.5">By: {step.approved_by_name}</p>
                  )}
                  {step.comment && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded p-2 border border-gray-100">
                      "{step.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentClearance;
