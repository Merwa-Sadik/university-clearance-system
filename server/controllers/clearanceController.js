const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");
const { logAction } = require("../utils/auditLog");
const { createNotification } = require("../utils/notify");

const OFFICE_IDS = [1, 2, 3, 4, 5, 6, 7]; // Department, Library, Sport, Dormitory, Registrar, FacultyDean, DormitoryChief
const REGISTRAR_OFFICE_ID = 5;

// POST /api/clearance
const submitRequest = (req, res) => {
  db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id], (err, students) => {
    if (err) return sendError(res, "Database error", 500);
    if (students.length === 0) return sendError(res, "Student profile not found", 404);

    const studentId = students[0].id;

    // Only block if a Pending request exists — Rejected allows resubmission
    db.query(
      "SELECT id FROM clearance_requests WHERE student_id = ? AND overall_status = 'Pending'",
      [studentId],
      (err2, existing) => {
        if (err2) return sendError(res, "Database error", 500);
        if (existing.length > 0) return sendError(res, "You already have an active clearance request", 409);

        db.query(
          "INSERT INTO clearance_requests (student_id) VALUES (?)",
          [studentId],
          (err3, result) => {
            if (err3) return sendError(res, "Could not create request", 500);

            const requestId = result.insertId;
            const stepValues = OFFICE_IDS.map((officeId) => [requestId, officeId]);

            db.query(
              "INSERT INTO clearance_steps (clearance_request_id, office_id) VALUES ?",
              [stepValues],
              (err4) => {
                if (err4) return sendError(res, "Could not create clearance steps", 500);
                logAction(req.user.id, "SUBMIT_CLEARANCE", `Clearance request #${requestId} submitted`);
                createNotification(req.user.id, "Your clearance request has been submitted successfully.");
                sendSuccess(res, { id: requestId }, "Clearance request submitted successfully", 201);
              }
            );
          }
        );
      }
    );
  });
};

// DELETE /api/clearance/cancel  — student cancels their own pending request
const cancelRequest = (req, res) => {
  db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id], (err, students) => {
    if (err) return sendError(res, "Database error", 500);
    if (students.length === 0) return sendError(res, "Student profile not found", 404);

    const studentId = students[0].id;

    db.query(
      "SELECT id FROM clearance_requests WHERE student_id = ? AND overall_status = 'Pending'",
      [studentId],
      (err2, rows) => {
        if (err2) return sendError(res, "Database error", 500);
        if (rows.length === 0) return sendError(res, "No active clearance request to cancel", 404);

        const requestId = rows[0].id;

        db.query(
          "UPDATE clearance_requests SET overall_status = 'Rejected', updated_at = NOW() WHERE id = ?",
          [requestId],
          (err3) => {
            if (err3) return sendError(res, "Could not cancel request", 500);
            logAction(req.user.id, "CANCEL_CLEARANCE", `Student cancelled request #${requestId}`);
            createNotification(req.user.id, "Your clearance request has been cancelled.");
            sendSuccess(res, {}, "Clearance request cancelled");
          }
        );
      }
    );
  });
};

