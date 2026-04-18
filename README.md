# Issue Tracker

I built an issue tracker using a React single page application and a REST API backed by MongoDB so authentication and data are fully integrated rather than mocked. I concentrated on the frontend: routing, client state, list and board views, search and filters, exports, and a production deployment on Netlify.

**Live demo:** [https://issuetrackerbywk.netlify.app/](https://issuetrackerbywk.netlify.app/)

The client stack is React and TypeScript with Vite, Tailwind CSS, Zustand, React Router, Framer Motion, and dnd-kit for the board. The API uses Express, Mongoose, and JWT based authentication. Implementation details for the backend are under `server/`; the emphasis of this submission is the user interface.

## For reviewers

The live application is the fastest way to evaluate the work. After registering and signing in, please exercise the list view (grouping by status and infinite scrolling), the board view (dragging cards between columns), search and filters, CSV and JSON export, and transitions to Resolved or Closed to observe the confirmation flow.

Frontend code is primarily located in `client/src/`, including pages, components, Zustand stores, and typed API helpers under `api/`. Global styles are in `client/src/styles/global.css`, with Tailwind used for layout and components.

To run the project locally, install Node.js 20 or newer, provision MongoDB (I used MongoDB Atlas during development), and configure `server/.env` from `server/.env.example`. From the repository root, `npm run dev` starts the API and Vite. The application is served at `http://localhost:5173`, with Vite proxying `/api` to the backend for same origin requests during development.

## Frontend scope

Authentication includes registration and login with JWT storage in `localStorage`, protected routes, and sign out. Issues support full CRUD through a detail modal and a dedicated edit view.

The list view groups issues by status with infinite scrolling. Search is debounced to limit API traffic. Filters cover status, priority, and severity. The header displays live status counts from the server.

The board view supports drag and drop between columns. Moving an issue to Resolved or Closed triggers a confirmation step, consistent with the modal and edit flows.

Exports respect the active search and filters. Framer Motion is used where it clarifies transitions. Layout and components are kept consistent across views.

The backend handles persistence and authorization with Helmet, CORS restricted to `CLIENT_ORIGIN`, bcrypt for passwords, and per user issue ownership.

## Prerequisites

Node.js 20 or newer, and a MongoDB instance. For Atlas, create a database user, allow your IP under Network Access for local development, and obtain a `mongodb+srv` connection string. URL encode special characters in the password when required.

## Running locally

From the repository root:

```bash
npm install
```

Copy `server/.env.example` to `server/.env` and provide values for each variable.

`MONGODB_URI` is the Atlas connection string. `JWT_SECRET` must be a long random string of at least sixteen characters. Do not commit production secrets. For local development, `CLIENT_ORIGIN` may remain `http://localhost:5173` as in the example. `PORT` is optional and defaults to 5000 for the API.

```bash
npm run dev
```

The API listens on port 5000 by default. The Vite development server proxies `/api` to that process.

## Production build on a single host

```bash
npm run build
npm run start
```

This compiles the server and builds the client to `client/dist`. `npm run start` runs the API only; a single host deployment would also serve `client/dist` as static assets and route `/api` to Node, with HTTPS terminated at the edge.

## Deployment (Netlify and Render)

The client uses relative `/api` URLs only. The static build is hosted on Netlify. `netlify.toml` forwards `/api` requests to the Render hosted API, analogous to the Vite proxy in development.

**Production frontend URL:** [https://issuetrackerbywk.netlify.app/](https://issuetrackerbywk.netlify.app/)

**Render (API):** Create a Web Service from the repository root. Build command: `npm install && npm run build -w server`. Start command: `npm run start -w server`. Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` to `https://issuetrackerbywk.netlify.app` (origin only, no path or trailing slash). Render supplies `PORT`.

**Netlify (client):** Build command `npm install && npm run build -w client`, publish directory `client/dist`, as defined in `netlify.toml`. Configure the `/api` redirect to your Render service URL, for example `https://your-service.onrender.com/api/:splat`. No `VITE_` public API URL is required because requests remain relative.

Recommended order: deploy the API on Render, set `CLIENT_ORIGIN` to the Netlify origin, align `netlify.toml` with the Render base URL, then deploy the Netlify site. Update both if either public URL changes.

## Security

Passwords are hashed. Protected routes validate the JWT. CORS is limited to the configured `CLIENT_ORIGIN`. Storing the token in `localStorage` is a deliberate simplification for this project; a production system would typically evaluate httpOnly cookies, refresh tokens, and stricter session handling.

## Repository layout

`client/` contains the React application: pages, shared UI, stores such as `issueStore` and `authStore`, and API helpers. `server/` contains the Express application: routes, Mongoose models for users and issues, authentication middleware, and controllers.

## HTTP API (issue routes require Bearer token)

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Issues:** listing with query parameters for pagination, search, and filters; `GET /api/issues/stats`; export endpoints; standard CRUD at `/api/issues` and `/api/issues/:id`. Issue routes expect `Authorization: Bearer <token>` from login or registration.

## npm scripts

`npm run dev` runs the API and Vite together. `npm run build` builds the server and client. `npm run start` runs the compiled API after a build.

Thank you for reviewing this submission.
