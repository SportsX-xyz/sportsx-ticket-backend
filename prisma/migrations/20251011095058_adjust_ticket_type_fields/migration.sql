/*
  Warnings:

  - You are about to drop the column `initStatus` on the `EventTicketType` table. All the data in the column will be lost.
  - You are about to drop the column `tierColumns` on the `EventTicketType` table. All the data in the column will be lost.
  - You are about to drop the column `tierRows` on the `EventTicketType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventTicketType" DROP COLUMN "initStatus",
DROP COLUMN "tierColumns",
DROP COLUMN "tierRows",
ADD COLUMN     "color" VARCHAR(100);

-- DropEnum
DROP TYPE "TicketTypeStatus";
