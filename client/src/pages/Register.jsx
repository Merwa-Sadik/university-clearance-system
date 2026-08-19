import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", confirm: "",
    student_id: "", department_id: "", year_of_study: "1", phone: "",
  });
  const [departments, setDepartments] = useState([]);
  const [deptError, setDeptError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/departments")
      .then((r) => setDepartments(r.data))
      .catch(() => setDeptError(true));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role_id: 2, // Student
        student_id: form.student_id,
        department_id: form.department_id,
        year_of_study: form.year_of_study,
        phone: form.phone,
      });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl font-bold">U</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Create Student Account</h2>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe" required {...f("full_name")} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" placeholder="you@university.edu" required {...f("email")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input type="text" className="input-field" placeholder="CS/2024/001" required {...f("student_id")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" className="input-field" placeholder="+254700000000" {...f("phone")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              {deptError ? (
                <p className="text-xs text-red-600">Could not load departments — make sure the server is running.</p>
              ) : (
                <select className="input-field" required {...f("department_id")}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <select className="input-field" {...f("year_of_study")}>
                {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" required {...f("password")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" className="input-field" placeholder="••••••••" required {...f("confirm")} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
