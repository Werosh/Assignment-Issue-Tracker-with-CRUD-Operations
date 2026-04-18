# Issue Tracker

Associate frontend engineer assignment. React + TypeScript client (Vite, Zustand, React Router, Tailwind, Framer Motion, dnd-kit), Express + MongoDB API. JWT auth with bcrypt, per-user issues, full CRUD, list grouped by status with infinite scroll, board with drag-and-drop between columns, debounced search and filters, live status counts, CSV/JSON export, and a confirm step when you mark something resolved or closed.

MongoDB is wired for a normal Atlas-style `mongodb+srv` connection string.

## What you need

Node 20+ and a MongoDB instance (Atlas free tier is fine). Create a database user and allow your IP in Network Access before you connect.

## Install

From the repo root, workspaces pull in both apps:

```bash
npm install
```

Exact versions live in `client/package.json` and `server/package.json`. Client highlights: React, Vite, TypeScript, Zustand, Tailwind, Framer Motion, dnd-kit. Server: Express, Mongoose, Zod, jose for JWT, bcryptjs, Helmet, CORS.

## MongoDB Atlas

Spin up a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Add a user under Database Access, then under Network Access point it at your dev machine (tightening `0.0.0.0/0` is your call for local hacks only). Connect → Drivers → copy the `mongodb+srv://` URI, plug in user, password, and database name. If the password has special characters, URL-encode them.

## Environment

Copy `server/.env.example` to `server/.env` and fill in the values.

`MONGODB_URI` is your connection string; `mongodb+srv` already implies TLS.

`JWT_SECRET` should be a long random string anywhere the app is shared or deployed. Anyone with it can forge tokens.

`CLIENT_ORIGIN` is the browser origin allowed for CORS. For local dev the example file uses `http://localhost:5173`; change it to your real frontend URL when you deploy.

`PORT` is where Express listens (defaults to 5000 if you omit it).

Do not commit real `.env` files or paste secrets into the repo. Rotate anything that leaks.

## Security (quick tour)

Passwords are hashed with bcrypt on register; the API never stores plain text. Requests that touch issues send a Bearer JWT; the server verifies it with `JWT_SECRET` only on the server. Helmet adds sensible headers, CORS is locked to `CLIENT_ORIGIN`, and JSON bodies are capped. Each issue belongs to `createdBy`, so users only see their own rows.

The SPA keeps the token in `localStorage` to keep the stack simple. Use HTTPS in production; locking down token theft for real products usually means shorter-lived tokens, refresh, or httpOnly cookies out of scope here but worth knowing.

## Run locally

```bash
npm run dev
```

That runs Express (API on port 5000 by default) and Vite together. Open the app at `http://localhost:5173`. Vite proxies `/api` to the backend so the browser stays same-origin for API calls during dev.

## Using the app

Register, then log in. Everything under Issues is per account.

Create issues from the main screen (title, description, status, priority, severity). Open one from the list or board to see the detail modal; use Edit for the full-page form. List view groups cards by status and loads more as you scroll. Board view loads all matching issues for the current filters and lets you drag cards between columns dropping onto Resolved or Closed opens a confirm dialog, same as changing those statuses in the modal or on the edit page.

Search debounces so typing does not spam the API. Filters (status, priority, severity) live behind the filter button. Status counts at the bottom of the header update from `/api/issues/stats`. Export CSV or JSON uses whatever search and filters are active. Sign out is in the header.

## Production

```bash
npm run build
npm run start
```

`npm run build` compiles the server TypeScript and builds the client bundle into `client/dist`. `npm run start` runs the compiled API only you still need to serve `client/dist` as static files (nginx, S3+CloudFront, etc.) and reverse-proxy `/api` to Node. Set the same env vars on the host and keep HTTPS at the edge.

## Scripts recap

`npm run dev` - both processes for day-to-day coding.

`npm run build` - production artifacts for client + server.

`npm run start` - API from compiled `server` output after a build.

## Repo layout

`client/` holds the React app: pages, reusable UI, Zustand stores (`issueStore`, `authStore`), and the fetch helpers under `src/api/`.

`server/` is Express: routes, Mongoose models (`User`, `Issue`), auth middleware, and the issue/export controllers.

## HTTP API (Bearer auth except register/login)

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.

Issues: `GET /api/issues` with optional query params `page`, `limit`, `q` (title/description substring), `status`, `priority`, `severity`. `GET /api/issues/stats` returns counts per status. `GET /api/issues/export?format=json` or `format=csv` streams a download (respects the same filter params as list). `GET /api/issues/:id`, `PATCH /api/issues/:id`, `DELETE /api/issues/:id`, `POST /api/issues` for the usual CRUD.

All issue routes expect `Authorization: Bearer <token>` from login or register.
