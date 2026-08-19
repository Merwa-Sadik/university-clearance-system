import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card text-center max-w-sm">
        <p className="text-6xl font-bold text-blue-700 mb-2">404</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="btn-primary">Go Home</button>
      </div>
    </div>
  );
};

export default NotFound;
