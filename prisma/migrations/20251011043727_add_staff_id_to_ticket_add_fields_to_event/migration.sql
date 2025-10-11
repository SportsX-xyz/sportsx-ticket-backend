/*
  Warnings:

  - The values [INACTIVE] on the enum `EventStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventStatus_new" AS ENUM ('DRAFT', 'PREVIEW', 'ACTIVE', 'DISABLED');
ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatus_new" USING ("status"::text::"EventStatus_new");
ALTER TYPE "EventStatus" RENAME TO "EventStatus_old";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
DROP TYPE "EventStatus_old";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "checkInBefore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "coverImage" VARCHAR(255),
ADD COLUMN     "coverImageId" VARCHAR(255),
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "EventTicket" ADD COLUMN     "staffId" TEXT;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
