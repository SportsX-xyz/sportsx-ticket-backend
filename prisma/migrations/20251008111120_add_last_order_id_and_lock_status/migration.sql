/*
  Warnings:

  - A unique constraint covering the columns `[lastOrderId]` on the table `EventTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TicketStatus" ADD VALUE 'LOCK';

-- AlterTable
ALTER TABLE "EventTicket" ADD COLUMN     "lastOrderId" TEXT,
ADD COLUMN     "resaleTimes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "EventTicketOrder" ADD COLUMN     "txHash" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "EventTicket_lastOrderId_key" ON "EventTicket"("lastOrderId");

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_lastOrderId_fkey" FOREIGN KEY ("lastOrderId") REFERENCES "EventTicketOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
