/*
  Warnings:

  - You are about to drop the `Semester` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Semester" DROP CONSTRAINT "Semester_departmentId_fkey";

-- DropTable
DROP TABLE "Semester";

-- CreateTable
CREATE TABLE "RoutineEntry" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineEntry_pkey" PRIMARY KEY ("id")
);
