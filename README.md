# Forge CRM — BDA / Sales Team Module (MERN)

A role-based sales CRM for a Business Development Associate (BDA) team in a
manufacturing company. Built from scratch on the MERN stack (MongoDB, Express,
React, Node.js). Manage a lead pipeline with drag-and-drop stages, log client
communication, track deal value, and view team performance.

> Built as a technical assessment submission. All code is original.

---

## Features

- **JWT authentication** with three roles: `admin`, `manager`, `associate`
- **Role-based data scoping** — associates see only their own leads; managers
  see their whole team's; admins see everything (enforced server-side)
- **Lead pipeline (Kanban)** — drag leads across six stages (New → Contacted →
  Qualified → Proposal → Won / Lost) with optimistic UI updates
- **Lead management** — create, edit, search, filter, delete (delete is
  manager/admin only); assign owners
- **Activity log** — per-lead notes, calls, and automatic stage-change history
- **Dashboard analytics** — pipeline value, won value, win rate, leads-by-stage chart
- **Team performance leaderboard** — per-associate totals, wins, and pipeline value
- Clean, responsive, editorial dark UI

---

## Tech Stack

| Layer    | Technology                                            |
|----------|-------------------------------------------------------|
| Frontend | React 18, React Router 6, Vite, Recharts, Axios       |
| Backend  | Node.js, Express 4, Mongoose 8                         |
| Database | MongoDB                                               |
| Auth     | JSON Web Tokens (jsonwebtoken), bcryptjs              |

---

## Project Structure

```
bda-crm/
├── server/                     # Express API
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── seed.js             # Demo-data seeder
│   ├── models/
│   │   ├── User.js             # User schema + roles + password hashing
│   │   └── Lead.js             # Lead schema + embedded activity log
│   ├── middleware/
│   │   ├── authMiddleware.js   # protect (JWT) + authorize (roles)
│   │   └── errorMiddleware.js  # notFound + central error handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── userRoutes.js
│   ├── server.js               # App entry point
│   ├── .env.example
│   └── package.json
│
└── client/                     # React (Vite) app
    ├── public/
    ├── src/
    │   ├── api/api.js           # Axios instance + token interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── LeadModal.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Pipeline.jsx
    │   │   ├── Leads.jsx
    │   │   └── Team.jsx
    │   ├── utils/helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Architecture Overview

```
┌──────────────┐     HTTP/JSON      ┌──────────────┐     Mongoose     ┌──────────┐
│  React (SPA) │  ───────────────▶  │  Express API │  ─────────────▶  │ MongoDB  │
│   Vite :5173 │   Axios + JWT      │  Node :5000  │                  │          │
└──────────────┘  ◀───────────────  └──────────────┘  ◀─────────────  └──────────┘
        │           Bearer token            │
        │                                   ├─ protect: verifies JWT
   AuthContext                              ├─ authorize: checks role
   stores token                            └─ scopeFilter: limits data by role
   in localStorage
```

**Request flow:** the client attaches the JWT as a `Bearer` token on every
request (Axios interceptor). `protect` verifies it and loads the user;
`authorize` gates role-restricted routes; controllers apply a `scopeFilter`
so each role only ever queries the data it is allowed to see.

---

## Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** — either local (`mongod`) or a free MongoDB Atlas cluster

---

## Setup & Run (Local)

Clone the repo, then run the backend and frontend in two terminals.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # then edit .env (see below)
npm run seed              # OPTIONAL: load demo users + leads
npm run dev               # starts API on http://localhost:5000
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/bda_crm
JWT_SECRET=any_long_random_string_here
CLIENT_URL=http://localhost:5173
```

> Using Atlas? Replace `MONGO_URI` with your connection string
> (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/bda_crm`).

### 2. Frontend

```bash
cd client
npm install
npm run dev               # starts app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the
backend automatically, so no client env config is needed.

---

## Demo Accounts

After running `npm run seed` (password is `password123` for all):

| Email             | Role      | Sees                              |
|-------------------|-----------|-----------------------------------|
| admin@crm.com     | admin     | All leads, all team data          |
| manager@crm.com   | manager   | Own + team leads, team leaderboard|
| arjun@crm.com     | associate | Only their own leads              |
| priya@crm.com     | associate | Only their own leads              |

You can also register a new associate account from the login screen.

---

## API Reference

| Method | Endpoint                       | Access            | Description                  |
|--------|--------------------------------|-------------------|------------------------------|
| POST   | `/api/auth/register`           | Public            | Register user                |
| POST   | `/api/auth/login`              | Public            | Login, returns JWT           |
| GET    | `/api/auth/me`                 | Auth              | Current user                 |
| GET    | `/api/leads`                   | Auth (scoped)     | List leads (`?stage=&search=`)|
| POST   | `/api/leads`                   | Auth              | Create lead                  |
| GET    | `/api/leads/:id`               | Auth              | Get one lead                 |
| PUT    | `/api/leads/:id`               | Auth              | Update lead                  |
| PATCH  | `/api/leads/:id/stage`         | Auth              | Move pipeline stage          |
| POST   | `/api/leads/:id/activities`    | Auth              | Add activity/note            |
| DELETE | `/api/leads/:id`               | Manager / Admin   | Delete lead                  |
| GET    | `/api/dashboard/stats`         | Auth (scoped)     | Aggregated metrics           |
| GET    | `/api/dashboard/team`          | Manager / Admin   | Team leaderboard             |
| GET    | `/api/users`                   | Manager / Admin   | List users (for assignment)  |

---

## Deployment Notes

- **Backend** → Render / Railway / Fly.io. Set the same env vars; use a
  MongoDB Atlas `MONGO_URI`.
- **Frontend** → Vercel / Netlify. Set the API base URL to your deployed
  backend (update the Axios `baseURL` or proxy), and add the frontend URL to
  `CLIENT_URL` on the backend for CORS.

---

## Production Build

```bash
cd client && npm run build     # outputs static files to client/dist
cd server && npm start         # serves the API
```

---

## License

MIT — original work created for assessment purposes.
