-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "customTheme" JSONB,
ADD COLUMN     "themeId" TEXT;

-- CreateTable
CREATE TABLE "form_themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "thumbnail" TEXT,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "colors" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "layout" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_themes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_themes_isBuiltIn_idx" ON "form_themes"("isBuiltIn");

-- CreateIndex
CREATE INDEX "form_themes_isPublic_idx" ON "form_themes"("isPublic");

-- CreateIndex
CREATE INDEX "form_themes_category_idx" ON "form_themes"("category");

-- CreateIndex
CREATE INDEX "form_themes_createdById_idx" ON "form_themes"("createdById");

-- CreateIndex
CREATE INDEX "Form_themeId_idx" ON "Form"("themeId");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "form_themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_themes" ADD CONSTRAINT "form_themes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
