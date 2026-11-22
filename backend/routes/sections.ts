import { connection } from "next/server";
import { adminApiGuard, databaseError, prismaErrorCode } from "@/backend/lib/admin-api";
import { getPrisma } from "@/backend/lib/prisma";

export async function GET() {
  await connection();
  const blocked = adminApiGuard();
  if (blocked) return blocked;

  try {
    const sections = await getPrisma().section.findMany({
      orderBy: [{ grade: "asc" }, { name: "asc" }],
      select: { id: true, grade: true, name: true, _count: { select: { subjects: true } } },
    });
    return Response.json({
      sections: sections.map((section) => ({
        id: section.id,
        grade: `Grade ${section.grade}`,
        name: section.name,
        subjectCount: section._count.subjects,
      })),
    });
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(request: Request) {
  const blocked = adminApiGuard();
  if (blocked) return blocked;

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("grade" in body) || !("name" in body) || typeof body.grade !== "string" || typeof body.name !== "string") {
    return Response.json({ error: "Grade level and section name are required." }, { status: 400 });
  }

  const gradeMatch = /^Grade (7|8|9|10|11|12)$/.exec(body.grade);
  const name = body.name.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!gradeMatch || !name || name.length > 60) {
    return Response.json({ error: "Choose Grade 7–12 and provide a section name of 1–60 characters." }, { status: 400 });
  }

  try {
    const section = await getPrisma().section.create({
      data: { grade: Number(gradeMatch[1]), name, nameKey: name.toLowerCase() },
    });
    return Response.json({ section: { id: section.id, grade: `Grade ${section.grade}`, name: section.name, subjectCount: 0 } }, { status: 201 });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      return Response.json({ error: "This section already exists in the selected grade." }, { status: 409 });
    }
    return databaseError(error);
  }
}
