const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

// GET /api/dashboard/student
const studentDashboard = (req, res) => {
  db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id], (err, students) => {
    if (err) return sendError(res, "Database error", 500);
    if (students.length === 0) return sendError(res, "Student profile not found", 404);

    const studentId = students[0].id;

    const requestSQL = `
      SELECT cr.id, cr.overall_status, cr.created_at,
             cs.id AS step_id, cs.office_id, cs.status AS step_status,
             cs.comment, cs.approved_at, o.office_name
      FROM clearance_requests cr
      JOIN clearance_steps cs ON cs.clearance_request_id = cr.id
      JOIN offices o ON cs.office_id = o.id
      WHERE cr.student_id = ?
      ORDER BY cr.created_at DESC, cs.office_id ASC
    `;

    const notifSQL = `
      SELECT * FROM notifications WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 5
    `;

    db.query(requestSQL, [studentId], (err2, stepRows) => {
      if (err2) return sendError(res, "Database error", 500);

      db.query(notifSQL, [req.user.id], (err3, notifications) => {
        if (err3) return sendError(res, "Database error", 500);

        db.query(
          "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
          [req.user.id],
          (err4, unreadRows) => {
            if (err4) return sendError(res, "Database error", 500);

            let clearanceRequest = null;
            if (stepRows.length > 0) {
              const steps = stepRows.map((r) => ({
                step_id: r.step_id,
                office_id: r.office_id,
                office_name: r.office_name,
                status: r.step_status,
                comment: r.comment,
                approved_at: r.approved_at,
              }));

              const approved = steps.filter((s) => s.status === "Approved").length;
              const progress = Math.round((approved / steps.length) * 100);

              clearanceRequest = {
                id: stepRows[0].id,
                overall_status: stepRows[0].overall_status,
                created_at: stepRows[0].created_at,
                progress,
                steps,
              };
            }

            sendSuccess(res, {
              clearance_request: clearanceRequest,
              notifications: notifications,
              unread_count: unreadRows[0].unread,
            });
          }
        );
      });
    });
  });
};

// GET /api/dashboard/staff
const staffDashboard = (req, res) => {
  const officeId = req.user.office_id;
  if (!officeId) return sendError(res, "No office assigned", 403);

  const statsSQL = `
    SELECT
      SUM(status = 'Pending')  AS pending,
      SUM(status = 'Approved') AS approved_today,
      SUM(status = 'Rejected') AS rejected,
      COUNT(*)                 AS total
    FROM clearance_steps
    WHERE office_id = ?
  `;

  const recentSQL = `
    SELECT cs.id AS step_id, cs.status, cs.approved_at,
           cr.id AS request_id, cr.created_at,
           s.student_id, u.full_name, d.department_name
    FROM clearance_steps cs
    JOIN clearance_requests cr ON cs.clearance_request_id = cr.id
    JOIN students s ON cr.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN departments d ON s.department_id = d.id
    WHERE cs.office_id = ?
    ORDER BY cr.created_at DESC
    LIMIT 10
  `;

  db.query(statsSQL, [officeId], (err, stats) => {
    if (err) return sendError(res, "Database error", 500);

    db.query(recentSQL, [officeId], (err2, recent) => {
      if (err2) return sendError(res, "Database error", 500);
      sendSuccess(res, { stats: stats[0], recent_requests: recent });
    });
  });
};

// GET /api/dashboard/admin
const adminDashboard = (req, res) => {
  const queries = {
    total_students: "SELECT COUNT(*) AS count FROM students",
    total_users: "SELECT COUNT(*) AS count FROM users",
    pending: "SELECT COUNT(*) AS count FROM clearance_requests WHERE overall_status = 'Pending'",
    approved: "SELECT COUNT(*) AS count FROM clearance_requests WHERE overall_status = 'Approved'",
    rejected: "SELECT COUNT(*) AS count FROM clearance_requests WHERE overall_status = 'Rejected'",
  };

  const officeStatsSQL = `
    SELECT o.office_name,
           SUM(cs.status = 'Pending')  AS pending,
           SUM(cs.status = 'Approved') AS approved,
           SUM(cs.status = 'Rejected') AS rejected
    FROM offices o
    LEFT JOIN clearance_steps cs ON cs.office_id = o.id
    GROUP BY o.id, o.office_name
  `;

  const recentSQL = `
    SELECT al.action, al.description, al.created_at, u.full_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC LIMIT 10
  `;

  // Run all queries in parallel using a simple counter
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length + 2;

  const done = (err) => {
    if (err) return sendError(res, "Database error", 500);
    completed++;
    if (completed === total) {
      sendSuccess(res, results);
    }
  };

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, rows) => {
      if (err) return done(err);
      results[key] = rows[0].count;
      done(null);
    });
  });

  db.query(officeStatsSQL, (err, rows) => {
    if (err) return done(err);
    results.office_stats = rows;
    done(null);
  });

  db.query(recentSQL, (err, rows) => {
    if (err) return done(err);
    results.recent_activity = rows;
    done(null);
  });
};

module.exports = { studentDashboard, staffDashboard, adminDashboard };
