-- CreateEnum
CREATE TYPE "BookingStatusType" AS ENUM ('pending', 'paid', 'cancelled', 'confirmed', 'completed');

-- CreateEnum
CREATE TYPE "PaymentStatusType" AS ENUM ('pending', 'processing', 'succeeded', 'cancelled', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "UserStatusType" AS ENUM ('initial', 'registration_done', 'verified');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "descriptionActivities" JSONB NOT NULL DEFAULT '[{"type":"paragraph","children":[{"text":""}]}]',
    "address" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(18,4),
    "type_day" TEXT NOT NULL,
    "available" TEXT,
    "link" TEXT NOT NULL DEFAULT '',
    "image_id" TEXT,
    "image_filesize" INTEGER,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_extension" TEXT,
    "hostBy" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityGallery" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_id" TEXT,
    "image_filesize" INTEGER,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_extension" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityInclude" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityInclude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityWhatToDo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityWhatToDo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAvailable" (
    "id" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "specific_date" DATE,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "saturday" BOOLEAN NOT NULL DEFAULT true,
    "sunday" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityAvailable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAvailableDay" (
    "id" TEXT NOT NULL,
    "day" DATE,
    "activity" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityAvailableDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "guests_adults" INTEGER,
    "guests_childs" INTEGER,
    "status" "BookingStatusType" NOT NULL DEFAULT 'pending',
    "activity" TEXT,
    "lodging" TEXT,
    "user" TEXT,
    "payment" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "image_id" TEXT,
    "image_filesize" INTEGER,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_extension" TEXT,
    "link" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationGallery" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_id" TEXT,
    "image_filesize" INTEGER,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_extension" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lodging" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "price" DECIMAL(18,4),
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "lat" TEXT NOT NULL DEFAULT '',
    "lng" TEXT NOT NULL DEFAULT '',
    "hostBy" TEXT,
    "link" TEXT NOT NULL DEFAULT '',
    "logo_id" TEXT,
    "logo_filesize" INTEGER,
    "logo_width" INTEGER,
    "logo_height" INTEGER,
    "logo_extension" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lodging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LodgingType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "max_person_capacity" INTEGER,
    "lodging" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LodgingGallery" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_id" TEXT,
    "image_filesize" INTEGER,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_extension" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgingGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LodgingInclude" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgingInclude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,6) DEFAULT 0.000000,
    "status" "PaymentStatusType" NOT NULL DEFAULT 'pending',
    "processorStripeChargeId" TEXT NOT NULL DEFAULT '',
    "stripeErrorMessage" TEXT NOT NULL DEFAULT '',
    "processorRefundId" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "activity" TEXT,
    "lodging" TEXT,
    "user" TEXT,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "cardType" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "lastFourDigits" TEXT NOT NULL DEFAULT '',
    "expMonth" TEXT NOT NULL DEFAULT '',
    "expYear" TEXT NOT NULL DEFAULT '',
    "stripeProcessorId" TEXT NOT NULL DEFAULT '',
    "stripePaymentMethodId" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "postalCode" TEXT NOT NULL DEFAULT '',
    "ownerName" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "review" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER,
    "activity" TEXT,
    "lodging" TEXT,
    "user" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "secondLastName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "stripeCustomerId" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "status" "UserStatusType" NOT NULL DEFAULT 'initial',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "image_id" TEXT,
    "image_filesize" INTEGER,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "image_extension" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Activity_includes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Activity_whatToDo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Activity_lodging" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Activity_location" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Activity_gallery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Location_lodging" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Location_gallery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Lodging_gallery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Lodging_includes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PaymentMethod_user" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Role_user" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_available_key" ON "Activity"("available");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_link_key" ON "Activity"("link");

-- CreateIndex
CREATE INDEX "Activity_hostBy_idx" ON "Activity"("hostBy");

-- CreateIndex
CREATE INDEX "ActivityAvailableDay_activity_idx" ON "ActivityAvailableDay"("activity");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_payment_key" ON "Booking"("payment");

-- CreateIndex
CREATE INDEX "Booking_activity_idx" ON "Booking"("activity");

-- CreateIndex
CREATE INDEX "Booking_lodging_idx" ON "Booking"("lodging");

-- CreateIndex
CREATE INDEX "Booking_user_idx" ON "Booking"("user");

-- CreateIndex
CREATE UNIQUE INDEX "Location_link_key" ON "Location"("link");

-- CreateIndex
CREATE UNIQUE INDEX "Lodging_link_key" ON "Lodging"("link");

-- CreateIndex
CREATE INDEX "Lodging_hostBy_idx" ON "Lodging"("hostBy");

-- CreateIndex
CREATE INDEX "LodgingType_lodging_idx" ON "LodgingType"("lodging");

-- CreateIndex
CREATE INDEX "Payment_activity_idx" ON "Payment"("activity");

-- CreateIndex
CREATE INDEX "Payment_lodging_idx" ON "Payment"("lodging");

-- CreateIndex
CREATE INDEX "Payment_user_idx" ON "Payment"("user");

-- CreateIndex
CREATE INDEX "Payment_paymentMethod_idx" ON "Payment"("paymentMethod");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripePaymentMethodId_key" ON "PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "Review_activity_idx" ON "Review"("activity");

-- CreateIndex
CREATE INDEX "Review_lodging_idx" ON "Review"("lodging");

