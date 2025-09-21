/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commission_value` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission_value` to the `Lodging` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatusType" ADD VALUE 'reserved';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "commission_type" TEXT NOT NULL DEFAULT 'percentage',
ADD COLUMN     "commission_value" DECIMAL(18,4) NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "code" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "payment_type" TEXT NOT NULL DEFAULT 'full_payment';

-- AlterTable
ALTER TABLE "Lodging" ADD COLUMN     "commission_type" TEXT NOT NULL DEFAULT 'percentage',
ADD COLUMN     "commission_value" DECIMAL(18,4) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");
