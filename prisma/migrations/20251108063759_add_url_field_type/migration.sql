/*
  Warnings:

  - You are about to drop the column `umamiWebsiteId` on the `Form` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'URL';

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "umamiWebsiteId";
