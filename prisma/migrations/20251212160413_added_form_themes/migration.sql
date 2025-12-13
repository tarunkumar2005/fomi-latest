/*
  Warnings:

  - You are about to drop the column `createdById` on the `form_themes` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `form_themes` table. All the data in the column will be lost.
  - Added the required column `buttons` to the `form_themes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inputFields` to the `form_themes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "form_themes" DROP CONSTRAINT "form_themes_createdById_fkey";

-- DropIndex
DROP INDEX "Form_themeId_idx";

-- DropIndex
DROP INDEX "form_themes_createdById_idx";

-- AlterTable
ALTER TABLE "form_themes" DROP COLUMN "createdById",
DROP COLUMN "thumbnail",
ADD COLUMN     "buttons" JSONB NOT NULL,
ADD COLUMN     "inputFields" JSONB NOT NULL,
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "workspaceId" TEXT;

-- CreateIndex
CREATE INDEX "form_themes_userId_idx" ON "form_themes"("userId");

-- CreateIndex
CREATE INDEX "form_themes_workspaceId_idx" ON "form_themes"("workspaceId");

-- AddForeignKey
ALTER TABLE "form_themes" ADD CONSTRAINT "form_themes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_themes" ADD CONSTRAINT "form_themes_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
