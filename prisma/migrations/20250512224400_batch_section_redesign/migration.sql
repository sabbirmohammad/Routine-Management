/*
  Warnings:

  - A unique constraint covering the columns `[name,batchId]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Section_name_key";

-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "batchId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_number_key" ON "Batch"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_batchId_key" ON "Section"("name", "batchId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
