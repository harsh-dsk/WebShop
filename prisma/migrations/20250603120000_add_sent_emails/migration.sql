-- CreateEnum
CREATE TYPE "EmailNotificationType" AS ENUM ('ORDER_CONFIRMATION', 'ADMIN_NEW_ORDER', 'STATUS_CONFIRMED', 'STATUS_PROCESSING', 'STATUS_SHIPPED', 'STATUS_DELIVERED', 'STATUS_CANCELLED');

-- CreateTable
CREATE TABLE "sent_emails" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "EmailNotificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sent_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sent_emails_orderId_idx" ON "sent_emails"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "sent_emails_orderId_type_key" ON "sent_emails"("orderId", "type");

-- AddForeignKey
ALTER TABLE "sent_emails" ADD CONSTRAINT "sent_emails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
