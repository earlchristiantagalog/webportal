import { adminApiGuard, databaseError, prismaErrorCode } from "@/backend/lib/admin-api";
import { getPrisma } from "@/backend/lib/prisma";
import { parseSubjectInput } from "@/backend/lib/subject-input";

export async function PATCH(request: Request, context: RouteContext<"/api/admin/subjects/[id]">) {
  const blocked = await adminApiGuard(request);
  if (blocked) return blocked;

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return Response.json({ error: "Invalid subject ID." }, { status: 400 });
  }
  const parsed = parseSubjectInput(await request.json().catch(() => null));
  if (parsed.error) return parsed.error;
  const { sectionId, name, nameKey, days, startTime, endTime } = parsed.data!;

  try {
    const subject = await getPrisma().subject.update({
      where: { id },
      data: { sectionId, name, nameKey, days, startTime, endTime },
      select: { id: true, sectionId: true, name: true, code: true, days: true, startTime: true, endTime: true },
    });
    return Response.json({ subject });
  } catch (error) {
    if (prismaErrorCode(error) === "P2025") {
      return Response.json({ error: "Subject not found." }, { status: 404 });
    }
    if (prismaErrorCode(error) === "P2002") {
      return Response.json({ error: "This subject is already assigned to the selected section." }, { status: 409 });
    }
    if (prismaErrorCode(error) === "P2003") {
      return Response.json({ error: "The selected section no longer exists." }, { status: 404 });
    }
    return databaseError(error);
  }
}

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
