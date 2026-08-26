USE student_clearance;

-- ─────────────────────────────────────────
-- ROLES
-- ─────────────────────────────────────────
INSERT IGNORE INTO roles (id, role_name) VALUES
  (1, 'Admin'),
  (2, 'Student'),
  (3, 'Department'),
  (4, 'Library'),
  (6, 'Dormitory'),
  (7, 'Registrar'),
  (8, 'Sport'),
  (9, 'FacultyDean'),
  (10, 'DormitoryChief');

-- ─────────────────────────────────────────
-- OFFICES
-- ─────────────────────────────────────────
INSERT IGNORE INTO offices (id, office_name) VALUES
  (1, 'Academic Department'),
  (2, 'Library'),
  (3, 'Sport Office'),
  (4, 'Dormitory'),
  (5, 'Registrar'),
  (6, 'Faculty Dean'),
  (7, 'Dormitory Chief');

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
-- All passwords = Password123
-- Hash generated with: bcrypt.hash('Password123', 10)
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (id, full_name, email, password, role_id, office_id) VALUES
  (1, 'System Admin',      'admin@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 1, NULL),

  (2, 'Dr. Alice Mwangi',  'department@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 3, 1),

  (3, 'Mr. James Otieno',  'library@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 4, 2),

  (4, 'Ms. Grace Wanjiku', 'sport@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 8, 3),

  (5, 'Mr. Peter Kamau',   'dormitory@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 6, 4),

  (6, 'Mrs. Susan Njeri',  'registrar@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 7, 5),

  (7, 'John Doe',          'student@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 2, NULL),

  (8, 'Jane Smith',        'jane@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 2, NULL),

  (9,  'Prof. David Ochieng', 'dean@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 9, 6),

  (10, 'Mr. Samuel Kipchoge', 'dormchief@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 10, 7);

-- ─────────────────────────────────────────
-- STUDENT PROFILES
-- ─────────────────────────────────────────
INSERT IGNORE INTO students (user_id, student_id, department_id, year_of_study, phone) VALUES
  (7, 'CS/2021/001', 1, 4, '+254700000001'),
  (8, 'IT/2022/045', 2, 3, '+254700000002');
