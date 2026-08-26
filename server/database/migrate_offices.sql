USE student_clearance;

-- ─────────────────────────────────────────
-- 1. Rename Finance → Sport Office
-- ─────────────────────────────────────────
UPDATE offices SET office_name = 'Sport Office' WHERE id = 3;

-- ─────────────────────────────────────────
-- 2. Add new offices (Faculty Dean, Dormitory Chief)
-- ─────────────────────────────────────────
INSERT IGNORE INTO offices (id, office_name) VALUES
  (6, 'Faculty Dean'),
  (7, 'Dormitory Chief');

-- ─────────────────────────────────────────
-- 3. Add matching roles
-- ─────────────────────────────────────────
INSERT IGNORE INTO roles (id, role_name) VALUES
  (8, 'Sport'),
  (9, 'FacultyDean'),
  (10, 'DormitoryChief');

-- ─────────────────────────────────────────
-- 4. Update existing Finance staff user → Sport Office role
-- ─────────────────────────────────────────
UPDATE users SET role_id = 8 WHERE email = 'finance@university.edu';

-- ─────────────────────────────────────────
-- 5. Add demo staff for new offices
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (id, full_name, email, password, role_id, office_id) VALUES
  (9,  'Prof. David Ochieng', 'dean@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 9, 6),

  (10, 'Mr. Samuel Kipchoge', 'dormchief@university.edu',
   '$2b$10$6NBisi3RORmEUI3B7lL4DOonG0gR9sHbd31lmhyw2.32WirK5V54e', 10, 7);
