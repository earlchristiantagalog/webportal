import { hasAdminSession, isAdminConfigured, sameOrigin } from "./admin-auth";

export async function adminApiGuard(request?: Request) {
  if (process.env.NODE_ENV === "production") {
    if (!isAdminConfigured()) return Response.json(
      { error: "Admin authentication is not configured. Set the admin environment variables on Vercel." },
      { status: 503 },
    );
    if (!(await hasAdminSession())) return Response.json({ error: "Admin session required. Please sign in again." }, { status: 401 });
    if (request && !sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "Database is not configured. Add your Neon DATABASE_URL and DIRECT_URL to .env, then run npm run db:deploy." },
      { status: 503 },
    );
  }
  return null;
}

export function databaseError(error: unknown) {
  console.error("Admin database request failed:", error);
  return Response.json({ error: "The database request failed. Check your Neon connection and migration." }, { status: 503 });
}

export function prismaErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return null;
}
