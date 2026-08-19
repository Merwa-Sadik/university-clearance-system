require("dotenv").config();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const demoEmails = [
  "admin@university.edu",
  "department@university.edu",
  "library@university.edu",
  "finance@university.edu",
  "dormitory@university.edu",
  "registrar@university.edu",
  "student@university.edu",
  "jane@university.edu",
];

async function fixPasswords() {
  const hash = await bcrypt.hash("Password123", 10);
  console.log("Generated hash:", hash);

  const placeholders = demoEmails.map(() => "?").join(", ");
  const sql = `UPDATE users SET password = ? WHERE email IN (${placeholders})`;

  connection.query(sql, [hash, ...demoEmails], (err, result) => {
    if (err) {
      console.error("❌ Failed:", err.message);
    } else {
      console.log(`✅ Updated ${result.affectedRows} user(s) with correct Password123 hash`);
    }
    connection.end();
  });
}

fixPasswords();
