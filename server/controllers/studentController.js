const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const studentSelectSQL = `
  SELECT s.id, s.student_id, s.year_of_study, s.phone, s.created_at,
         u.full_name, u.email,
         d.department_name
  FROM students s
  JOIN users u ON s.user_id = u.id
  JOIN departments d ON s.department_id = d.id
`;

// GET /api/students  (Admin/Staff)
const getAllStudents = (req, res) => {
  db.query(studentSelectSQL + " ORDER BY s.created_at DESC", (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    sendSuccess(res, results);
  });
};

// GET /api/students/profile  (Student - own profile)
const getMyProfile = (req, res) => {
  db.query(studentSelectSQL + " WHERE s.user_id = ?", [req.user.id], (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    if (results.length === 0) return sendError(res, "Student profile not found", 404);
    sendSuccess(res, results[0]);
  });
};

// GET /api/students/:id  (Admin/Staff)
const getStudentById = (req, res) => {
  db.query(studentSelectSQL + " WHERE s.id = ?", [req.params.id], (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    if (results.length === 0) return sendError(res, "Student not found", 404);
    sendSuccess(res, results[0]);
  });
};

module.exports = { getAllStudents, getMyProfile, getStudentById };
