import { useEffect, useState } from "react";
import { api } from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

const ROLES = [
  { id: 1, name: "Admin" }, { id: 2, name: "Student" }, { id: 3, name: "Department" },
  { id: 4, name: "Library" }, { id: 5, name: "Finance" }, { id: 6, name: "Dormitory" }, { id: 7, name: "Registrar" },
];
const OFFICES = [
  { id: 1, name: "Academic Department" }, { id: 2, name: "Library" },
  { id: 3, name: "Finance" }, { id: 4, name: "Dormitory" }, { id: 5, name: "Registrar" },
];

const EMPTY_FORM = { full_name: "", email: "", password: "", role_id: "", office_id: "" };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // null | "create" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users").then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal("create"); };
  const openEdit = (u) => {
    setForm({ full_name: u.full_name, email: u.email, password: "", role_id: String(ROLES.find(r => r.name === u.role)?.id || ""), office_id: u.office_id || "" });
    setEditing(u);
    setModal("edit");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === "create") {
        await api.post("/admin/users", { ...form, role_id: Number(form.role_id), office_id: form.office_id || null });
        setToast({ message: "User created", type: "success" });
      } else {
        await api.put(`/admin/users/${editing.id}`, { full_name: form.full_name, email: form.email, role_id: Number(form.role_id), office_id: form.office_id || null });
        setToast({ message: "User updated", type: "success" });
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setToast({ message: "User deleted", type: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add User</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Name", "Email", "Role", "Office", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 uppercase pb-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-4 font-medium">{u.full_name}</td>
                <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                <td className="py-3 pr-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{u.role}</span>
                </td>
                <td className="py-3 pr-4 text-gray-500">{u.office_name || "—"}</td>
                <td className="py-3 pr-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => openEdit(u)} className="text-xs text-blue-700 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">{modal === "create" ? "Add User" : "Edit User"}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="input-field" required {...f("full_name")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input-field" required {...f("email")} />
              </div>
              {modal === "create" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" className="input-field" required {...f("password")} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="input-field" required {...f("role_id")}>
                  <option value="">Select role</option>
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office (staff only)</label>
                <select className="input-field" {...f("office_id")}>
                  <option value="">None</option>
                  {OFFICES.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
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

export default AdminUsers;
