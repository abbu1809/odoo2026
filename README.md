<div align="center">

# 🚚 TransitOps

### Smart Transport & Fleet Operations Platform

*Dispatch trips, lock down vehicle/driver availability automatically, log fuel & maintenance, and surface fleet ROI — all behind a 5-role RBAC layer.*

[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Server-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📖 Table of Contents

- [What is TransitOps?](#-what-is-transitops)
- [Feature Highlights](#-feature-highlights)
- [Role-Based Access Control](#-role-based-access-control)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Structure](#-api-structure)
- [Database Schema](#-database-schema)
- [Getting Started — Docker Compose](#-getting-started--docker-compose-recommended)
- [Getting Started — Local Development](#-getting-started--local-development)
- [Demo Accounts](#-demo-accounts)
- [Roadmap / Future Scope](#-roadmap--future-scope)
- [Team](#-team)

---

## 🧭 What is TransitOps?

Fleet operators juggle the same five questions every day: *which vehicle is free, who's driving it, is it costing more than it earns, when is it due for service, and is the driver even licensed to take it out?* TransitOps answers all five from one dashboard.

It's a full-stack **fleet & transport operations management system**: a hardened Express/Prisma API and a React SPA, wired together so that every trip, fuel fill-up, maintenance ticket, and expense automatically keeps vehicle and driver state consistent — no manual bookkeeping, no double-booked trucks.

- 🚐 **Vehicle registry** with load capacity, odometer, and lifecycle status
- 🧑‍✈️ **Driver profiles** with license expiry and a live safety score
- 🗺️ **Trip lifecycle engine**: `DRAFT → DISPATCHED → COMPLETED / CANCELLED`, with guardrails that block overweight cargo, expired licenses, and unavailable assets
- 🔧 **Maintenance workflow** that auto-flips a vehicle to `IN_SHOP` on open and back to `AVAILABLE` on close
- ⛽ **Fuel & expense ledgers** tied to vehicles (and optionally trips)
- 📊 **Computed KPIs** — Fuel Efficiency, Operational Cost, Vehicle ROI, Fleet Utilization — with one-click CSV export
- 🔐 **5-role RBAC** (Admin, Fleet Manager, Driver, Safety Officer, Financial Analyst) enforced at the API layer

---

## ✨ Feature Highlights

| Module | Highlights |
|---|---|
| **Auth** | JWT bearer auth, bcrypt-hashed passwords, `/me` self-lookup |
| **Vehicles** | Registry with type/status/region filters, capacity & odometer tracking |
| **Drivers** | License category + expiry enforcement, safety score, availability status |
| **Trips** | State machine with automatic vehicle/driver locking & release, cargo-weight validation against vehicle capacity |
| **Maintenance** | Open/close tickets that drive vehicle status automatically |
| **Fuel Logs** | Per-vehicle fill-ups, optionally linked to the trip they were bought for |
| **Expenses** | Tolls, fines, permits, insurance — per-vehicle or fleet-wide |
| **Dashboard** | At-a-glance KPI cards |
| **Reports** | Fuel Efficiency · Operational Cost · ROI · Fleet Utilization, exportable as CSV |

---

## 🔐 Role-Based Access Control

Every route is gated by `requireAuth` + `requireRole(...)` middleware — this is not a UI-only convention, it's enforced server-side.

| Role | Access |
|---|---|
| **ADMIN** | Full control — user management, vehicle/driver deletion, everything below |
| **FLEET_MANAGER** | Create/update vehicles, drivers, trips, maintenance, fuel logs, expenses |
| **DRIVER** | Create/dispatch/complete trips, log fuel & expenses |
| **SAFETY_OFFICER** | Manage driver records (licenses, safety compliance) |
| **FINANCIAL_ANALYST** | Read-only — dashboard KPIs & reports (no write access to any resource) |

---

## 🏗️ Architecture

```
┌──────────────────┐        ┌───────────────────────┐        ┌──────────────────┐
│   React 19 SPA   │  REST  │   Express 5 API       │  SQL   │   PostgreSQL 16  │
│   (Vite + Nginx) │ ────▶ │   /api/v1/*  (JWT)    │ ─────▶ │   via Prisma ORM │
│   :5173 → :80    │  JSON  │   :4000               │        │   :5432          │
└──────────────────┘        └───────────────────────┘        └──────────────────┘
                                        │
                                        ▼
                              docker-entrypoint.sh
                          prisma migrate deploy → seed
```

Three containers, one Docker network, one named volume for Postgres data — orchestrated entirely by [`docker-compose.yml`](./docker-compose.yml).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, React Router-free SPA via tab state, Recharts (charts), Lucide (icons) |
| **Backend** | Node 24, Express 5, TypeScript, Zod (validation), JWT + bcryptjs (auth) |
| **Database** | PostgreSQL 16, Prisma ORM 7 (`@prisma/adapter-pg`) |
| **Infra** | Docker, Docker Compose, Nginx (static client), multi-stage Alpine images |
| **Middleware** | Helmet, CORS, Morgan, cookie-parser |

---

## 📂 Project Structure

```
odoo2026/
├── docker-compose.yml        # 3-service orchestration: db · server · client
├── .env.example               # Compose-level environment overrides
├── schema.md                  # Full data-model reference (source of truth)
│
├── server/                    # Express + Prisma REST API
│   ├── Dockerfile              # Multi-stage build (Alpine)
│   ├── docker-entrypoint.sh    # migrate deploy → conditional seed → start
│   ├── prisma/
│   │   ├── schema.prisma        # Models, enums, relations
│   │   ├── seed.ts              # Idempotent demo-data seeder
│   │   └── migrations/
│   └── src/
│       ├── app.ts               # Express app, middleware, route mounting
│       ├── server.ts            # Entry point
│       ├── config/              # env.ts, prisma.ts
│       ├── middleware/          # auth, error, validate
│       ├── utils/               # ApiError, jwt, csv, params
│       └── modules/             # one folder per domain — routes/service/validation
│           ├── auth/
│           ├── users/
│           ├── vehicles/
│           ├── drivers/
│           ├── trips/
│           ├── maintenance/
│           ├── fuel/
│           ├── expenses/
│           ├── dashboard/
│           └── reports/
│
└── Client/                    # React + Vite SPA
    ├── Dockerfile               # Multi-stage build → Nginx runtime
    ├── nginx.conf
    └── src/
        ├── api/                  # One file per resource (thin fetch wrappers)
        ├── context/              # AppContext — auth/session state
        ├── components/           # Navbar, Footer
        ├── pages/                # Dashboard, TripManagement, VehicleRegistry,
        │                         # DriverManagement, Maintenance, Expenses,
        │                         # Reports, Settings, LandingPage, LoginPage
        └── utils/                # enums.js (shared with backend enums)
```

Each backend module is self-contained (`*.routes.ts`, `*.service.ts`, `*.validation.ts`) — new domains slot in without touching existing ones.

---

## 🔌 API Structure

Base URL: **`/api/v1`** · Health check: `GET /health` (no prefix, no auth)

All routes below require `Authorization: Bearer <token>` unless noted **public**. Roles shown are the *write* roles — reads are open to any authenticated user.

| Resource | Endpoint | Method | Access |
|---|---|---|---|
| **Auth** | `/auth/register` | `POST` | Public |
| | `/auth/login` | `POST` | Public |
| | `/auth/me` | `GET` | Any authenticated user |
| **Users** | `/users`, `/users/:id` | `GET` | Admin |
| | `/users/:id` | `PATCH` | Admin |
| **Vehicles** | `/vehicles`, `/vehicles/:id` | `GET` | Any |
| | `/vehicles` | `POST` | Admin, Fleet Manager |
| | `/vehicles/:id` | `PATCH` | Admin, Fleet Manager |
| | `/vehicles/:id` | `DELETE` | Admin |
| **Drivers** | `/drivers`, `/drivers/:id` | `GET` | Any |
| | `/drivers` | `POST` | Admin, Fleet Manager, Safety Officer |
| | `/drivers/:id` | `PATCH` | Admin, Fleet Manager, Safety Officer |
| | `/drivers/:id` | `DELETE` | Admin |
| **Trips** | `/trips`, `/trips/:id` | `GET` | Any |
| | `/trips` | `POST` | Admin, Fleet Manager, Driver |
| | `/trips/:id` | `PATCH` | Admin, Fleet Manager, Driver *(DRAFT only)* |
| | `/trips/:id/dispatch` | `POST` | Admin, Fleet Manager, Driver |
| | `/trips/:id/complete` | `POST` | Admin, Fleet Manager, Driver |
| | `/trips/:id/cancel` | `POST` | Admin, Fleet Manager, Driver |
| **Maintenance** | `/maintenance`, `/maintenance/:id` | `GET` | Any |
| | `/maintenance` | `POST` | Admin, Fleet Manager |
| | `/maintenance/:id` | `PATCH` | Admin, Fleet Manager |
| | `/maintenance/:id/close` | `POST` | Admin, Fleet Manager |
| **Fuel Logs** | `/fuel-logs`, `/fuel-logs/:id` | `GET` | Any |
| | `/fuel-logs` | `POST` | Admin, Fleet Manager, Driver |
| | `/fuel-logs/:id` | `PATCH` / `DELETE` | Admin, Fleet Manager, Driver |
| **Expenses** | `/expenses`, `/expenses/:id` | `GET` | Any |
| | `/expenses` | `POST` | Admin, Fleet Manager, Driver |
| | `/expenses/:id` | `PATCH` / `DELETE` | Admin, Fleet Manager, Driver |
| **Dashboard** | `/dashboard/kpis` | `GET` | Any |
| **Reports** | `/reports/overview` (+`?format=csv`) | `GET` | Any |

Every mutating route runs through a Zod schema in `*.validation.ts` before it touches the database.

---

## 🗄️ Database Schema

Modeled with Prisma on PostgreSQL — full column-level reference lives in **[`schema.md`](./schema.md)**. Summary:

```
User ──< Driver (optional 1:1)        Vehicle ──< Trip
User ──< Trip / MaintenanceLog        Vehicle ──< MaintenanceLog
User ──< FuelLog / Expense            Vehicle ──< FuelLog / Expense
                                       Driver  ──< Trip
                                       Trip    ──< FuelLog (optional)
```

**Derived KPIs** (computed in `modules/reports`, not stored columns):

| Metric | Formula |
|---|---|
| Fuel Efficiency (km/L) | `Σ Trip.actualDistanceKm / Σ FuelLog.liters` |
| Operational Cost | `Σ FuelLog.cost + Σ MaintenanceLog.cost` |
| Vehicle ROI | `(Σ Trip.revenue − Operational Cost) / Vehicle.acquisitionCost` |
| Fleet Utilization % | `count(status = ON_TRIP) / count(status ≠ RETIRED) × 100` |

---

## 🚀 Getting Started — Docker Compose (recommended)

The fastest path to a fully working stack — Postgres, API, and SPA — with **zero manual DB setup**. Migrations and demo data are applied automatically on first boot.

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose v2

### 1. Clone & configure

```bash
git clone <this-repo-url>
cd odoo2026
cp .env.example .env
```

The defaults in `.env` work out of the box for local use — only change them if a port is already taken or you're deploying somewhere real (rotate `JWT_SECRET` first).

### 2. Bring the stack up

```bash
docker compose up --build -d
```

Under the hood, `docker-compose.yml` starts three services:

| Service | Image / Build | Purpose |
|---|---|---|
| `db` | `postgres:16-alpine` | Database, with a healthcheck (`pg_isready`) the API waits on |
| `server` | built from `./server` | API — waits for `db` to be healthy, then runs its entrypoint |
| `client` | built from `./Client` | React SPA, built and served by Nginx |

On startup, `server/docker-entrypoint.sh` runs, in order:

```bash
npx prisma migrate deploy        # applies every migration in prisma/migrations
node dist/prisma/seed.js         # runs server/prisma/seed.ts — idempotent, safe to re-run
```

**[`prisma/seed.ts`](./server/prisma/seed.ts)** upserts everything by its unique key (email, registration number, license number), so re-running it — which happens on *every* container restart by default — never duplicates data. It seeds:

- 5 demo users (one per role — see [Demo Accounts](#-demo-accounts))
- 5 vehicles across every status (`AVAILABLE`, `IN_SHOP`, `RETIRED`) and type (van, truck, bus, car, trailer)
- 4 drivers spanning every `DriverStatus`, including an expiring license and a suspended driver — useful for exercising the trip guardrails
- One completed sample trip with a linked fuel log, expense, and two maintenance logs (one open, one closed) — so the Dashboard and Reports pages aren't empty on first login

Once you no longer want fresh demo data recreated on every restart, set in `.env`:

```bash
SEED_ON_START=false
```

### 3. Open it

| | URL |
|---|---|
| **Client (SPA)** | http://localhost:5173 |
| **API base** | http://localhost:4000/api/v1 |
| **Health check** | http://localhost:4000/health |

> ⚠️ `VITE_API_BASE_URL` is baked into the client bundle **at build time** (Vite convention). If you change it in `.env`, you must rebuild the client image: `docker compose build client && docker compose up -d client`.

### 4. Tear down

```bash
docker compose down          # stop containers, keep the pgdata volume
docker compose down -v       # also wipe the database volume
```

---

## 🧑‍💻 Getting Started — Local Development

Prefer running each piece natively (hot reload, debugger attached)? You'll need Node 24+, npm, and a local/remote PostgreSQL instance.

### Backend

```bash
cd server
cp .env.example .env          # point DATABASE_URL at your own Postgres
npm install
npm run prisma:migrate         # creates tables from schema.prisma
npm run prisma:seed            # builds + runs prisma/seed.ts
npm run dev                    # ts-node-dev, hot reload on :4000
```

Other useful scripts: `npm run prisma:studio` (visual DB browser), `npm run build` / `npm start` (production build).

### Frontend

```bash
cd Client
cp .env.example .env          # VITE_API_BASE_URL → your API
npm install
npm run dev                    # Vite dev server on :5173
```

---

## 🔑 Demo Accounts

Seeded by [`seed.ts`](./server/prisma/seed.ts) — all five share one password.

| Email | Role | Password |
|---|---|---|
| `admin@transitops.io` | ADMIN | `Password123!` |
| `fleet@transitops.io` | FLEET_MANAGER | `Password123!` |
| `driver@transitops.io` | DRIVER | `Password123!` |
| `safety@transitops.io` | SAFETY_OFFICER | `Password123!` |
| `finance@transitops.io` | FINANCIAL_ANALYST | `Password123!` |

Log in as each one to see how the UI and permissions shift per role.

---

## 🗺️ Roadmap / Future Scope

- [ ] **Login rate-limiting** — lock an account out after 5 failed attempts
- [ ] **Frontend route guarding** — hide nav items/actions the current role can't use, not just block them server-side
- [ ] **Immutable fuel-log audit trail** — currently a driver can delete a fuel log after the fact, silently skewing fuel-efficiency reports; move toward soft-delete + change history
- [ ] **Clarify maintenance ownership** — decide whether Fleet Managers should close tickets independently of Admin, or require sign-off
- [ ] **CSV export everywhere** — extend the reports export to trips, fuel logs, and expenses, not just the vehicle overview
- [ ] **Automated test suite** — unit tests for trip-guardrail logic, integration tests per module
- [ ] **CI/CD pipeline** — lint + build + migration dry-run on every PR
- [ ] **Real-time trip updates** — WebSocket/SSE push when a trip is dispatched/completed instead of polling
- [ ] **Driver mobile PWA** — a lightweight, offline-tolerant view for drivers to dispatch/complete their own trips
- [ ] **Multi-tenancy** — scope vehicles/drivers/trips to an organization for SaaS-style deployment

---

## 🤝 Team

| Name |
|---|
| Abhishek Verma |
| Anurag Verma |
| Aditya Sharma |

---

<div align="center">

Built with Express, Prisma, React, and a healthy amount of `docker compose up`.

</div>
