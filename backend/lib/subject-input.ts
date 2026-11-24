export function parseSubjectInput(body: unknown) {
  if (!body || typeof body !== "object" ||
      !("sectionId" in body) || typeof body.sectionId !== "string" ||
      !("name" in body) || typeof body.name !== "string" ||
      !("days" in body) || !Array.isArray(body.days) ||
      !("startTime" in body) || typeof body.startTime !== "string" ||
      !("endTime" in body) || typeof body.endTime !== "string") {
    return { error: Response.json({ error: "Section, subject name, weekdays, start time, and end time are required." }, { status: 400 }) };
  }

  const sectionId = body.sectionId.trim();
  const name = body.name.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (!sectionId || sectionId.length > 100 || !name || name.length > 80) {
    return { error: Response.json({ error: "Use a valid section and subject name (1–80 characters)." }, { status: 400 }) };
  }

  const { days, startTime, endTime } = body;
  const weekdays = ["MON", "TUE", "WED", "THU", "FRI"];
  if (!days.length || days.length > weekdays.length ||
      days.some((day: unknown) => typeof day !== "string" || !weekdays.includes(day)) ||
      new Set(days).size !== days.length ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) || startTime >= endTime) {
    return { error: Response.json({ error: "Choose at least one school weekday and an end time later than the start time." }, { status: 400 }) };
  }

  return { data: { sectionId, name, nameKey: name.toLowerCase(), days: weekdays.filter((day) => days.includes(day)), startTime, endTime } };
}
