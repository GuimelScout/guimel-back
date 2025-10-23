-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "createdBy" TEXT;

-- CreateIndex
CREATE INDEX "Review_createdBy_idx" ON "Review"("createdBy");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
