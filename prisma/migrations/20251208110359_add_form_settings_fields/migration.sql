-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "closeDate" TIMESTAMP(3),
ADD COLUMN     "oneResponsePerUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseLimit" INTEGER,
ADD COLUMN     "thankYouMessage" TEXT;
