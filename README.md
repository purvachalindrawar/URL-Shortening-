# LockLink – Full‑Stack, Production‑Ready

LockLink is a modern, secure link platform with password‑protected links, expiration (TTL or datetime), click analytics with CSV/PDF export, and a polished animated dark UI. Backend runs on Node.js + Express with Postgres (Neon). Frontend is React + Vite + Tailwind.

## Highlights
- **Custom slugs** with validation and reserved words
- **Password‑protected links** with built‑in unlock page (bcrypt)
- **Expiration/TTL**: set absolute expiration or time‑to‑live in hours
- **Click analytics** stored per visit (IP, UA, referrer)
- **One‑click exports**: CSV and PDF for a link’s clicks
- **Dark, animated UI** built with Tailwind (no extra UI deps)
- **CORS/cookie hardening** for cross‑site deployments
- **Postgres schema migration on boot** (idempotent)
- RBAC groundwork for **Teams/Projects** on the backend (minimal UI pending)

## Tech Stack
- Backend: Node.js, Express, Postgres (pg), Neon, JWT, bcryptjs, csv-stringify, pdfkit
- Frontend: React, Vite, Tailwind, React Query, Redux
- Deployment: Render (backend) + Vercel (frontend) friendly

## Monorepo
- `BACKEND/` Express API + Postgres schema/migrations in code
- `FRONTEND/` React app (Vite) with Tailwind

## Quick Start (Local)
1) Clone and install
- `cd BACKEND && npm install`
- `cd ../FRONTEND && npm install`

2) Configure env vars
- Copy `BACKEND/.env.example` to `BACKEND/.env`
- Copy `FRONTEND/.env.example` to `FRONTEND/.env`

3) Run
- Backend: from `BACKEND/`: `npm start` (or `npm run dev` if available)
- Frontend: from `FRONTEND/`: `npm run dev` (Vite, usually http://localhost:5173)

Backend listens on `PORT` (default 3000). Frontend calls the backend using `VITE_API_URL`.

## Environment Variables
Backend (`BACKEND/.env`)
- `DATABASE_URL` Neon Postgres connection string
- `JWT_SECRET` Secret for JWT signing
- `APP_URL` Public backend base URL with trailing slash, e.g. `http://localhost:3000/`
- `FRONTEND_ORIGIN` Frontend origin without trailing slash, e.g. `http://localhost:5173`
- `RENDER_ADMIN_TOKEN` Token for server‑side cleanup endpoint
- `PORT` Optional server port (default 3000)

Frontend (`FRONTEND/.env`)
- `VITE_API_URL` Backend base URL, e.g. `http://localhost:3000`

## Key Features – How They Work
- **Create link**: Accepts optional `slug`, `password`, `ttlHours`, `expiresAt`.
- **Redirect**: If expired, returns 410. If password‑protected, serves an HTML unlock form and validates using bcrypt.
- **Analytics**: Every successful redirect increments clicks and logs visit metadata to Postgres.
- **Export**: CSV and PDF endpoints stream responses for a given link.

## API Overview (selected)
Base mount: `/api/create`
- `POST /api/create` Create link
  - Body: `{ url, slug?, password?, ttlHours?, expiresAt?, projectId? }`
  - Returns: `{ shortUrl }`
- `GET /:id` Resolve/redirect by slug (public root path)
- `POST /api/create/:id/unlock` Submit password for protected link
- `GET /api/create/links/:id/export.csv` CSV export of clicks
- `GET /api/create/links/:id/export.pdf` PDF export of clicks

Auth/User routes exist for login/register and listing user links. Cookies configured for cross‑site when deployed.

## Scripts
Backend
- `npm start` start server (Express)
- `npm run dev` nodemon (if configured)

Frontend
- `npm run dev` Vite dev server
- `npm run build` production build
- `npm run preview` preview build

