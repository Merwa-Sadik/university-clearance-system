import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
  </div>
);

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/students/profile")
      .then((r) => setProfile(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;
  if (error)   return <DashboardLayout><p className="text-red-600">{error}</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
      <div className="card max-w-2xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {profile?.full_name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{profile?.full_name}</h3>
            <p className="text-sm text-gray-500">{profile?.student_id}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Full Name"      value={profile?.full_name} />
          <Field label="Email"          value={profile?.email} />
          <Field label="Student ID"     value={profile?.student_id} />
          <Field label="Department"     value={profile?.department_name} />
          <Field label="Year of Study"  value={profile?.year_of_study ? `Year ${profile.year_of_study}` : null} />
          <Field label="Phone"          value={profile?.phone} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
