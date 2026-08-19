const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../utils/response");
const { logAction } = require("../utils/auditLog");

// POST /api/auth/register
const register = (req, res) => {
  const { full_name, email, password, role_id, office_id } = req.body;

  if (!full_name || !email || !password || !role_id) {
    return sendError(res, "full_name, email, password and role_id are required", 400);
  }

  // Check duplicate email
  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    if (results.length > 0) return sendError(res, "Email already registered", 409);

    try {
      const hashed = await bcrypt.hash(password, 10);
      const sql = "INSERT INTO users (full_name, email, password, role_id, office_id) VALUES (?, ?, ?, ?, ?)";
      db.query(sql, [full_name, email, hashed, role_id, office_id || null], (err2, result) => {
        if (err2) return sendError(res, "Could not create user", 500);
        const userId = result.insertId;
        logAction(userId, "REGISTER", `New user registered: ${email}`);

        // If registering as a student, also create the student profile
        if (parseInt(role_id) === 2) {
          const { student_id, department_id, year_of_study, phone } = req.body;
          if (!student_id || !department_id) {
            return sendSuccess(res, { id: userId }, "Registration successful", 201);
          }
          const studentSql = "INSERT INTO students (user_id, student_id, department_id, year_of_study, phone) VALUES (?, ?, ?, ?, ?)";
          db.query(studentSql, [userId, student_id, department_id, year_of_study || 1, phone || null], (err3) => {
            if (err3) return sendError(res, "User created but student profile failed: " + err3.message, 500);
            sendSuccess(res, { id: userId }, "Registration successful", 201);
          });
        } else {
          sendSuccess(res, { id: userId }, "Registration successful", 201);
        }
      });
    } catch {
      sendError(res, "Server error", 500);
    }
  });
};

// POST /api/auth/login
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, "Email and password are required", 400);
  }

  const sql = `
    SELECT u.id, u.full_name, u.email, u.password, u.office_id,
           r.role_name AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
  `;

  db.query(sql, [email], async (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    if (results.length === 0) return sendError(res, "Invalid email or password", 401);

    const user = results[0];

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return sendError(res, "Invalid email or password", 401);

      const token = jwt.sign(
        { id: user.id, role: user.role, office_id: user.office_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      logAction(user.id, "LOGIN", `User logged in: ${email}`);

      sendSuccess(res, {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          office_id: user.office_id,
        },
      }, "Login successful");
    } catch {
      sendError(res, "Server error", 500);
    }
  });
};

// GET /api/auth/me
const getMe = (req, res) => {
  const sql = `
    SELECT u.id, u.full_name, u.email, u.office_id, u.created_at,
           r.role_name AS role,
           o.office_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN offices o ON u.office_id = o.id
    WHERE u.id = ?
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    if (results.length === 0) return sendError(res, "User not found", 404);
    sendSuccess(res, results[0]);
  });
};

module.exports = { register, login, getMe };
