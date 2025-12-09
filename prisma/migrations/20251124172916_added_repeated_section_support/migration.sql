-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repeatCount" INTEGER DEFAULT 1;
