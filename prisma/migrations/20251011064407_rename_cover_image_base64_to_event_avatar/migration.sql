/*
  Warnings:

  - You are about to drop the column `coverImageBase64` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "coverImageBase64",
ADD COLUMN     "eventAvatar" TEXT;
