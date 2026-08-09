CREATE DATABASE IF NOT EXISTS student_clearance;
USE student_clearance;

-- ─────────────────────────────────────────
-- ROLES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- OFFICES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offices (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  office_name VARCHAR(100) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  full_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role_id    INT NOT NULL,
  office_id  INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id)   REFERENCES roles(id),
  FOREIGN KEY (office_id) REFERENCES offices(id)
);

-- ─────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  student_id    VARCHAR(20) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  year_of_study INT NOT NULL DEFAULT 1,
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ─────────────────────────────────────────
-- CLEARANCE REQUESTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clearance_requests (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  overall_status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- CLEARANCE STEPS  (one row per office per request)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clearance_steps (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  clearance_request_id INT NOT NULL,
  office_id           INT NOT NULL,
  status              ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  approved_by         INT DEFAULT NULL,
  comment             TEXT DEFAULT NULL,
  approved_at         TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (clearance_request_id) REFERENCES clearance_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id)            REFERENCES offices(id),
  FOREIGN KEY (approved_by)          REFERENCES users(id),
  UNIQUE KEY uq_request_office (clearance_request_id, office_id)
);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT DEFAULT NULL,
  action      VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_students_student_id  ON students(student_id);
CREATE INDEX idx_cr_student_id        ON clearance_requests(student_id);
CREATE INDEX idx_cr_status            ON clearance_requests(overall_status);
CREATE INDEX idx_cs_request_id        ON clearance_steps(clearance_request_id);
CREATE INDEX idx_cs_office_status     ON clearance_steps(office_id, status);
CREATE INDEX idx_notif_user_read      ON notifications(user_id, is_read);
