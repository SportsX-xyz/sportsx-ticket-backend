-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "solanaEventAddress" VARCHAR(255),
ADD COLUMN     "solanaTxHash" VARCHAR(255),
ADD COLUMN     "symbol" VARCHAR(255);
