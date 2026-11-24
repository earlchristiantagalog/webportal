-- Nullable so existing subjects remain intact and show as unscheduled.
ALTER TABLE "Subject" ADD COLUMN "scheduledDate" DATE,
ADD COLUMN "startTime" VARCHAR(5),
ADD COLUMN "endTime" VARCHAR(5);
