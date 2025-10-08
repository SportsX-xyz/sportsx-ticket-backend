/*
  Warnings:

  - Added the required column `price` to the `EventTicketOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventTicketOrder" ADD COLUMN     "price" DECIMAL(18,6) NOT NULL;
