# MNHS Web Portal

Next.js, Bootstrap 5, Poppins, Prisma ORM, and Neon PostgreSQL.

## Database setup

1. Create a Neon PostgreSQL database. Copy its **pooled** connection string and **direct** connection string.
2. Copy `.env.example` to `.env` and replace both placeholder URLs:
   - `DATABASE_URL` — pooled Neon URL, used by the app at runtime.
   - `DIRECT_URL` — direct Neon URL, used by Prisma migrations.
3. Install dependencies and apply the checked-in migration:

   ```bash
   npm install
   npm run db:deploy
   npm run dev
   ```

4. Open `/admin/subjects`. Start by adding a section, then add a subject with one or more school weekdays (M, T, W, TH, F), start time, and end time. The server generates a unique `26XXX` subject code on submission. Existing subjects with one-time school-day dates are assigned their corresponding weekday; unscheduled subjects stay unscheduled. Historical dates and teacher values are retained in the database but no longer collected or shown.

The `/admin/users` page manages student and teacher profiles (name, email, optional student section, active status). Profiles are not login accounts. Apply new migrations with `npm run db:deploy` when updating an existing database.

The `/teacher` page is a Teachers Portal dashboard preview with illustrative classes, timetable, and announcements. It is linked from the sign-in page and does not use real student data or grant access to accounts.

## Admin sign-in on Vercel

The admin pages and API require a valid admin session in production. Configure these **server-side** environment variables in Vercel (Production):

- `DATABASE_URL`: Neon pooled URL (and `DIRECT_URL` if deploying migrations from Vercel).
- `ADMIN_EMAIL`: the email address for the single school administrator.
- `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`: generate both in a local interactive terminal with `node scripts/create-admin-credentials.mjs`. The password is entered without echoing and is **not** stored as plaintext.

Redeploy after setting the variables. Open `/`, sign in with `ADMIN_EMAIL` and the password chosen above, then open `/admin/users`. Signing out clears the HTTP-only, Secure, SameSite=Strict cookie. Sessions expire after eight hours; changing the hash or secret invalidates them. Never put these values in `NEXT_PUBLIC_*`, source control, or a client-side file. Production access stays blocked if the configuration is missing. During local development the existing admin preview and API remain accessible without signing in.

This single-admin setup does not include a persistent rate limiter. Enable a Vercel WAF rate-limit rule for `/api/admin/session` before opening the portal to untrusted traffic. For multiple staff accounts or self-service password reset, use a managed authentication provider instead.

Prisma Client is generated automatically by `npm run build`; run `npm run db:generate` after editing `backend/prisma/schema.prisma` during development. The initial SQL migration is at `backend/prisma/migrations/20261122000000_init/migration.sql`.

After applying migrations and regenerating Prisma Client, restart the development server so it uses the new database fields.

Backend implementation lives in `backend/`: Prisma configuration, schema, migration, database client, and route logic. The thin `app/api/admin/*/route.ts` files are required by Next.js to expose those handlers over HTTP.

## API

The Subjects page uses asynchronous `fetch` requests (AJAX):

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/admin/sections` | GET, POST | List and add sections |
| `/api/admin/subjects` | GET, POST | List and add subjects |
| `/api/admin/subjects/[id]` | PATCH, DELETE | Edit a subject's name, section, and schedule; or remove it |
| `/api/admin/users` | GET, POST | List and add student/teacher profiles |
| `/api/admin/users/[id]` | PATCH | Edit or activate/deactivate a profile |

Names are normalized and unique within each grade/section. Subject codes are unique across the database. Database errors and duplicate submissions return JSON errors and are shown as Bootstrap alerts.
Subject POST/PATCH payloads use `days` as an array of one or more of `MON`, `TUE`, `WED`, `THU`, and `FRI`, with `startTime` and `endTime` in `HH:mm` format.

**Security:** The admin API checks the session for every request in production; admin page checks alone are not sufficient. Teacher profiles remain directory records, not teacher login accounts.

Previous demo data in browser `localStorage` is not automatically imported into Neon. Nothing is deleted from the browser, but the Subjects page now displays database records only.