// GET /api/clearance/my-request  — returns only the LATEST request
const getMyRequest = (req, res) => {
  db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id], (err, students) => {
    if (err) return sendError(res, "Database error", 500);
    if (students.length === 0) return sendError(res, "Student profile not found", 404);

    // Get the single latest request id first
    db.query(
      "SELECT id FROM clearance_requests WHERE student_id = ? ORDER BY created_at DESC LIMIT 1",
      [students[0].id],
      (err2, latest) => {
        if (err2) return sendError(res, "Database error", 500);
        if (latest.length === 0) return sendSuccess(res, null, "No clearance request found");

        const latestId = latest[0].id;

        const sql = `
          SELECT cr.id, cr.overall_status, cr.created_at, cr.updated_at,
                 cs.id AS step_id, cs.office_id, cs.status AS step_status,
                 cs.comment, cs.approved_at,
                 o.office_name,
                 u.full_name AS approved_by_name
          FROM clearance_requests cr
          JOIN clearance_steps cs ON cs.clearance_request_id = cr.id
          JOIN offices o ON cs.office_id = o.id
          LEFT JOIN users u ON cs.approved_by = u.id
          WHERE cr.id = ?
          ORDER BY cs.office_id ASC
        `;

        db.query(sql, [latestId], (err3, rows) => {
          if (err3) return sendError(res, "Database error", 500);

          const request = {
            id: rows[0].id,
            overall_status: rows[0].overall_status,
            created_at: rows[0].created_at,
            updated_at: rows[0].updated_at,
            steps: rows.map((r) => ({
              step_id: r.step_id,
              office_id: r.office_id,
              office_name: r.office_name,
              status: r.step_status,
              comment: r.comment,
              approved_at: r.approved_at,
              approved_by_name: r.approved_by_name,
            })),
          };

          sendSuccess(res, request);
        });
      }
    );
  });
};

// GET /api/clearance/pending
const getPendingSteps = (req, res) => {
  const officeId = req.user.office_id;
  if (!officeId) return sendError(res, "No office assigned to your account", 403);

  const sql = `
    SELECT cs.id AS step_id, cs.status, cs.comment, cs.approved_at,
           cr.id AS request_id, cr.overall_status, cr.created_at,
           s.student_id, s.year_of_study,
           u.full_name, u.email,
           d.department_name
    FROM clearance_steps cs
    JOIN clearance_requests cr ON cs.clearance_request_id = cr.id
    JOIN students s ON cr.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN departments d ON s.department_id = d.id
    WHERE cs.office_id = ? AND cs.status = 'Pending' AND cr.overall_status = 'Pending'
    ORDER BY cr.created_at ASC
  `;

  db.query(sql, [officeId], (err, results) => {
    if (err) return sendError(res, "Database error", 500);
    sendSuccess(res, results);
  });
};

// GET /api/clearance/:id
const getRequestById = (req, res) => {
  const sql = `
    SELECT cr.id, cr.overall_status, cr.created_at, cr.updated_at,
           s.student_id, s.year_of_study,
           u.full_name, u.email,
           d.department_name,
           cs.id AS step_id, cs.office_id, cs.status AS step_status,
           cs.comment, cs.approved_at,
           o.office_name,
           approver.full_name AS approved_by_name
    FROM clearance_requests cr
    JOIN students s ON cr.student_id = s.id
    JOIN users u ON s.user_id = u.id
    JOIN departments d ON s.department_id = d.id
    JOIN clearance_steps cs ON cs.clearance_request_id = cr.id
    JOIN offices o ON cs.office_id = o.id
    LEFT JOIN users approver ON cs.approved_by = approver.id
    WHERE cr.id = ?
    ORDER BY cs.office_id ASC
  `;

  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return sendError(res, "Database error", 500);
    if (rows.length === 0) return sendError(res, "Clearance request not found", 404);

    const request = {
      id: rows[0].id,
      overall_status: rows[0].overall_status,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      student: {
        student_id: rows[0].student_id,
        full_name: rows[0].full_name,
        email: rows[0].email,
        department_name: rows[0].department_name,
        year_of_study: rows[0].year_of_study,
      },
      steps: rows.map((r) => ({
        step_id: r.step_id,
        office_id: r.office_id,
        office_name: r.office_name,
        status: r.step_status,
        comment: r.comment,
        approved_at: r.approved_at,
        approved_by_name: r.approved_by_name,
      })),
    };

    sendSuccess(res, request);
  });
};

