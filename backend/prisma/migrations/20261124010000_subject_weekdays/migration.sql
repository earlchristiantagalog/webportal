-- Keep scheduledDate for historical records; new schedules use recurring weekdays.
ALTER TABLE "Subject" ADD COLUMN "days" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Convert previously scheduled dates to their matching school weekday.
UPDATE "Subject"
SET "days" = ARRAY[
  CASE EXTRACT(ISODOW FROM "scheduledDate")
    WHEN 1 THEN 'MON'
    WHEN 2 THEN 'TUE'
    WHEN 3 THEN 'WED'
    WHEN 4 THEN 'THU'
    WHEN 5 THEN 'FRI'
  END
]
WHERE "scheduledDate" IS NOT NULL
  AND EXTRACT(ISODOW FROM "scheduledDate") BETWEEN 1 AND 5;
