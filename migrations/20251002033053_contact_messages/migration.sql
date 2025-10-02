-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "commission_value" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lodging" ALTER COLUMN "commission_value" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
