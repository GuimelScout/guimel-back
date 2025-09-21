/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commission_value` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commission_value` to the `Lodging` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add enum value for reserved status
ALTER TYPE "BookingStatusType" ADD VALUE IF NOT EXISTS 'reserved';

-- Step 2: Add commission fields with default values
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "commission_type" TEXT DEFAULT 'percentage';
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "commission_value" DECIMAL(18,4) DEFAULT 15.00;

ALTER TABLE "Lodging" ADD COLUMN IF NOT EXISTS "commission_type" TEXT DEFAULT 'percentage';
ALTER TABLE "Lodging" ADD COLUMN IF NOT EXISTS "commission_value" DECIMAL(18,4) DEFAULT 10.00;

-- Step 3: Add booking fields with default values
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "code" TEXT DEFAULT '';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "payment_type" TEXT DEFAULT 'full_payment';

-- Step 4: Update existing records with proper values
UPDATE "Activity" SET 
  "commission_type" = 'percentage',
  "commission_value" = 15.00
WHERE "commission_type" IS NULL OR "commission_value" IS NULL;

UPDATE "Lodging" SET 
  "commission_type" = 'percentage',
  "commission_value" = 10.00
WHERE "commission_type" IS NULL OR "commission_value" IS NULL;

-- Step 5: Generate codes for existing bookings
UPDATE "Booking" SET 
  "code" = CONCAT(
    UPPER(SUBSTRING("id"::text, LENGTH("id"::text) - 5, 6)),
    '-',
    TO_CHAR("createdAt", 'DDMMYY')
  )
WHERE "code" = '' OR "code" IS NULL;

-- Step 6: Make fields NOT NULL
ALTER TABLE "Activity" ALTER COLUMN "commission_type" SET NOT NULL;
ALTER TABLE "Activity" ALTER COLUMN "commission_value" SET NOT NULL;

ALTER TABLE "Lodging" ALTER COLUMN "commission_type" SET NOT NULL;
ALTER TABLE "Lodging" ALTER COLUMN "commission_value" SET NOT NULL;

ALTER TABLE "Booking" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "payment_type" SET NOT NULL;

-- Step 7: Create unique index for booking code
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_code_key" ON "Booking"("code");
