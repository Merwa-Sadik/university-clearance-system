# Student Clearance Management System

A full-stack web application for managing student clearance workflows across multiple university offices — built with React, Node.js/Express, and MySQL.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Overview

The Student Clearance Management System digitizes the university clearance process. Instead of physically visiting each office, students submit a single clearance request that is automatically routed through all required university offices. Each office staff member reviews and approves or rejects their assigned step. The student is notified at every stage and can track progress in real time. Administrators have full visibility over all users, requests, departments, and system activity.

---

## Features

- JWT-based authentication with role-aware redirects after login
- Student portal — submit, track, cancel, and resubmit clearance requests
- Per-office staff dashboards — each office only sees their own pending steps
- Approve or reject with an optional comment
- Registrar can only approve after all other offices have approved first
- Congratulations screen shown to students when clearance is fully approved
- In-app notifications sent on every status change
- Mark notifications as read individually or all at once
- Admin panel — full CRUD for users and departments
- Audit logs — every login, approval, and rejection is recorded
- Responsive UI built with Tailwind CSS — works on mobile and desktop
- Parameterized SQL queries throughout — no ORM, no raw string concatenation

---

## User Roles

| Role | Description |
|---|---|
| `Admin` | Full system access — manage users, departments, view all activity |
| `Student` | Submit clearance requests, track status, view notifications |
| `Department` | Approve/reject the Academic Department clearance step |
| `Library` | Approve/reject the Library clearance step |
| `Sport` | Approve/reject the Sport Office clearance step |
| `Dormitory` | Approve/reject the Dormitory clearance step |
| `Registrar` | Final approval — can only approve after all other offices have approved |
| `FacultyDean` | Approve/reject the Faculty Dean clearance step |
| `DormitoryChief` | Approve/reject the Dormitory Chief clearance step |

---

## Clearance Workflow

A clearance request passes through **7 offices**. All offices except the Registrar can be processed in any order. The Registrar step is the final gate — it can only be approved after all other 6 offices have approved.

```
Student submits request
        ↓
1. Academic Department
2. Library
3. Sport Office
4. Dormitory
5. Faculty Dean
6. Dormitory Chief
        ↓
7. Registrar  →  Overall status: Approved ✓
```

If any office rejects a step, the overall request is immediately marked **Rejected** and the student is notified with the reason. The student can then resubmit a fresh request after reviewing the comments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v3, React Router v7 |
| Backend | Node.js, Express 4 |
| Database | MySQL 8 via `mysql2` (raw SQL, no ORM) |
| Auth | `jsonwebtoken` + `bcrypt` |
| HTTP | Native `fetch()` — no Axios |

---

## Project Structure

```
university-clearance-system/
├── server/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── clearanceController.js # Submit, cancel, approve, reject
│   │   ├── studentController.js   # Student profile queries
│   │   ├── notificationController.js
│   │   ├── adminController.js     # User & department CRUD
│   │   └── dashboardController.js # Stats for each role
│   ├── database/
│   │   ├── schema.sql             # All tables, indexes, constraints
│   │   ├── seed.sql               # Demo roles, offices, departments, users
│   │   ├── init.js                # Runs schema + seed (npm run db:init)
│   │   ├── migrate_offices.sql    # Migration: rename Finance, add new offices
│   │   └── migrate.js             # Runs migration (npm run db:migrate)
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification → req.user
│   │   └── roleMiddleware.js      # authorize(...roles) guard
│   ├── routes/                    # Express route definitions
│   ├── utils/
│   │   ├── response.js            # sendSuccess / sendError helpers
│   │   ├── auditLog.js            # logAction() helper
│   │   └── notify.js             # createNotification() helper
│   ├── .env                       # Your local environment variables
│   ├── .env.example               # Template — safe to commit
│   ├── server.js                  # Express entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Spinner.jsx
│   │   │   ├── StatusBadge.jsx    # Pending / Approved / Rejected badge
│   │   │   └── Toast.jsx          # Success / error toast notifications
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Login, logout, session persistence
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Sidebar + main content shell
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Unauthorized.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── StudentClearance.jsx
│   │   │   │   ├── StudentProfile.jsx
│   │   │   │   └── StudentNotifications.jsx
│   │   │   ├── staff/
│   │   │   │   ├── StaffDashboard.jsx
│   │   │   │   └── StaffClearance.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminDepartments.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx # Role-based route guard
│   │   ├── services/
│   │   │   └── api.js             # fetch() wrapper with auto JWT header
│   │   ├── App.jsx                # All routes defined here
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind directives + utility classes
│   ├── .env                       # VITE_API_URL
│   ├── vite.config.js             # Dev server + /api proxy
│   └── package.json
│
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js >= 18
- MySQL 8.0+ running locally (recommended: XAMPP)

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

Edit `server/.env`:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=student_clearance

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=1d
```

