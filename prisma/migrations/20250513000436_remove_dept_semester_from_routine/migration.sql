/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Routine` table. All the data in the column will be lost.
  - You are about to drop the column `semesterId` on the `Routine` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Routine" DROP CONSTRAINT "Routine_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Routine" DROP CONSTRAINT "Routine_semesterId_fkey";

-- AlterTable
ALTER TABLE "Routine" DROP COLUMN "departmentId",
DROP COLUMN "semesterId";
