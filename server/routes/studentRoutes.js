const express = require("express");
const router = express.Router();
const { getAllStudents, getMyProfile, getStudentById } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("Admin", "Department", "Library", "Sport", "Dormitory", "Registrar", "FacultyDean", "DormitoryChief"), getAllStudents);
router.get("/profile", protect, authorize("Student"), getMyProfile);
router.get("/:id", protect, authorize("Admin", "Department", "Library", "Sport", "Dormitory", "Registrar", "FacultyDean", "DormitoryChief"), getStudentById);

module.exports = router;