> If you are using XAMPP, `DB_USER=root` and `DB_PASSWORD=` (empty) are the defaults.

---

### 3. Install backend dependencies

```bash
npm install
```

---

### 4. Initialize the database

Make sure MySQL is running, then:

```bash
npm run db:init
```

This creates all tables and inserts all demo data automatically.

Expected output:
```
✅ schema.sql executed successfully
✅ seed.sql executed successfully
🎉 Database ready. You can now start the server.
```

---

### 5. Start the backend

```bash
npm run dev
```

Expected output:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:5000
```

---

### 6. Configure and start the frontend

Open a new terminal:

```bash
cd client
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Migrating an Existing Database

If you already ran `db:init` with the old office structure (Finance instead of Sport Office), run the migration instead of reinitializing:

```bash
cd server
npm run db:migrate
```

This will:
- Rename `Finance` → `Sport Office`
- Add `Faculty Dean` office (id = 6)
- Add `Dormitory Chief` office (id = 7)
- Add matching roles: `Sport`, `FacultyDean`, `DormitoryChief`
- Add demo staff users for the two new offices

---

## Deploying with Render + Vercel + FreeSQLDatabase.com

### What you need
- A [FreeSQLDatabase.com](https://www.freesqldatabase.com) account — free MySQL database, no card needed
- A [Render](https://render.com) account — backend hosting
- A [Vercel](https://vercel.com) account — frontend hosting
- Your code pushed to a GitHub repository

---

### Step 1 — Get your free MySQL database

1. Go to [freesqldatabase.com](https://www.freesqldatabase.com)
2. Fill in the signup form with your email and password
3. Check your email — your database credentials will be sent automatically
4. Save these 5 values from the email:

| Variable | Example value |
|----------|---------------|
| `DB_HOST` | `sql.freesqldatabase.com` |
| `DB_PORT` | `3306` |
| `DB_USER` | `sql1234567` |
| `DB_PASSWORD` | `abc123xyz` |
| `DB_NAME` | `sql1234567` |

> Note: `DB_USER` and `DB_NAME` are usually the same value.

---

### Step 2 — Deploy the backend on Render

1. Go to [render.com](https://render.com) → sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Set **Root Directory** → `server`
5. Render auto-detects `render.yaml` — build and start commands fill in automatically
6. Add these **Environment Variables**:

```
DB_HOST        → paste from step 1
DB_PORT        → 3306
DB_USER        → paste from step 1
DB_PASSWORD    → paste from step 1
DB_NAME        → paste from step 1
DB_SSL         → false
JWT_SECRET     → any long random string e.g. mySuperSecretKey12345
JWT_EXPIRES_IN → 1d
CLIENT_URL     → http://localhost (temporary — update after step 3)
```

7. Click **Deploy** and wait for it to finish
8. Copy your backend URL — looks like `https://university-clearance-api.onrender.com`

**Seed the database:**

9. In Render → your web service → **Shell** tab → run:
```bash
node database/init.js
```
Expected output:
```
✅ schema.sql executed successfully
✅ seed.sql executed successfully
🎉 Database ready.
```

---

### Step 3 — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in
2. Click **Add New Project** → import your GitHub repository
3. Set **Root Directory** → `client`
4. Vercel auto-detects Vite — no build settings needed
5. Add this **Environment Variable**:

```
VITE_API_URL → https://university-clearance-api.onrender.com/api
```

> Replace with your actual Render URL from step 2.

6. Click **Deploy** and wait for it to finish
7. Copy your frontend URL — looks like `https://your-app.vercel.app`

---

### Step 4 — Connect frontend to backend (CORS)

1. Go back to **Render** → your web service → **Environment**
2. Update `CLIENT_URL`:

```
CLIENT_URL → https://your-app.vercel.app
```

3. Click **Manual Deploy** → **Deploy latest commit**

---

### Deployment Summary

| What | Platform | URL |
|------|----------|-----|
| Frontend | Vercel | `https://your-app.vercel.app` |
| Backend API | Render | `https://university-clearance-api.onrender.com` |
| MySQL Database | FreeSQLDatabase.com | External — credentials in env vars |

> **Note:** Render free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. This is normal on the free plan.

---

## Demo Accounts

All demo accounts use the password: **`Password123`**

| Role | Email |
|---|---|
| Admin | `admin@university.edu` |
| Student | `student@university.edu` |
| Student | `jane@university.edu` |
| Academic Department | `department@university.edu` |
| Library | `library@university.edu` |
| Sport Office | `sport@university.edu` |
| Dormitory | `dormitory@university.edu` |
| Registrar | `registrar@university.edu` |
| Faculty Dean | `dean@university.edu` |
| Dormitory Chief | `dormchief@university.edu` |

---

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register a new student | No |
| POST | `/auth/login` | Login, returns JWT token | No |
| GET | `/auth/me` | Get current user info | Yes |

### Students

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/students/profile` | Get own student profile | Student |
| GET | `/students` | List all students | Staff/Admin |
| GET | `/students/:id` | Get student by ID | Staff/Admin |

### Clearance

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/clearance` | Submit a new clearance request | Student |
| GET | `/clearance/my-request` | Get own latest request + steps | Student |
| DELETE | `/clearance/cancel` | Cancel active pending request | Student |
| GET | `/clearance/pending` | Get pending steps for my office | Staff |
| PATCH | `/clearance/steps/:stepId/approve` | Approve a step | Staff |
| PATCH | `/clearance/steps/:stepId/reject` | Reject a step | Staff |
| GET | `/clearance/:id` | Get a specific request | Staff/Admin |

### Notifications

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/notifications` | Get my notifications | Yes |
| PATCH | `/notifications/:id/read` | Mark one as read | Yes |
| PATCH | `/notifications/read-all` | Mark all as read | Yes |

### Admin

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/users` | List all users | Admin |
| POST | `/admin/users` | Create a user | Admin |
| PUT | `/admin/users/:id` | Update a user | Admin |
| DELETE | `/admin/users/:id` | Delete a user | Admin |
| GET | `/admin/departments` | List departments | Public |
| POST | `/admin/departments` | Create a department | Admin |
| PUT | `/admin/departments/:id` | Update a department | Admin |
| DELETE | `/admin/departments/:id` | Delete a department | Admin |

### Dashboard

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/dashboard/student` | Student stats + progress | Student |
| GET | `/dashboard/staff` | Office stats + recent requests | Staff |
| GET | `/dashboard/admin` | System-wide stats + activity | Admin |

### Health Check

```
GET /api/health
→ { "success": true, "message": "Server is running" }
```

---

## Database Schema

```
roles               (id, role_name)
offices             (id, office_name)
departments         (id, department_name)

users               (id, full_name, email, password, role_id → roles, office_id → offices, created_at)
students            (id, user_id → users, student_id, department_id → departments, year_of_study, phone, created_at)

clearance_requests  (id, student_id → students, overall_status ENUM(Pending,Approved,Rejected), created_at, updated_at)
clearance_steps     (id, clearance_request_id → clearance_requests, office_id → offices,
                     status ENUM(Pending,Approved,Rejected), approved_by → users, comment, approved_at)

notifications       (id, user_id → users, message, is_read, created_at)
audit_logs          (id, user_id → users, action, description, created_at)
```

---

## Business Rules

1. A student cannot submit a new request while one is still `Pending`
2. A student can resubmit after a `Rejected` or cancelled request
3. A student can cancel their own `Pending` request at any time
4. Each office staff can only process steps assigned to their office
5. The Registrar can only approve after all other 6 offices have approved
6. Any single rejection immediately marks the overall request as `Rejected`
7. When all 7 steps are approved the overall status becomes `Approved`
8. Every significant action is recorded in `audit_logs`

---

## Architecture Notes

**Raw SQL over ORM** — All database operations use parameterized `mysql2` queries directly. This makes the SQL visible and easy to understand, avoids ORM magic, and prevents SQL injection.

**Step-based clearance** — When a student submits a request, one `clearance_steps` row is created per office immediately. This means the full workflow is visible from day one and each office only ever updates their own row.

**Role in JWT** — The JWT payload carries `{ id, role, office_id }`. Middleware uses this to gate routes by role and restrict staff to their own office's steps without an extra DB lookup per request.

**Registrar gate** — Before the Registrar can approve, the backend counts how many non-Registrar steps are not yet `Approved`. If any remain, the request is rejected with a clear error message.

---

## Screenshots

> _Add screenshots here after running the application._

| Page | Description |
|---|---|
| Login | Role-aware login with redirect |
| Student Dashboard | Clearance progress, notifications |
| Student Clearance | Step-by-step tracker with cancel/resubmit |
| Staff Dashboard | Office stats and recent requests |
| Staff Clearance | Pending requests table with approve/reject modal |
| Admin Dashboard | System-wide statistics and activity log |
| Admin Users | Full user management with create/edit/delete |
| Admin Departments | Department management |

---

## Future Improvements

- Email notifications via Nodemailer when a step is approved or rejected
- PDF clearance certificate generation on final approval
- Student can upload supporting documents per clearance step
- Admin can configure the clearance workflow order dynamically
- Pagination on large tables (users, clearance requests)
- Dark mode support
- Two-factor authentication for admin accounts
