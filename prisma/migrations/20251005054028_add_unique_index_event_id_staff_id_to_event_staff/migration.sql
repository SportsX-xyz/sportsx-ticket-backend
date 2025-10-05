/*
  Warnings:

  - A unique constraint covering the columns `[eventId,staffId]` on the table `EventStaff` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventStaff_eventId_staffId_key" ON "EventStaff"("eventId", "staffId");