// Shared approve/reject helper
const processStep = (req, res, newStatus) => {
  const { stepId } = req.params;
  const { comment } = req.body;
  const officeId = req.user.office_id;

  if (!officeId) return sendError(res, "No office assigned to your account", 403);

  const fetchSQL = `
    SELECT cs.id, cs.clearance_request_id, cs.office_id, cs.status,
           cr.student_id, cr.overall_status,
           s.user_id AS student_user_id
    FROM clearance_steps cs
    JOIN clearance_requests cr ON cs.clearance_request_id = cr.id
    JOIN students s ON cr.student_id = s.id
    WHERE cs.id = ?
  `;

  db.query(fetchSQL, [stepId], (err, rows) => {
    if (err) return sendError(res, "Database error", 500);
    if (rows.length === 0) return sendError(res, "Step not found", 404);

    const step = rows[0];

    if (step.office_id !== officeId) {
      return sendError(res, "You can only process your own office steps", 403);
    }

    if (step.overall_status !== "Pending") {
      return sendError(res, "This clearance request is no longer active", 400);
    }

    // Fix 5: Registrar (office 5) can only approve if all other offices approved first
    if (newStatus === "Approved" && officeId === REGISTRAR_OFFICE_ID) {
      db.query(
        `SELECT COUNT(*) AS pending_others
         FROM clearance_steps
         WHERE clearance_request_id = ? AND office_id != ? AND status != 'Approved'`,
        [step.clearance_request_id, REGISTRAR_OFFICE_ID],
        (errCheck, checkRows) => {
          if (errCheck) return sendError(res, "Database error", 500);
          if (checkRows[0].pending_others > 0) {
            return sendError(res, "All other offices must approve before the Registrar can approve", 400);
          }
          doUpdateStep(req, res, step, stepId, newStatus, comment);
        }
      );
    } else {
      doUpdateStep(req, res, step, stepId, newStatus, comment);
    }
  });
};

// Extracted update logic used by processStep
const doUpdateStep = (req, res, step, stepId, newStatus, comment) => {
  const requestId = step.clearance_request_id;

  db.query(
    "UPDATE clearance_steps SET status = ?, approved_by = ?, comment = ?, approved_at = NOW() WHERE id = ?",
    [newStatus, req.user.id, comment || null, stepId],
    (err2) => {
      if (err2) return sendError(res, "Could not update step", 500);

      if (newStatus === "Rejected") {
        db.query(
          "UPDATE clearance_requests SET overall_status = 'Rejected', updated_at = NOW() WHERE id = ?",
          [requestId],
          (err3) => {
            if (err3) return sendError(res, "Could not update request status", 500);
            logAction(req.user.id, "REJECT_STEP", `Step #${stepId} rejected on request #${requestId}`);
            createNotification(
              step.student_user_id,
              `Your clearance step was rejected. ${comment ? "Reason: " + comment : ""}`
            );
            sendSuccess(res, {}, "Step rejected");
          }
        );
      } else {
        db.query(
          "SELECT COUNT(*) AS total, SUM(status = 'Approved') AS approved FROM clearance_steps WHERE clearance_request_id = ?",
          [requestId],
          (err3, counts) => {
            if (err3) return sendError(res, "Could not verify steps", 500);

            const { total, approved } = counts[0];
            logAction(req.user.id, "APPROVE_STEP", `Step #${stepId} approved on request #${requestId}`);
            createNotification(step.student_user_id, "Your clearance step has been approved by an office.");

            if (Number(total) === Number(approved)) {
              db.query(
                "UPDATE clearance_requests SET overall_status = 'Approved', updated_at = NOW() WHERE id = ?",
                [requestId],
                (err4) => {
                  if (err4) return sendError(res, "Could not finalize request", 500);
                  createNotification(
                    step.student_user_id,
                    "🎉 Congratulations! Your clearance has been fully approved."
                  );
                  sendSuccess(res, {}, "Clearance fully approved!");
                }
              );
            } else {
              sendSuccess(res, {}, "Step approved");
            }
          }
        );
      }
    }
  );
};

const approveStep = (req, res) => processStep(req, res, "Approved");
const rejectStep  = (req, res) => processStep(req, res, "Rejected");

module.exports = {
  submitRequest,
  cancelRequest,
  getMyRequest,
  getPendingSteps,
  getRequestById,
  approveStep,
  rejectStep,
};
