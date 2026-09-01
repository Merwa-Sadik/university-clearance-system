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

async function init() {
  try {
    await runFile(path.join(__dirname, "schema.sql"), "schema.sql");
    await runFile(path.join(__dirname, "seed.sql"),   "seed.sql");
    console.log("\n🎉 Database ready. You can now start the server.");
  } catch {
    console.error("\n💡 Make sure MySQL is running and your .env credentials are correct.");
  } finally {
    connection.end();
  }
}

init();
