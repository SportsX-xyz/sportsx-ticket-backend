/*
  Warnings:

  - Added the required column `customerId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "customerId" TEXT NOT NULL,
ALTER COLUMN "stopSaleBefore" SET DEFAULT 0,
ALTER COLUMN "description" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
