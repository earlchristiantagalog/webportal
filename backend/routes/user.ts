import { adminApiGuard, databaseError, prismaErrorCode } from "@/backend/lib/admin-api";
import { getPrisma } from "@/backend/lib/prisma";
import { parseProfile, profileError } from "@/backend/lib/user-profile";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/users/[id]">) {
  const blocked = adminApiGuard();
  if (blocked) return blocked;
  const { id } = await context.params;
  if (!id || id.length > 100) return Response.json({ error: "Invalid profile ID." }, { status: 400 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid profile data." }, { status: 400 });
  const record = body as Record<string, unknown>;
  const statusOnly = Object.keys(record).length === 1 && typeof record.isActive === "boolean";
  const data = statusOnly ? { isActive: record.isActive as boolean } : parseProfile(body);
  if (!data || (!statusOnly && "isActive" in record)) return Response.json({ error: "Provide valid profile details or an active status." }, { status: 400 });
  try {
    const user = await getPrisma().userProfile.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, sectionId: true, isActive: true },
    });
    return Response.json({ user });
  } catch (error) {
    if (prismaErrorCode(error) === "P2025") return Response.json({ error: "Profile not found." }, { status: 404 });
    return profileError(error) ?? databaseError(error);
  }
}
