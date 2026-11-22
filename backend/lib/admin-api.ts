export function adminApiGuard() {
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Admin authentication is not configured. Database access is disabled in production." },
      { status: 403 },
    );
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
