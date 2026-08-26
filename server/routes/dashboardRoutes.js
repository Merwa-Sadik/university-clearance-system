const express = require("express");
const router = express.Router();
const { studentDashboard, staffDashboard, adminDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const STAFF = ["Department", "Library", "Sport", "Dormitory", "Registrar", "FacultyDean", "DormitoryChief"];

router.get("/student", protect, authorize("Student"), studentDashboard);
router.get("/staff",   protect, authorize(...STAFF),  staffDashboard);
router.get("/admin",   protect, authorize("Admin"),   adminDashboard);

module.exports = router;
