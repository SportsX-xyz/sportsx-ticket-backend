-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'PENDING', 'PAID', 'TRANSFERING', 'TRANSFERED', 'TIMEOUT', 'TRANSFERFAILED');

-- CreateEnum
CREATE TYPE "TicketTypeStatus" AS ENUM ('NEW', 'PROGRESSING', 'DONE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'SOLD', 'USED', 'RESALE', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "walletId" VARCHAR(255) NOT NULL,
    "avatarUrl" VARCHAR(255),
    "isOrganizer" BOOLEAN NOT NULL DEFAULT false,
    "resaleFeeRate" INTEGER NOT NULL,
    "maxResaleTimes" INTEGER NOT NULL,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStaff" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "EventStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketOrder" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sellerId" TEXT,
    "buyerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "EventTicketOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketType" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierName" VARCHAR(100) NOT NULL,
    "tierPrice" DECIMAL(10,2) NOT NULL,
    "tierRows" INTEGER NOT NULL,
    "tierColumns" INTEGER NOT NULL,
    "initStatus" "TicketTypeStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "EventTicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicket" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "columnNumber" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "initialPrice" DECIMAL(10,2) NOT NULL,
    "currentPrice" DECIMAL(10,2) NOT NULL,
    "saleStartTime" TIMESTAMP(3) NOT NULL,
    "saleEndTime" TIMESTAMP(3) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "nftTokenId" VARCHAR(255),
    "ownerId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "EventTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "startTime" TIMESTAMPTZ NOT NULL,
    "endTime" TIMESTAMPTZ NOT NULL,
    "ticketReleaseTime" TIMESTAMPTZ NOT NULL,
    "stopSaleBefore" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaff" ADD CONSTRAINT "EventStaff_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketOrder" ADD CONSTRAINT "EventTicketOrder_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "EventTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketOrder" ADD CONSTRAINT "EventTicketOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketOrder" ADD CONSTRAINT "EventTicketOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketType" ADD CONSTRAINT "EventTicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "EventTicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicket" ADD CONSTRAINT "EventTicket_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
