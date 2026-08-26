require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

const sql = `
  -- 1. Delete unused Finance role (id=5, no users assigned to it)
  DELETE FROM roles WHERE id = 5 AND role_name = 'Finance';

  -- 2. Fix sport staff email: finance@ → sport@, role=8 (Sport), office=3
  UPDATE users SET email = 'sport@university.edu', role_id = 8, office_id = 3
  WHERE email = 'finance@university.edu';

  -- 3. Ensure dormchief has correct role (10) and office (7)
  UPDATE users SET role_id = 10, office_id = 7
  WHERE email = 'dormchief@university.edu';

  -- 4. Insert missing Faculty Dean user if not exists
  INSERT IGNORE INTO users (id, full_name, email, password, role_id, office_id) VALUES
    (11, 'Prof. David Ochieng', 'dean@university.edu',
     '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 9, 6);
`;

connection.query(sql, (err) => {
  if (err) {
    console.error("❌ Fix failed:", err.message);
  } else {
    console.log("✅ Database fixed successfully:");
    console.log("   - finance@university.edu renamed to sport@university.edu");
    console.log("   - Sport role (id=8) correctly assigned");
    console.log("   - Finance role (id=5) removed");
    console.log("   - dean@university.edu inserted (FacultyDean, office 6)");
    console.log("   - dormchief@university.edu role/office verified");
  }
  connection.end();
});
