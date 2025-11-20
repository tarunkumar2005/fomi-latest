-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'LINEAR_SCALE';

-- AlterTable
ALTER TABLE "fields" ADD COLUMN     "maxLabel" TEXT,
ADD COLUMN     "minLabel" TEXT;
