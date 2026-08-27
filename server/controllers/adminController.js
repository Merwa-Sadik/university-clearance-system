const db = require("../config/db");
const bcrypt = require("bcrypt");
const { sendSuccess, sendError } = require("../utils/response");
const { logAction } = require("../utils/auditLog");

// GET /api/admin/users
const getAllUsers = (req, res) => {
  const sql = `
    SELECT u.id, u.full_name, u.email, u.office_id, u.created_at,
           r.role_name AS role,
           o.office_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN offices o ON u.office_id = o.id
    ORDER BY u.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    sendSuccess(res, results);
  });
};

// POST /api/admin/users
const createUser = (req, res) => {
  const { full_name, email, password, role_id, office_id } = req.body;
  if (!full_name || !email || !password || !role_id) {
    return sendError(res, "full_name, email, password and role_id are required", 400);
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, existing) => {
    if (err) return sendError(res, "Database error", 500);
    if (existing.length > 0) return sendError(res, "Email already exists", 409);

    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (full_name, email, password, role_id, office_id) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashed, role_id, office_id || null],
      (err2, result) => {
        if (err2) return sendError(res, "Could not create user", 500);
        logAction(req.user.id, "ADMIN_CREATE_USER", `Created user: ${email}`);
        sendSuccess(res, { id: result.insertId }, "User created", 201);
      }
    );
  });
};

// PUT /api/admin/users/:id
const updateUser = (req, res) => {
  const { full_name, email, role_id, office_id } = req.body;
  if (!full_name || !email || !role_id) {
    return sendError(res, "full_name, email and role_id are required", 400);
  }

  db.query(
    "UPDATE users SET full_name = ?, email = ?, role_id = ?, office_id = ? WHERE id = ?",
    [full_name, email, role_id, office_id || null, req.params.id],
    (err, result) => {
      if (err) return sendError(res, "Database error", 500);
      if (result.affectedRows === 0) return sendError(res, "User not found", 404);
      logAction(req.user.id, "ADMIN_UPDATE_USER", `Updated user ID: ${req.params.id}`);
      sendSuccess(res, {}, "User updated");
    }
  );
};

// DELETE /api/admin/users/:id
const deleteUser = (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return sendError(res, "You cannot delete your own account", 400);
  }

  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return sendError(res, "Database error", 500);
    if (result.affectedRows === 0) return sendError(res, "User not found", 404);
    logAction(req.user.id, "ADMIN_DELETE_USER", `Deleted user ID: ${req.params.id}`);
    sendSuccess(res, {}, "User deleted");
  });
};

// GET /api/admin/departments (public - used by register form)
const getDepartments = (req, res) => {
  db.query("SELECT id, department_name FROM departments ORDER BY department_name", (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    sendSuccess(res, results);
  });
};

// POST /api/admin/departments
const createDepartment = (req, res) => {
  const { department_name } = req.body;
  if (!department_name) return sendError(res, "department_name is required", 400);
  db.query("INSERT INTO departments (department_name) VALUES (?)", [department_name], (err, result) => {
    if (err) return sendError(res, "Could not create department", 500);
    sendSuccess(res, { id: result.insertId }, "Department created", 201);
  });
};

// PUT /api/admin/departments/:id
const updateDepartment = (req, res) => {
  const { department_name } = req.body;
  if (!department_name) return sendError(res, "department_name is required", 400);
  db.query("UPDATE departments SET department_name = ? WHERE id = ?", [department_name, req.params.id], (err, result) => {
    if (err) return sendError(res, "Database error", 500);
    if (result.affectedRows === 0) return sendError(res, "Department not found", 404);
    sendSuccess(res, {}, "Department updated");
  });
};

// DELETE /api/admin/departments/:id
const deleteDepartment = (req, res) => {
  db.query("DELETE FROM departments WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return sendError(res, "Database error", 500);
    if (result.affectedRows === 0) return sendError(res, "Department not found", 404);
    sendSuccess(res, {}, "Department deleted");
  });
};

// DELETE /api/admin/logs  — clear all audit logs
const clearLogs = (req, res) => {
  db.query("TRUNCATE TABLE audit_logs", (err) => {
    if (err) return sendError(res, "Could not clear logs", 500);
    logAction(req.user.id, "CLEAR_LOGS", "Admin cleared all audit logs");
    sendSuccess(res, {}, "Audit logs cleared");
  });
};

// GET /api/admin/logs
const getLogs = (req, res) => {
  const sql = `
    SELECT al.id, al.action, al.description, al.created_at,
           u.full_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 100
  `;
  db.query(sql, (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    sendSuccess(res, results);
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, getDepartments, createDepartment, updateDepartment, deleteDepartment, clearLogs, getLogs };
