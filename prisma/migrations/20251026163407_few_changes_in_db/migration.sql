/*
  Warnings:

  - You are about to drop the column `isArchived` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `isDraft` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Form` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'FORM_CREATED';

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "isArchived",
DROP COLUMN "isDraft",
DROP COLUMN "isPublished",
ADD COLUMN     "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "umamiWebsiteId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
