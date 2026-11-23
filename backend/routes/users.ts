import { connection } from "next/server";
import { adminApiGuard, databaseError } from "@/backend/lib/admin-api";
import { getPrisma } from "@/backend/lib/prisma";
import { parseProfile, profileError } from "@/backend/lib/user-profile";

export async function GET() {
  await connection();
  const blocked = await adminApiGuard();
  if (blocked) return blocked;
  try {
    const users = await getPrisma().userProfile.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { id: true, name: true, email: true, role: true, sectionId: true, isActive: true },
    });
    return Response.json({ users });
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(request: Request) {
  const blocked = await adminApiGuard(request);
  if (blocked) return blocked;
  const data = parseProfile(await request.json().catch(() => null));
  if (!data) return Response.json({ error: "Provide a valid name, email, role, and optional student section." }, { status: 400 });
  try {
    const user = await getPrisma().userProfile.create({
      data,
      select: { id: true, name: true, email: true, role: true, sectionId: true, isActive: true },
    });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return profileError(error) ?? databaseError(error);
  }
}
