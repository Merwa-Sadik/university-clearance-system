# University Clearance System

A full-stack web application for managing student clearance workflows across multiple university offices — built with React, Node.js/Express, and MySQL.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Overview

The University Clearance System digitizes the student clearance process. Instead of physically visiting each office, students submit a single clearance request that is routed through all required university offices in sequence. Each office staff member can approve or reject their step, and the student is notified at every stage. Admins have full visibility over all requests and users.

---

## Roles

| Role         | Description                                              |
|--------------|----------------------------------------------------------|
| `Admin`      | Full system access — manage users, view all requests     |
| `Student`    | Submit clearance requests, track status, view history    |
| `Department` | Review and approve/reject the academic department step   |
| `Library`    | Review and approve/reject the library clearance step     |
| `Finance`    | Review and approve/reject the finance clearance step     |
| `Dormitory`  | Review and approve/reject the dormitory clearance step   |
| `Registrar`  | Final approval — issues the clearance certificate        |

---

## Clearance Workflow

A clearance request passes through **5 offices in order**:

```
Student submits request
        ↓
1. Academic Department
        ↓
2. Library
        ↓
3. Finance
        ↓
4. Dormitory
        ↓
5. Registrar  →  Overall status: Approved ✓
```

If any office rejects a step, the overall request is marked **Rejected** and the student is notified with the reason.

---

## Features

- **Authentication** — JWT-based login with role-aware redirects
- **Student Portal** — Submit clearance requests, track per-office status in real time
- **Office Dashboards** — Each office staff sees only their pending steps
- **Approve / Reject** — Staff can approve or reject with an optional comment
- **Admin Panel** — Manage users, view all clearance requests and audit logs
- **Notifications** — In-app notifications sent to students on every status change
- **Audit Logs** — Every action (login, approval, rejection) is recorded
- **Seed Data** — Demo accounts for every role ready out of the box

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS v3, React Router v7 |
| Backend  | Node.js, Express 4                  |
| Database | MySQL 8 via `mysql2`                |
| Auth     | JWT (`jsonwebtoken`) + `bcrypt`     |

---

## Folder Structure

```
university-clearance-system/
├── server/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/               # Route handler logic
│   ├── database/
│   │   ├── schema.sql             # Full DB schema (tables + indexes)
│   │   ├── seed.sql               # Demo roles, offices, departments & users
│   │   └── init.js                # Runs schema + seed against MySQL
│   ├── middleware/                # Auth & role-guard middleware
│   ├── models/                    # DB query helpers per resource
│   ├── routes/                    # Express route definitions
│   ├── services/                  # Business logic (notifications, clearance flow)
│   ├── utils/                     # Shared helpers (JWT, response wrappers)
│   ├── .env.example               # Environment variable template
│   ├── server.js                  # Express entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/            # Shared UI components
│   │   ├── context/               # Auth context / global state
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── layouts/               # Page layout wrappers (dashboard shell)
│   │   ├── pages/                 # Route-level page components
│   │   ├── routes/                # Protected & role-based route guards
│   │   ├── services/              # API call functions (axios/fetch wrappers)
│   │   ├── utils/                 # Frontend helpers
│   │   ├── App.jsx                # Root component & router setup
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind base styles
│   ├── .env                       # Frontend environment variables
│   ├── vite.config.js             # Vite config with API proxy
│   └── package.json
│
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js >= 18
- MySQL 8.0+ running locally

---

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd university-clearance-system
```

---

### 2. Configure the backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your MySQL credentials:
```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_clearance

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=1d
```

---

### 3. Initialize the database

Make sure MySQL is running, then:
```bash
npm install
npm run db:init
```

This runs `schema.sql` (creates all tables) then `seed.sql` (inserts demo data) automatically.

---

### 4. Start the backend
```bash
npm run dev
# API running at http://localhost:5000
```

---

### 5. Configure the frontend

```bash
cd ../client
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 6. Start the frontend
```bash
npm install
npm run dev
# App running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo Accounts

All demo accounts use the password: **`Password123`**

