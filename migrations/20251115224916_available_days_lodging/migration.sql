-- AlterTable
ALTER TABLE "Lodging" ADD COLUMN     "type_day" TEXT;

-- CreateTable
CREATE TABLE "LodgingAvailableDay" (
    "id" TEXT NOT NULL,
    "day" DATE,
    "lodging" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgingAvailableDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LodgingAvailableDay_lodging_idx" ON "LodgingAvailableDay"("lodging");

-- AddForeignKey
ALTER TABLE "LodgingAvailableDay" ADD CONSTRAINT "LodgingAvailableDay_lodging_fkey" FOREIGN KEY ("lodging") REFERENCES "Lodging"("id") ON DELETE SET NULL ON UPDATE CASCADE;
