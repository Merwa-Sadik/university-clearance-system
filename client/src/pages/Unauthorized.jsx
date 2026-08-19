import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card text-center max-w-sm">
        <p className="text-5xl mb-4">🚫</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 mb-6">You don't have permission to view this page.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    </div>
  );
};

export default Unauthorized;
