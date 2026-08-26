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
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.delete("/clearance/cancel");
      setToast({ message: "Request cancelled successfully.", type: "info" });
      setShowCancelConfirm(false);
      fetchRequest();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  // ── Fully Approved screen ──────────────────────────────
  if (request?.overall_status === "Approved") {
    return (
      <DashboardLayout>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Clearance</h2>
        <p className="text-gray-500 text-sm mb-6">Track your clearance request status</p>

        <div className="card text-center py-14">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h3 className="text-2xl font-bold text-green-700 mb-2">Clearance Approved!</h3>
          <p className="text-gray-500 text-sm mb-6">
            Congratulations! Your clearance request has been fully approved by all offices.
          </p>
          <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Request ID</p>
            <p className="font-bold text-gray-900">#{request.id}</p>
          </div>
          {/* Show all approved steps */}
          <div className="text-left max-w-md mx-auto mt-4 space-y-2">
            {request.steps.map((step) => (
              <div key={step.step_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-sm font-medium text-gray-800">{step.office_name}</span>
                <StatusBadge status={step.status} />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── No request yet ─────────────────────────────────────
  if (!request) {
    return (
      <DashboardLayout>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Clearance</h2>
        <p className="text-gray-500 text-sm mb-6">Track your clearance request status</p>
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">📋</p>
          <h3 className="font-semibold text-gray-900 mb-2">No Active Clearance Request</h3>
          <p className="text-sm text-gray-500 mb-6">Submit a clearance request to begin the process.</p>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
            {submitting ? "Submitting..." : "Submit Clearance Request"}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Active (Pending or Rejected) request ───────────────
  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2 className="text-2xl font-bold text-gray-900 mb-1">My Clearance</h2>
      <p className="text-gray-500 text-sm mb-6">Track your clearance request status</p>

      <div className="card">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Submitted {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <StatusBadge status={request.overall_status} />
            {request.overall_status === "Pending" && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-lg font-medium transition-colors"
              >
                Cancel Request
              </button>
            )}
            {request.overall_status === "Rejected" && (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm">
                {submitting ? "Submitting..." : "Resubmit Request"}
              </button>
            )}
          </div>
        </div>

        {/* Rejection notice */}
        {request.overall_status === "Rejected" && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-700">Your clearance request was rejected.</p>
            <p className="text-xs text-red-600 mt-1">
              Review the comments below, then click "Resubmit Request" to start a new clearance process.
            </p>
          </div>
        )}

        {/* Steps */}
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

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <h3 className="font-bold text-gray-900 mb-2">Cancel Clearance Request?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will cancel your current request. You can submit a new one afterwards.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="btn-secondary flex-1">
                Keep Request
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentClearance;