| Role         | Email                          |
|--------------|--------------------------------|
| Admin        | admin@university.edu           |
| Student      | student@university.edu         |
| Student      | jane@university.edu            |
| Department   | department@university.edu      |
| Library      | library@university.edu         |
| Finance      | finance@university.edu         |
| Dormitory    | dormitory@university.edu       |
| Registrar    | registrar@university.edu       |

---

## API Reference

Base URL: `http://localhost:5000/api`

---

### Auth

| Method | Endpoint         | Description              | Auth |
|--------|------------------|--------------------------|------|
| POST   | /auth/login      | Login, returns JWT token | No   |
| POST   | /auth/register   | Register a new student   | No   |
| GET    | /auth/me         | Get current user profile | Yes  |

**Login request:**
```json
{
  "email": "student@university.edu",
  "password": "Password123"
}
```
**Login response:**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": 7, "full_name": "John Doe", "role": "Student" }
}
```

---

### Students

| Method | Endpoint         | Description                    | Auth    |
|--------|------------------|--------------------------------|---------|
| GET    | /students/me     | Get own student profile        | Student |
| GET    | /students        | List all students              | Admin   |

---

### Clearance

| Method | Endpoint                        | Description                          | Auth          |
|--------|---------------------------------|--------------------------------------|---------------|
| POST   | /clearance                      | Submit a new clearance request       | Student       |
| GET    | /clearance/my                   | Get own clearance request & steps    | Student       |
| GET    | /clearance                      | List all requests                    | Admin         |
| GET    | /clearance/office               | Get pending steps for my office      | Staff         |
| PATCH  | /clearance/steps/:stepId        | Approve or reject a step             | Staff         |

**Approve/Reject step request:**
```json
{
  "status": "Approved",
  "comment": "All library books returned."
}
```

---

### Notifications

| Method | Endpoint                  | Description                  | Auth |
|--------|---------------------------|------------------------------|------|
| GET    | /notifications            | Get my notifications         | Yes  |
| PATCH  | /notifications/:id/read   | Mark a notification as read  | Yes  |

---

### Admin

| Method | Endpoint         | Description              | Auth  |
|--------|------------------|--------------------------|-------|
| GET    | /admin/users     | List all users           | Admin |
| GET    | /admin/logs      | View audit logs          | Admin |
| GET    | /dashboard       | System-wide stats        | Admin |

---

### Health Check
```
GET /api/health
→ { "success": true, "message": "Server is running" }
```

---

## Database Schema

```
roles          (id, role_name)
offices        (id, office_name)
departments    (id, department_name)

users          (id, full_name, email, password, role_id → roles, office_id → offices, created_at)
students       (id, user_id → users, student_id, department_id → departments, year_of_study, phone)

clearance_requests  (id, student_id → students, overall_status, created_at, updated_at)
clearance_steps     (id, clearance_request_id → clearance_requests, office_id → offices,
                     status, approved_by → users, comment, approved_at)

notifications  (id, user_id → users, message, is_read, created_at)
audit_logs     (id, user_id → users, action, description, created_at)
```

---

## Architecture & Trade-offs

**Multi-role JWT Auth**
A single `users` table holds all roles. The JWT payload carries `role_id` and `office_id`, allowing middleware to gate routes by role and restrict staff to only their own office's steps — no extra DB lookup needed per request.

**Clearance as a Step Machine**
Each clearance request spawns one `clearance_steps` row per office on creation. This means the full workflow is visible immediately (all steps start as `Pending`), and each office only ever updates their own row. The `overall_status` on `clearance_requests` is derived from the step states.

**MySQL over SQLite**
The relational complexity (7 tables, multiple foreign keys, role-based access) benefits from a proper RDBMS. MySQL's `ENUM` types enforce valid status values at the DB level. Trade-off: requires a running MySQL instance unlike a file-based DB.

**Audit Logs**
Every meaningful action writes to `audit_logs`. This is intentionally simple (no event bus) — a service helper function is called directly from controllers, keeping the overhead minimal while satisfying traceability requirements.

**Frontend Routing**
React Router v7 with layout-based route guards. Each role gets its own layout and protected route wrapper, so a student can never render an admin page even if they manually navigate to the URL.
