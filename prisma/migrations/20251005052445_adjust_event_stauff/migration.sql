/*
  Warnings:

  - You are about to drop the column `customerId` on the `EventStaff` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EventStaff` table. All the data in the column will be lost.
  - Added the required column `staffId` to the `EventStaff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EventStaff" DROP CONSTRAINT "EventStaff_customerId_fkey";

-- DropForeignKey
ALTER TABLE "EventStaff" DROP CONSTRAINT "EventStaff_userId_fkey";

-- AlterTable
ALTER TABLE "EventStaff" DROP COLUMN "customerId",
DROP COLUMN "userId",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
