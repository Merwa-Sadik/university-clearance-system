import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDepts = () => {
    setLoading(true);
    api.get("/admin/departments").then((r) => setDepartments(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  const openCreate = () => { setEditing(null); setName(""); setModal(true); };
  const openEdit = (d) => { setEditing(d); setName(d.department_name); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/departments/${editing.id}`, { department_name: name });
        setToast({ message: "Department updated", type: "success" });
      } else {
        await api.post("/admin/departments", { department_name: name });
        setToast({ message: "Department created", type: "success" });
      }
      setModal(false);
      fetchDepts();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      setToast({ message: "Department deleted", type: "success" });
      fetchDepts();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Department</button>
      </div>

      <div className="card">
        {departments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No departments found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 uppercase pb-3 pr-4">#</th>
                <th className="text-left text-xs text-gray-500 uppercase pb-3 pr-4">Department Name</th>
                <th className="text-left text-xs text-gray-500 uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.map((d, i) => (
                <tr key={d.id}>
                  <td className="py-3 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{d.department_name}</td>
                  <td className="py-3 flex gap-3">
                    <button onClick={() => openEdit(d)} className="text-xs text-blue-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{editing ? "Edit Department" : "Add Department"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Computer Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDepartments;
