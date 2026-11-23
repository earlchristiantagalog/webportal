import { randomInt } from "node:crypto";
import { connection } from "next/server";
import { adminApiGuard, databaseError, prismaErrorCode } from "@/backend/lib/admin-api";
import { getPrisma } from "@/backend/lib/prisma";

const subjectCodePrefix = "26"; // First year of the 2026–2027 school year.

export async function GET() {
  await connection();
  const blocked = await adminApiGuard();
  if (blocked) return blocked;

  try {
    const subjects = await getPrisma().subject.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, sectionId: true, name: true, code: true, teacher: true },
    });
    return Response.json({ subjects: subjects.map((item) => ({ ...item, teacher: item.teacher ?? "" })) });
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(request: Request) {
  const blocked = await adminApiGuard(request);
  if (blocked) return blocked;

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("sectionId" in body) || !("name" in body) || typeof body.sectionId !== "string" || typeof body.name !== "string") {
    return Response.json({ error: "Section and subject name are required." }, { status: 400 });
  }
  const teacherInput = "teacher" in body ? body.teacher : "";
  if (typeof teacherInput !== "string") {
    return Response.json({ error: "Teacher must be text." }, { status: 400 });
  }

  const sectionId = body.sectionId.trim();
  const name = body.name.normalize("NFKC").trim().replace(/\s+/g, " ");
  const teacher = teacherInput.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!sectionId || sectionId.length > 100 || !name || name.length > 80 || teacher.length > 80) {
    return Response.json({ error: "Use a valid section, subject name (1–80 characters), and teacher (up to 80 characters)." }, { status: 400 });
  }

  try {
    const prisma = getPrisma();
    const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { id: true } });
    if (!section) return Response.json({ error: "The selected section no longer exists." }, { status: 404 });
    const nameKey = name.toLowerCase();
    const existing = await prisma.subject.findUnique({
      where: { sectionId_nameKey: { sectionId, nameKey } },
      select: { id: true },
    });
    if (existing) return Response.json({ error: "This subject is already assigned to the selected section." }, { status: 409 });

    const start = randomInt(1000);
    for (let offset = 0; offset < 1000; offset++) {
      const code = `${subjectCodePrefix}${String((start + offset) % 1000).padStart(3, "0")}`;
      try {
        const subject = await prisma.subject.create({
          data: { sectionId, name, nameKey, teacher: teacher || null, code },
        });
        return Response.json({ subject: { id: subject.id, sectionId, name: subject.name, teacher: subject.teacher ?? "", code: subject.code } }, { status: 201 });
      } catch (error) {
        if (prismaErrorCode(error) === "P2002") {
          const duplicateName = await prisma.subject.findUnique({
            where: { sectionId_nameKey: { sectionId, nameKey } },
            select: { id: true },
          });
          if (duplicateName) return Response.json({ error: "This subject is already assigned to the selected section." }, { status: 409 });
          continue;
        }
        if (prismaErrorCode(error) === "P2003") {
          return Response.json({ error: "The selected section no longer exists." }, { status: 404 });
        }
        throw error;
      }
    }
    return Response.json({ error: "No more subject codes are available for this school year." }, { status: 409 });
  } catch (error) {
    return databaseError(error);
  }
}
