const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// GET /api/notifications
const getNotifications = (req, res) => {
  db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [req.user.id],
    (err, results) => {
      if (err) return sendError(res, "Database error", 500);

      const unread = results.filter((n) => !n.is_read).length;
      sendSuccess(res, { notifications: results, unread_count: unread });
    }
  );
};

// PATCH /api/notifications/:id/read
const markAsRead = (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, result) => {
      if (err) return sendError(res, "Database error", 500);
      if (result.affectedRows === 0) return sendError(res, "Notification not found", 404);
      sendSuccess(res, {}, "Marked as read");
    }
  );
};

// PATCH /api/notifications/read-all
const markAllAsRead = (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [req.user.id],
    (err) => {
      if (err) return sendError(res, "Database error", 500);
      sendSuccess(res, {}, "All notifications marked as read");
    }
  );
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