-- CreateIndex
CREATE INDEX "Review_user_idx" ON "Review"("user");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_link_key" ON "User"("link");

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_includes_AB_unique" ON "_Activity_includes"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_includes_B_index" ON "_Activity_includes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_whatToDo_AB_unique" ON "_Activity_whatToDo"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_whatToDo_B_index" ON "_Activity_whatToDo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_lodging_AB_unique" ON "_Activity_lodging"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_lodging_B_index" ON "_Activity_lodging"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_location_AB_unique" ON "_Activity_location"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_location_B_index" ON "_Activity_location"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Activity_gallery_AB_unique" ON "_Activity_gallery"("A", "B");

-- CreateIndex
CREATE INDEX "_Activity_gallery_B_index" ON "_Activity_gallery"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Location_lodging_AB_unique" ON "_Location_lodging"("A", "B");

-- CreateIndex
CREATE INDEX "_Location_lodging_B_index" ON "_Location_lodging"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Location_gallery_AB_unique" ON "_Location_gallery"("A", "B");

-- CreateIndex
CREATE INDEX "_Location_gallery_B_index" ON "_Location_gallery"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Lodging_gallery_AB_unique" ON "_Lodging_gallery"("A", "B");

-- CreateIndex
CREATE INDEX "_Lodging_gallery_B_index" ON "_Lodging_gallery"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Lodging_includes_AB_unique" ON "_Lodging_includes"("A", "B");

-- CreateIndex
CREATE INDEX "_Lodging_includes_B_index" ON "_Lodging_includes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PaymentMethod_user_AB_unique" ON "_PaymentMethod_user"("A", "B");

-- CreateIndex
CREATE INDEX "_PaymentMethod_user_B_index" ON "_PaymentMethod_user"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Role_user_AB_unique" ON "_Role_user"("A", "B");

-- CreateIndex
CREATE INDEX "_Role_user_B_index" ON "_Role_user"("B");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_available_fkey" FOREIGN KEY ("available") REFERENCES "ActivityAvailable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_hostBy_fkey" FOREIGN KEY ("hostBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAvailableDay" ADD CONSTRAINT "ActivityAvailableDay_activity_fkey" FOREIGN KEY ("activity") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_activity_fkey" FOREIGN KEY ("activity") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_lodging_fkey" FOREIGN KEY ("lodging") REFERENCES "Lodging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_payment_fkey" FOREIGN KEY ("payment") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lodging" ADD CONSTRAINT "Lodging_hostBy_fkey" FOREIGN KEY ("hostBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LodgingType" ADD CONSTRAINT "LodgingType_lodging_fkey" FOREIGN KEY ("lodging") REFERENCES "Lodging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_activity_fkey" FOREIGN KEY ("activity") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_lodging_fkey" FOREIGN KEY ("lodging") REFERENCES "Lodging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentMethod_fkey" FOREIGN KEY ("paymentMethod") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_activity_fkey" FOREIGN KEY ("activity") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_lodging_fkey" FOREIGN KEY ("lodging") REFERENCES "Lodging"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_includes" ADD CONSTRAINT "_Activity_includes_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_includes" ADD CONSTRAINT "_Activity_includes_B_fkey" FOREIGN KEY ("B") REFERENCES "ActivityInclude"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_whatToDo" ADD CONSTRAINT "_Activity_whatToDo_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_whatToDo" ADD CONSTRAINT "_Activity_whatToDo_B_fkey" FOREIGN KEY ("B") REFERENCES "ActivityWhatToDo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_lodging" ADD CONSTRAINT "_Activity_lodging_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_lodging" ADD CONSTRAINT "_Activity_lodging_B_fkey" FOREIGN KEY ("B") REFERENCES "Lodging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_location" ADD CONSTRAINT "_Activity_location_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_location" ADD CONSTRAINT "_Activity_location_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_gallery" ADD CONSTRAINT "_Activity_gallery_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Activity_gallery" ADD CONSTRAINT "_Activity_gallery_B_fkey" FOREIGN KEY ("B") REFERENCES "ActivityGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Location_lodging" ADD CONSTRAINT "_Location_lodging_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Location_lodging" ADD CONSTRAINT "_Location_lodging_B_fkey" FOREIGN KEY ("B") REFERENCES "Lodging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Location_gallery" ADD CONSTRAINT "_Location_gallery_A_fkey" FOREIGN KEY ("A") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Location_gallery" ADD CONSTRAINT "_Location_gallery_B_fkey" FOREIGN KEY ("B") REFERENCES "LocationGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Lodging_gallery" ADD CONSTRAINT "_Lodging_gallery_A_fkey" FOREIGN KEY ("A") REFERENCES "Lodging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Lodging_gallery" ADD CONSTRAINT "_Lodging_gallery_B_fkey" FOREIGN KEY ("B") REFERENCES "LodgingGallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Lodging_includes" ADD CONSTRAINT "_Lodging_includes_A_fkey" FOREIGN KEY ("A") REFERENCES "Lodging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Lodging_includes" ADD CONSTRAINT "_Lodging_includes_B_fkey" FOREIGN KEY ("B") REFERENCES "LodgingInclude"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMethod_user" ADD CONSTRAINT "_PaymentMethod_user_A_fkey" FOREIGN KEY ("A") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentMethod_user" ADD CONSTRAINT "_PaymentMethod_user_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Role_user" ADD CONSTRAINT "_Role_user_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Role_user" ADD CONSTRAINT "_Role_user_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
