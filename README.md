# SecureExam — Secure Online Examination System with AI-Assisted Proctoring

A full-stack online examination platform with two portals (Student and Admin),
server-side grading, question/option randomization, and browser-based
anti-cheating + webcam monitoring. Built for a college final-year / minor
project demonstration.

**Tech stack:** React (Vite) + Tailwind CSS on the frontend, Node.js + Express
on the backend, MongoDB + Mongoose for storage, JWT + bcrypt for auth, and
MediaPipe Tasks Vision for fully client-side face detection.

---

## 1. Install Node.js

Install **Node.js 18 or newer** from https://nodejs.org (includes npm).
Verify:

```bash
node -v
npm -v
```

## 2. Install MongoDB

Choose ONE option:

**Option A — Local MongoDB**
Install MongoDB Community Server from https://www.mongodb.com/try/download/community
and make sure it's running (`mongod`) on `mongodb://127.0.0.1:27017`.

**Option B — MongoDB Atlas (cloud, free tier)**
Create a free cluster at https://www.mongodb.com/atlas, create a database
user, allow your IP, and copy the connection string — you'll paste it into
`.env` in step 4.

## 3. Install dependencies

From the project root, in VS Code's terminal:

```bash
cd secure-exam
npm run install:all
```

This installs both `server/` and `client/` dependencies. (Equivalent to
running `npm install` inside each folder separately.)

## 4. Configure environment variables

```bash
cp .env.example server/.env
```

Open `server/.env` and fill in real values:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/secure_exam
JWT_SECRET=replace_this_with_a_long_random_secret_value
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

If using Atlas, replace `MONGODB_URI` with your Atlas connection string.
Never commit a real `.env` file — only `.env.example` is checked in.

## 5. Seed the database

This creates demo accounts, 2 exams, and 20+ questions across multiple
subjects and difficulty levels.

```bash
cd server
npm run seed
cd ..
```

## 6. Start the backend

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:5000`. Health check: `GET /api/health`.

## 7. Start the frontend

Open a **second terminal**:

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` calls to the
backend automatically (see `client/vite.config.js`).

## 8. Login credentials (DEMO ONLY — change or remove before real use)

| Portal  | Email               | Password       |
|---------|---------------------|----------------|
| Admin   | admin@example.com   | Admin@12345    |
| Student | student@example.com | Student@12345  |

These are seeded by `npm run seed` and are clearly for demonstration
purposes only. Rotate or delete them before any real deployment.

---

## 9. Project architecture

```
secure-exam/
├── client/                     React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/axios.js        Axios instance with JWT interceptor
│   │   ├── context/            AuthContext (login/register/logout)
│   │   ├── components/         Shared UI (layouts, badges, dialogs, webcam)
│   │   ├── hooks/               useTimer, useFullscreen, useProctoring
│   │   ├── lib/faceDetection.js MediaPipe wrapper (runs in-browser)
│   │   └── pages/
│   │       ├── student/        Login, Register, Dashboard, Exam, Results, Profile
│   │       └── admin/          Login, Dashboard, Students, Exams, Questions,
│   │                           Results, Monitoring, Violations, Settings
│   └── ...
├── server/                     Node.js + Express backend
│   ├── src/
│   │   ├── config/db.js        Mongoose connection
│   │   ├── models/             User, Exam, Question, ExamAttempt,
│   │   │                       ViolationEvent, Notification
│   │   ├── middleware/         auth (JWT + role check), validate, errorHandler
│   │   ├── controllers/        Business logic per resource
│   │   ├── routes/             Express routers, mounted in server.js
│   │   └── server.js           App entry point
│   └── seed/seed.js            Demo data generator
├── database/                   (MongoDB is schemaless; models live in server/)
├── .env.example
├── README.md
└── package.json                Convenience scripts for the whole repo
```

Role-based access is **always enforced server-side**: the JWT only carries a
user id; `middleware/auth.js` re-fetches the user from the database on every
request and `authorize('admin'|'student')` rejects mismatched roles. The
frontend's notion of "I am a student/admin" is for UI routing only and is
never trusted for authorization decisions.

---

## 10. Security features

- **Passwords** hashed with bcrypt (12 salt rounds), never returned by the API.
- **JWT** authentication with configurable expiry; secret loaded from `.env`.
- **Role-based authorization** enforced in middleware, re-checked from the DB
  on every request (a stale or tampered client claim cannot escalate role).
- **Helmet** for secure HTTP headers.
- **CORS** restricted to the configured `CLIENT_URL`.
- **Rate limiting**: a general API limiter plus a stricter limiter on the two
  login endpoints to slow brute-force attempts.
