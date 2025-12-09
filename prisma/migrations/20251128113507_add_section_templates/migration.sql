-- CreateTable
CREATE TABLE "section_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_fields" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "options" JSONB,
    "validation" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "section_templates_category_idx" ON "section_templates"("category");

-- CreateIndex
CREATE INDEX "section_templates_isBuiltIn_idx" ON "section_templates"("isBuiltIn");

-- CreateIndex
CREATE INDEX "section_templates_isPublic_idx" ON "section_templates"("isPublic");

-- CreateIndex
CREATE INDEX "section_templates_createdById_idx" ON "section_templates"("createdById");

-- CreateIndex
CREATE INDEX "template_fields_templateId_idx" ON "template_fields"("templateId");

-- CreateIndex
CREATE INDEX "template_fields_templateId_order_idx" ON "template_fields"("templateId", "order");

-- AddForeignKey
ALTER TABLE "section_templates" ADD CONSTRAINT "section_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_fields" ADD CONSTRAINT "template_fields_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "section_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
