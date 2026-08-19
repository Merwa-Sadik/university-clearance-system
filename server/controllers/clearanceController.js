const db = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");
const { logAction } = require("../utils/auditLog");
const { createNotification } = require("../utils/notify");

// Clearance offices in workflow order (office IDs from seed.sql)
const OFFICE_IDS = [1, 2, 3, 4, 5]; // Department, Library, Finance, Dormitory, Registrar

// POST /api/clearance
const submitRequest = (req, res) => {
  // Get student record for this user
  db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id], (err, students) => {
    if (err) return sendError(res, "Database error", 500);
    if (students.length === 0) return sendError(res, "Student profile not found", 404);

    const studentId = students[0].id;

    // Rule 1: no duplicate active requests
    const checkSQL = "SELECT id FROM clearance_requests WHERE student_id = ? AND overall_status = 'Pending'";
    db.query(checkSQL, [studentId], (err2, existing) => {
      if (err2) return sendError(res, "Database error", 500);
      if (existing.length > 0) return sendError(res, "You already have an active clearance request", 409);

      // Create the clearance request
      db.query(
        "INSERT INTO clearance_requests (student_id) VALUES (?)",
        [studentId],
        (err3, result) => {
          if (err3) return sendError(res, "Could not create request", 500);

          const requestId = result.insertId;

          // Create one step per office
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
    });
  });
};

// GET /api/clearance/my-request
const getMyRequest = (req, res) => {
  db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id], (err, students) => {
    if (err) return sendError(res, "Database error", 500);
    if (students.length === 0) return sendError(res, "Student profile not found", 404);

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
      WHERE cr.student_id = ?
      ORDER BY cr.created_at DESC, cs.office_id ASC
    `;

    db.query(sql, [students[0].id], (err2, rows) => {
      if (err2) return sendError(res, "Database error", 500);
      if (rows.length === 0) return sendSuccess(res, null, "No clearance request found");

      // Group steps under their request
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
  });
};

// GET /api/clearance/pending  (Staff sees pending steps for their office)
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

// Shared helper: update a step then recalculate overall_status
const processStep = (req, res, newStatus) => {
  const { stepId } = req.params;
  const { comment } = req.body;
  const officeId = req.user.office_id;

  if (!officeId) return sendError(res, "No office assigned to your account", 403);

  // Rule 2: staff can only process their own office's step
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

    // Rule 2
    if (step.office_id !== officeId) {
      return sendError(res, "You can only process your own office steps", 403);
    }

    // Rule 3: only process pending steps on active requests
    if (step.overall_status !== "Pending") {
      return sendError(res, "This clearance request is no longer active", 400);
    }

    // Update the step
    const updateStep = `
      UPDATE clearance_steps
      SET status = ?, approved_by = ?, comment = ?, approved_at = NOW()
      WHERE id = ?
    `;

    db.query(updateStep, [newStatus, req.user.id, comment || null, stepId], (err2) => {
      if (err2) return sendError(res, "Could not update step", 500);

      const requestId = step.clearance_request_id;

      if (newStatus === "Rejected") {
        // Rule 5: any rejection → overall Rejected
        db.query(
          "UPDATE clearance_requests SET overall_status = 'Rejected' WHERE id = ?",
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
        // Check if ALL steps are now approved → Rule 7
        db.query(
          "SELECT COUNT(*) AS total, SUM(status = 'Approved') AS approved FROM clearance_steps WHERE clearance_request_id = ?",
          [requestId],
          (err3, counts) => {
            if (err3) return sendError(res, "Could not verify steps", 500);

            const { total, approved } = counts[0];
            logAction(req.user.id, "APPROVE_STEP", `Step #${stepId} approved on request #${requestId}`);
            createNotification(step.student_user_id, `Your clearance step has been approved by an office.`);

            if (total === approved) {
              // All steps done → final approval
              db.query(
                "UPDATE clearance_requests SET overall_status = 'Approved' WHERE id = ?",
                [requestId],
                (err4) => {
                  if (err4) return sendError(res, "Could not finalize request", 500);
                  createNotification(
                    step.student_user_id,
                    "🎉 Congratulations! Your clearance has been fully approved."
                  );
                  sendSuccess(res, {}, "Step approved. Clearance fully completed!");
                }
              );
            } else {
              sendSuccess(res, {}, "Step approved");
            }
          }
        );
      }
    });
  });
};

const approveStep = (req, res) => processStep(req, res, "Approved");
const rejectStep  = (req, res) => processStep(req, res, "Rejected");

module.exports = {
  submitRequest,
  getMyRequest,
  getPendingSteps,
  getRequestById,
  approveStep,
  rejectStep,
};
