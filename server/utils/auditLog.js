const db = require("../config/db");

const logAction = (userId, action, description) => {
  const sql = "INSERT INTO audit_logs (user_id, action, description) VALUES (?, ?, ?)";
  db.query(sql, [userId, action, description], (err) => {
    if (err) console.error("Audit log error:", err.message);
  });
};

module.exports = { logAction };
