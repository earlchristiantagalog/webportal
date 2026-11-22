import { prismaErrorCode } from "./admin-api";

export function parseProfile(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.name !== "string" || typeof body.email !== "string" ||
      (body.role !== "STUDENT" && body.role !== "TEACHER") ||
      (body.sectionId !== undefined && body.sectionId !== null && typeof body.sectionId !== "string")) return null;
  const name = body.name.normalize("NFKC").trim().replace(/\s+/g, " ");
  const email = body.email.trim().toLowerCase();
  const sectionId = body.role === "STUDENT" && typeof body.sectionId === "string" ? body.sectionId.trim() || null : null;
  if (!name || name.length > 100 || !email || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (sectionId && sectionId.length > 100)) return null;
  return { name, email, role: body.role === "STUDENT" ? "STUDENT" as const : "TEACHER" as const, sectionId };
}

export function profileError(error: unknown) {
  if (prismaErrorCode(error) === "P2002") return Response.json({ error: "This email is already used by another profile." }, { status: 409 });
  if (prismaErrorCode(error) === "P2003") return Response.json({ error: "The selected section no longer exists." }, { status: 400 });
  return null;
}
