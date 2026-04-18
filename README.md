# Issue Tracker

**Assignment: Associate Software Engineer (Frontend)**

Full stack issue tracker: React and TypeScript on the client (Vite, Zustand, React Router, Tailwind), Express and MongoDB on the server. Features include JWT authentication, per user issue data, list and board views, debounced search, filters, and CSV or JSON export. The database target is **MongoDB Atlas** using a standard connection string.

## Prerequisites

- Node.js 20 or later
- A MongoDB Atlas cluster (free tier is sufficient) with a database user and network access rules configured

## Install

From the repository root (npm workspaces install both `client` and `server`):

```bash
npm install
```

Main dependencies: see `client/package.json` and `server/package.json` for exact versions. In summary, the client uses React, Vite, TypeScript, Zustand, Tailwind, Framer Motion, and dnd-kit. The server uses Express, Mongoose, Zod, jose (JWT), bcryptjs, Helmet, and CORS.

## MongoDB Atlas

Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Under **Database Access**, create a user with a strong password. Under **Network Access**, restrict to your IP for development; avoid open `0.0.0.0/0` rules in production unless you understand the tradeoff. Use **Connect** then **Drivers** to copy the `mongodb+srv://` URI. Substitute username, password, and database name. Percent encode special characters in the password if required.

## Environment variables

Copy `server/.env.example` to `server/.env` and set:

| Variable        | Purpose                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `MONGODB_URI`   | Atlas connection string (TLS is used by `mongodb+srv`)                                         |
| `JWT_SECRET`    | Secret key for signing tokens; must be long and random in any shared or production environment |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS (default `http://localhost:5173`)                              |
| `PORT`          | API listen port (default `5000`)                                                               |

Never commit `server/.env` or share real secrets in the repository. Keep `.env` out of version control and rotate credentials if they are exposed.

## Security

This project applies common practices suitable for a coursework submission. Reviewers should note the following:

**Server**

- Passwords are never stored in plain text. Registration hashes passwords with **bcrypt** before persistence.
- **JWT** access tokens authenticate API requests. The signing key is `JWT_SECRET` only on the server.
- **Helmet** sets sensible HTTP security headers.
- **CORS** allows only `CLIENT_ORIGIN`. Set this to your deployed frontend URL in production.
- Request bodies are size limited (`express.json` limit).
- Issue routes enforce ownership: each user can only read, update, or delete their own issues.

**Configuration**

- Treat `JWT_SECRET` and `MONGODB_URI` like production secrets: high entropy for the JWT secret, and database credentials with least privilege (Atlas user scoped to this application).
- In production, serve the API and SPA over **HTTPS**, set `CLIENT_ORIGIN` to the real frontend origin, and tighten Atlas **Network Access** to known IPs or cloud provider ranges where possible.

**Client**

- The session token is stored in **localStorage** for simplicity. In production, always serve the app over HTTPS to reduce exposure on untrusted networks. Mitigating token theft fully would require additional measures (short lived tokens, refresh flow, httpOnly cookies) beyond this assignment scope.

## Run (development)

```bash
npm run dev
```

- Web app: `http://localhost:5173`
- API: `http://localhost:5000` (Vite proxies `/api` to the API during development)

## Using the application

Register or sign in. Issues are isolated per account. Create issues from the main screen; open details in a modal or use the edit page. Switch between list view (grouped by status, infinite scroll) and board view (drag and drop). Changing status to Resolved or Closed prompts for confirmation. Filters for status, priority, and severity are available from the filter control. Export CSV or JSON respects current search and filters. Sign out from the header.

## Production build

```bash
npm run build
npm run start
```

`npm run start` runs the compiled API. Host the contents of `client/dist` as static files and reverse proxy `/api` to the Express process. Set environment variables on the host. Use HTTPS at the edge.

## Scripts

Use `npm run dev` when you are coding; it starts the Express API and the Vite dev server at the same time. When you want a production build, run `npm run build` first (that compiles the server and bundles the client). After that, `npm run start` only runs the API from the compiled output, which is what you use behind a reverse proxy once the frontend is built.

## Project layout

- `client/` … React application, UI components, Zustand stores, API client
- `server/` … Express application, Mongoose models, authentication middleware, issue and export routes

## API reference

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer token)
- `GET /api/issues` … query parameters: `page`, `limit`, `q`, `status`, `priority`, `severity`
- `GET /api/issues/stats`
- `GET /api/issues/export?format=json` or `format=csv`
- `GET`, `PATCH`, `DELETE /api/issues/:id`, `POST /api/issues`
