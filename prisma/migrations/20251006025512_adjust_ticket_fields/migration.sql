/*
  Warnings:

  - The values [TIMEOUT] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `currentPrice` on the `EventTicket` table. All the data in the column will be lost.
  - Added the required column `previousPrice` to the `EventTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `EventTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('NEW', 'SOLD', 'USED', 'RESALE');
ALTER TABLE "EventTicket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EventTicket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "TicketStatus_old";
ALTER TABLE "EventTicket" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "EventTicket" DROP COLUMN "currentPrice",
ADD COLUMN     "previousPrice" DECIMAL(18,6) NOT NULL,
ADD COLUMN     "price" DECIMAL(18,6) NOT NULL,
ALTER COLUMN "initialPrice" SET DATA TYPE DECIMAL(18,6);
