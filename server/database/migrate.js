require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

const sql = fs.readFileSync(path.join(__dirname, "migrate_offices.sql"), "utf8");

connection.query(sql, (err) => {
  if (err) {
    console.error("❌ Migration failed:", err.message);
  } else {
    console.log("✅ Office migration completed successfully");
    console.log("   - Finance renamed to Sport Office");
    console.log("   - Faculty Dean office added (id=6)");
    console.log("   - Dormitory Chief office added (id=7)");
    console.log("   - New roles: Sport, FacultyDean, DormitoryChief");
    console.log("   - Demo users: dean@university.edu, dormchief@university.edu");
  }
  connection.end();
});
