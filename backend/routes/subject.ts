import { adminApiGuard, databaseError, prismaErrorCode } from "@/backend/lib/admin-api";
import { getPrisma } from "@/backend/lib/prisma";

export async function DELETE(request: Request, context: RouteContext<"/api/admin/subjects/[id]">) {
  const blocked = await adminApiGuard(request);
  if (blocked) return blocked;

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return Response.json({ error: "Invalid subject ID." }, { status: 400 });
  }

  try {
    await getPrisma().subject.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (prismaErrorCode(error) === "P2025") {
      return Response.json({ error: "Subject not found." }, { status: 404 });
    }
    return databaseError(error);
  }
}
