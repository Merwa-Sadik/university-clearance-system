require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

function runFile(filePath, label) {
  const sql = fs.readFileSync(filePath, "utf8");
  return new Promise((resolve, reject) => {
    connection.query(sql, (err) => {
      if (err) {
        console.error(`❌ Failed to run ${label}:`, err.message);
        reject(err);
      } else {
        console.log(`✅ ${label} executed successfully`);
        resolve();
      }
    });
  });
}

function createIndex(sql) {
  return new Promise((resolve) => {
    connection.query(sql, (err) => {
      if (err && err.errno !== 1061) console.warn(`⚠️ Index warning:`, err.message);
      resolve();
    });
  });
}

async function init() {
  try {
    await runFile(path.join(__dirname, "schema.sql"), "schema.sql");
    await runFile(path.join(__dirname, "seed.sql"),   "seed.sql");

    // Create indexes individually — DELIMITER not supported via mysql2 driver
    await createIndex("CREATE INDEX idx_users_email ON users(email)");
    await createIndex("CREATE INDEX idx_students_student_id ON students(student_id)");
    await createIndex("CREATE INDEX idx_cr_student_id ON clearance_requests(student_id)");
    await createIndex("CREATE INDEX idx_cr_status ON clearance_requests(overall_status)");
    await createIndex("CREATE INDEX idx_cs_request_id ON clearance_steps(clearance_request_id)");
    await createIndex("CREATE INDEX idx_cs_office_status ON clearance_steps(office_id, status)");
    await createIndex("CREATE INDEX idx_notif_user_read ON notifications(user_id, is_read)");

    console.log("\n🎉 Database ready. You can now start the server.");
  } catch {
    console.error("\n💡 Make sure MySQL is running and your .env credentials are correct.");
  } finally {
    connection.end();
  }
}

init();
