require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Initialize DB connection pool (runs connection test on import)
require("./config/db");

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/students",      require("./routes/studentRoutes"));
app.use("/api/clearance",     require("./routes/clearanceRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));
app.use("/api/dashboard",     require("./routes/dashboardRoutes"));

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
