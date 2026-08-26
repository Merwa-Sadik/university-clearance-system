const express = require("express");
const router = express.Router();
const {
  submitRequest,
  cancelRequest,
  getMyRequest,
  getPendingSteps,
  getRequestById,
  approveStep,
  rejectStep,
} = require("../controllers/clearanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const STAFF = ["Admin", "Department", "Library", "Sport", "Dormitory", "Registrar", "FacultyDean", "DormitoryChief"];

// Student routes
router.post("/", protect, authorize("Student"), submitRequest);
router.get("/my-request", protect, authorize("Student"), getMyRequest);
router.delete("/cancel", protect, authorize("Student"), cancelRequest);

// Staff routes
router.get("/pending", protect, authorize(...STAFF), getPendingSteps);
router.patch("/steps/:stepId/approve", protect, authorize(...STAFF), approveStep);
router.patch("/steps/:stepId/reject", protect, authorize(...STAFF), rejectStep);

// Shared - must come after specific routes
router.get("/:id", protect, authorize("Admin", ...STAFF), getRequestById);

module.exports = router;
