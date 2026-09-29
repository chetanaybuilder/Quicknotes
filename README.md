# Quick Notes

> Your thoughts. Organized beautifully.

A personal digital notebook: sign in with Google, then create, edit, pin, tag, search and revisit notes. Built with React, plain CSS (with CSS 3D transforms), an Express API and Neon PostgreSQL.

## Features

- Google OAuth 2.0 sign-in (server-side authorization-code flow), HTTP-only cookie sessions, logout, protected routes
- Notes: create, edit, delete, pin/unpin, tags, optional category, autosave with honest Saving… / Saved / Not saved status
- Instant search across titles, content and tags; `Ctrl/Cmd + K` palette on desktop, search button on mobile
- Notes page with filters (All, Pinned, Recent, Tagged) and sorting
- History page: timeline of when notes were created and edited, with search and filters
- Mobile-first layout: bottom navigation and a centre “new note” button on phones, sidebar workspace on desktop
- 3D notebook interface using CSS `perspective`, `translateZ` and `rotate`; respects `prefers-reduced-motion`
- Profile page with account info, logout and JSON export of your notes
- Loading skeletons, empty states and human-readable error states

## Tech stack

HTML, CSS, JavaScript, React 18 (Vite, React Router), Express, Neon PostgreSQL (`pg`), `google-auth-library`, `helmet`.

## Architecture

```
Browser (React UI)
   │  fetch /api/*  (same origin, cookie session)
   ▼
Express API ── auth (Google OAuth, sessions) ── notes (CRUD, per-user)
   │  parameterized SQL
   ▼
Neon PostgreSQL  (users · sessions · notes)
```

In development Vite proxies `/api` to Express. In production Express serves `client/dist` and the API from one origin, so no CORS is needed.

## Authentication flow

1. “Continue with Google” goes to `GET /api/auth/google`, which sets a random `state` cookie and redirects to Google.
2. Google redirects to `/api/auth/google/callback`. The server checks `state`, exchanges the code (the client secret never leaves the server), and verifies the ID token and verified email.
3. The user is upserted, and a random session token is issued in an HTTP-only, SameSite=Lax cookie (Secure in production). Only its SHA-256 hash is stored in `sessions`.
4. Every `/api/notes` request goes through `requireAuth`; all SQL is scoped with `user_id = $1`.

Phone-number sign-in is not implemented.

## Database

| Table | Purpose |
| --- | --- |
| `users` | Google subject id, email, name, picture |
| `sessions` | Hashed session token, user, expiry |
| `notes` | `user_id`, title, content, `tags text[]`, category, `is_pinned`, timestamps |

Indexes: `notes(user_id, updated_at desc)`, partial index on pinned notes, GIN on tags, plus session indexes. Schema: `server/src/schema.sql`.

## Getting started

Requires Node.js 20.6+.

1. Create a Neon project and copy its connection string.
2. In Google Cloud Console create an OAuth 2.0 Web client. Add the authorized redirect URI `http://localhost:5173/api/auth/google/callback`.
3. Configure and run:

```bash
cp .env.example .env      # fill in the values
npm install               # root (concurrently)
npm run install:all       # server + client
npm run db:migrate        # creates tables in Neon
npm run dev               # web on :5173, API on :8787
```

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `GOOGLE_CLIENT_ID` | OAuth client id |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret (server only) |
| `APP_URL` | Public app URL; the redirect URI is `APP_URL/api/auth/google/callback` |
| `PORT` | API port (default 8787) |
| `NODE_ENV` | `development` or `production` |

### Production build

```bash
npm run build && npm start   # set NODE_ENV=production, APP_URL to your https URL
```

## Security

Parameterized SQL only; per-user scoping on every query (changing an ID returns 404); input validation and length limits; hashed session tokens; OAuth `state` check; Origin check on state-changing requests; `helmet` headers with a CSP; generic error messages; secrets only in environment variables (`.env` is git-ignored).

Not implemented: rate limiting, notes encryption at rest beyond what Neon provides, automated tests.

## Project structure

```
client/src/  components/ pages/ layouts/ hooks/ services/ utils/ auth/ styles/
server/src/  index.js auth.js notes.js db.js migrate.js schema.sql
```

## Future improvements

Rate limiting, automated tests, deleted-note history, rich text, offline support.

## Contributing

Issues and pull requests are welcome.

## License

MIT
