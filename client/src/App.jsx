import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus("Cannot reach server — make sure the backend is running"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">U</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Student Clearance Management System
        </h1>
        <p className="text-gray-500 text-sm mb-6">University of Excellence</p>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
            API Status
          </p>
          <p className="text-sm font-medium text-blue-700">{status}</p>
        </div>
        <p className="text-xs text-gray-400 mt-4">Phase 1 — Project Setup ✓</p>
      </div>
    </div>
  );
}

export default App;
