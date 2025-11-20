/*
  Warnings:

  - The values [URL] on the enum `FieldType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FieldType_new" AS ENUM ('SHORT_ANSWER', 'EMAIL', 'PHONE', 'PARAGRAPH', 'MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'NUMBER', 'RATING', 'DATE', 'TIME', 'FILE_UPLOAD');
ALTER TABLE "fields" ALTER COLUMN "type" TYPE "FieldType_new" USING ("type"::text::"FieldType_new");
ALTER TYPE "FieldType" RENAME TO "FieldType_old";
ALTER TYPE "FieldType_new" RENAME TO "FieldType";
DROP TYPE "public"."FieldType_old";
COMMIT;
