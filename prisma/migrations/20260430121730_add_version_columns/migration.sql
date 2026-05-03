-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