- **Input validation** on auth routes; defensive checks throughout controllers.
- **Mongo injection protection** via `express-mongo-sanitize`.
- **XSS protection** via `xss-clean` on incoming request bodies.
- **Request size limits** (`100kb`) to reduce abuse surface.
- **Centralized error handler** that hides stack traces in production and
  never leaks internal details in API responses.
- **Server-authoritative grading**: correct answers are never sent to the
  browser, and the final score is always recomputed on the server from the
  stored question bank — the frontend cannot influence marks.

## 11. AI monitoring

- Uses `getUserMedia` to access the student's webcam and
  `@mediapipe/tasks-vision` (BlazeFace, running via WebAssembly) entirely
  **in the browser** for face detection.
- Detects: no face present, multiple faces, and a coarse "looking away"
  signal derived from eye-keypoint offset (not a real 3-axis head-pose
  estimate — good enough to catch sustained, obvious looking-away).
- **No continuous video is ever uploaded or stored.** Only small event
  records (`eventType`, `severity`, `timestamp`, minimal metadata like a
  detected face count) are sent to the server and saved in
  `ViolationEvent` documents.
- **No facial recognition or identity verification is implemented** —
  the system counts and roughly orients faces, it does not know who anyone
  is beyond their login session.
- Grace periods (configurable per exam) prevent single-frame false
  positives from immediately logging a violation — a face must be absent,
  or a look-away sustained, for several seconds first.

## 12. Browser limitations (please read before your demo/viva)

JavaScript running inside a browser tab **cannot** guarantee cheating is
impossible. It cannot see or control:

- A second physical device (phone, tablet) used off-camera.
- OS-level screenshots or screen recording.
- Another computer on the same network.
- What happens outside the camera's field of view.
- Virtual machines, secondary monitors the browser isn't aware of, or
  browser extensions that intercept events before they reach the page (to a
  degree).

This project detects and deters what a browser *can* reasonably observe:
tab switches, window focus loss, fullscreen exits, clipboard use, right
click, common dev-tools shortcuts, and webcam-visible face anomalies. It
logs everything with a severity and an aggregate per-attempt risk score
(LOW/MEDIUM/HIGH/CRITICAL) for the admin to review — this is a **deterrent
and audit trail**, not a cheating-proof guarantee. State this explicitly in
any presentation of this project.

## 13. Production security recommendations

If this were to move beyond a classroom demo:

- Serve over HTTPS only; set `secure` cookies if you switch from
  header-based JWTs to cookies.
- Store `JWT_SECRET` in a proper secrets manager, rotate it periodically.
- Add refresh tokens / shorter access-token lifetimes.
- Add account lockout after repeated failed logins (the rate limiter here
  is a first line of defense, not a replacement).
- Run MongoDB with authentication enabled and least-privilege DB users.
- Add structured logging/monitoring (e.g. a proper log pipeline) instead of
  `morgan('dev')`.
- Add automated tests (unit + integration) around grading and auth, since
  those are the highest-stakes code paths.
- Consider WebSockets for live admin monitoring at scale instead of
  polling (this project uses polling deliberately for simplicity).

## 14. Troubleshooting

**Backend won't start / "MongoDB connection error"**
Make sure MongoDB is running locally, or that `MONGODB_URI` in `server/.env`
points to a reachable Atlas cluster (check your IP is allow-listed).

**Frontend can't reach the API / network errors**
Confirm the backend is running on port 5000 and `client/vite.config.js`'s
proxy target matches. Also check `CLIENT_URL` in `server/.env` matches
`http://localhost:5173` for CORS to succeed.

**Webcam permission denied**
The browser will show an "Inactive" camera status and log a
`WEBCAM_DISCONNECT` event; grant camera permission and refresh the
pre-exam check page. Webcam access requires `localhost` or HTTPS — it will
not work over plain HTTP on a non-localhost address.

**Face detection never loads / stays "unknown"**
`@mediapipe/tasks-vision` loads its WASM runtime and model from a CDN over
the network the first time. If you're offline, download the model locally
and update `lib/faceDetection.js` to serve it from `client/public/` instead.

**Login fails with seeded credentials**
Re-run `npm run seed` from `server/` — the seed script clears and
regenerates all demo data, including the admin/student accounts.

**Port already in use**
Change `PORT` in `server/.env`, or stop whatever else is using 5000/5173.

---

## License / academic use

Provided as-is for educational/demonstration purposes.
