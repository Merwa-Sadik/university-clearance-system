require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

const sql = `
  -- Disable FK checks so we can truncate in any order
  SET FOREIGN_KEY_CHECKS = 0;

  TRUNCATE TABLE audit_logs;
  TRUNCATE TABLE notifications;
  TRUNCATE TABLE clearance_steps;
  TRUNCATE TABLE clearance_requests;

  -- Re-enable FK checks
  SET FOREIGN_KEY_CHECKS = 1;
`;

connection.query(sql, (err) => {
  if (err) {
    console.error("❌ Failed to clear data:", err.message);
  } else {
    console.log("✅ All logs and test data cleared:");
    console.log("   - audit_logs      → empty");
    console.log("   - notifications   → empty");
    console.log("   - clearance_steps → empty");
    console.log("   - clearance_requests → empty");
    console.log("");
    console.log("✅ Kept intact:");
    console.log("   - roles, offices, departments");
    console.log("   - all demo users");
  }
  connection.end();
});
