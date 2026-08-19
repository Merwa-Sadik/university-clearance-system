const db = require("../config/db");

const createNotification = (userId, message) => {
  const sql = "INSERT INTO notifications (user_id, message) VALUES (?, ?)";
  db.query(sql, [userId, message], (err) => {
    if (err) console.error("Notification error:", err.message);
  });
};

module.exports = { createNotification };
