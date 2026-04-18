# Issue Tracker

A full-stack issue tracker with CRUD operations, auth, filters, pagination, and exports. The stack is React (TypeScript), Express, MongoDB, and JWT-based authentication.

## Prerequisites

- Node.js 20 or newer
- A running MongoDB instance (local or Atlas)

## Setup

1. Clone or extract the project and install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Configure the API. Copy `server/.env.example` to `server/.env` and set values:

   - `MONGODB_URI`: connection string (for example `mongodb://127.0.0.1:27017/issue-tracker`)
   - `JWT_SECRET`: at least 16 characters in production
   - `CLIENT_ORIGIN`: frontend URL (default `http://localhost:5173`)
   - `PORT`: API port (default `5000`)

3. Start both the API and the Vite dev server:

   ```bash
   npm run dev
   ```

   - API: `http://localhost:5000`
   - App: `http://localhost:5173` (proxies `/api` to the API)

4. Register an account via the UI, then create and manage issues.

## Production build

```bash
npm run build
```

Run the API with `npm run start -w server` after building (expects `server/.env`). Serve `client/dist` as static files from any web server, or use Vite preview for testing:

```bash
npm run preview -w client
```

Point the client at the API by serving the SPA and forwarding `/api` to the Express server, or set a reverse proxy so `/api` reaches the backend.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | API (`tsx watch`) + Vite dev server with hot reload |
| `npm run build` | TypeScript compile for server, Vite build for client |
| `npm run start` | Start compiled API (`node server/dist/index.js`) |

## Project layout

- `server/` — Express app: models, routes, JWT auth, validation (Zod), issue export (CSV/JSON)
- `client/` — React + Vite: Zustand stores, routed pages, debounced search, paginated list, reusable UI pieces

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer token)
- `GET /api/issues` with query params: `page`, `limit`, `q`, `status`, `priority`, `severity`
- `GET /api/issues/stats` — counts per status for the current user
- `GET /api/issues/export?format=json|csv` — download filtered issues (same filters as list; optional `limit` up to 5000)
- `GET/PATCH/DELETE /api/issues/:id`, `POST /api/issues`

Passwords are hashed with bcrypt. Issues are scoped to the authenticated user.

## License

This project is provided for educational use as a coursework assignment.
