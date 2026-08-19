const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser, getDepartments } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Public route - no auth needed
router.get("/departments", getDepartments);

router.use(protect, authorize("Admin")); // all routes below require Admin

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
