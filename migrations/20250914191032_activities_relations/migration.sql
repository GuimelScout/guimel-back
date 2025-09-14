/*
  Warnings:

  - You are about to drop the column `activity` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `activity` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_activity_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_activity_fkey";

-- DropIndex
DROP INDEX "Booking_activity_idx";

-- DropIndex
DROP INDEX "Payment_activity_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "activity",
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "activity";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "facebook" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkedin" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tiktok" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "twitter" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "website" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "youtube" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "_Activity_booking" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Activity_payment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_booking_AB_unique" ON "_Activity_booking"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_booking_B_index" ON "_Activity_booking"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_payment_AB_unique" ON "_Activity_payment"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_payment_B_index" ON "_Activity_payment"("B");

-- CreateIndex
CREATE INDEX "Booking_location_idx" ON "Booking"("location");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_location_fkey" FOREIGN KEY ("location") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_booking" ADD CONSTRAINT "_Activity_booking_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_booking" ADD CONSTRAINT "_Activity_booking_B_fkey" FOREIGN KEY ("B") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_payment" ADD CONSTRAINT "_Activity_payment_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_payment" ADD CONSTRAINT "_Activity_payment_B_fkey" FOREIGN KEY ("B") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
