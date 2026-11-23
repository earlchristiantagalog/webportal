import { cookies } from "next/headers";
import { createAdminSession, isAdminConfigured, sameOrigin, sessionCookie, verifyAdminCredentials } from "@/backend/lib/admin-auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!isAdminConfigured()) return Response.json({ error: "Admin sign-in is not configured. Set the admin environment variables on Vercel." }, { status: 503 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("email" in body) || !("password" in body) ||
      typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const valid = await verifyAdminCredentials(body.email, body.password);
  if (!valid) return Response.json({ error: "Invalid email or password." }, { status: 401 });
  const session = createAdminSession();
  (await cookies()).set(sessionCookie, session.value, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: session.maxAge,
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  (await cookies()).delete(sessionCookie);
  return new Response(null, { status: 204 });
}
