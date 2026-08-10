USE student_clearance;

-- ─────────────────────────────────────────
-- ROLES
-- ─────────────────────────────────────────
INSERT IGNORE INTO roles (id, role_name) VALUES
  (1, 'Admin'),
  (2, 'Student'),
  (3, 'Department'),
  (4, 'Library'),
  (5, 'Finance'),
  (6, 'Dormitory'),
  (7, 'Registrar');

-- ─────────────────────────────────────────
-- OFFICES  (must match clearance workflow order)
-- ─────────────────────────────────────────
INSERT IGNORE INTO offices (id, office_name) VALUES
  (1, 'Academic Department'),
  (2, 'Library'),
  (3, 'Finance'),
  (4, 'Dormitory'),
  (5, 'Registrar');

-- ─────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────
INSERT IGNORE INTO departments (id, department_name) VALUES
  (1, 'Computer Science'),
  (2, 'Information Technology'),
  (3, 'Electrical Engineering'),
  (4, 'Mechanical Engineering'),
  (5, 'Civil Engineering'),
  (6, 'Business Administration'),
  (7, 'Accounting & Finance'),
  (8, 'Medicine'),
  (9, 'Law'),
  (10, 'Education');

-- ─────────────────────────────────────────
-- DEMO USERS
-- Passwords are bcrypt hashes of "Password123"
-- Generated with: bcrypt.hashSync("Password123", 10)
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (id, full_name, email, password, role_id, office_id) VALUES
  -- Admin (no office)
  (1, 'System Admin',       'admin@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NULL),

  -- Staff — one per office
  (2, 'Dr. Alice Mwangi',   'department@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1),

  (3, 'Mr. James Otieno',   'library@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 2),

  (4, 'Ms. Grace Wanjiku',  'finance@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 3),

  (5, 'Mr. Peter Kamau',    'dormitory@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 6, 4),

  (6, 'Mrs. Susan Njeri',   'registrar@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 7, 5),

  -- Students (no office)
  (7, 'John Doe',           'student@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, NULL),

  (8, 'Jane Smith',         'jane@university.edu',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, NULL);

-- ─────────────────────────────────────────
-- STUDENT PROFILES
-- ─────────────────────────────────────────
INSERT IGNORE INTO students (user_id, student_id, department_id, year_of_study, phone) VALUES
  (7, 'CS/2021/001', 1, 4, '+254700000001'),
  (8, 'IT/2022/045', 2, 3, '+254700000002');
