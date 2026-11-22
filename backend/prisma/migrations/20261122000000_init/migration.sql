-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "nameKey" VARCHAR(60) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "nameKey" VARCHAR(80) NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "teacher" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Section_grade_name_idx" ON "Section"("grade", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_grade_nameKey_key" ON "Section"("grade", "nameKey");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Subject_sectionId_idx" ON "Subject"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_sectionId_nameKey_key" ON "Subject"("sectionId", "nameKey");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
