-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "technicalSheetUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "LocationService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Location_services" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Location_services_AB_unique" ON "_Location_services"("A", "B");

-- CreateIndex
CREATE INDEX "_Location_services_B_index" ON "_Location_services"("B");

-- AddForeignKey
ALTER TABLE "_Location_services" ADD CONSTRAINT "_Location_services_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Location_services" ADD CONSTRAINT "_Location_services_B_fkey" FOREIGN KEY ("B") REFERENCES "LocationService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
