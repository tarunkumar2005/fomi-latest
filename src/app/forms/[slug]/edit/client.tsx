"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useEditForm } from "@/hooks/useEditForm"
import FormEditHeader from "@/components/forms/edit/header"
import FormCanvas from "@/components/forms/edit/form-canvas"
import ShareFormDialog from "@/components/forms/share-form-dialog"
import { useSession } from "@/hooks/useSession"

export default function FormEditClient() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { data: userData } = useSession()

  const {
    getFormHeaderData,
    saveFormHeaderData,
    toggleFormStatus,
    updateFormHeader,
    updateFormSettings,
    isPublished,
    formHeaderData,
    isSaved,
    isSaving,
    duplicateForm,
    deleteForm,
    // Section operations
    sections,
    loadSections,
    isLoadingSections,
    activeSectionId,
    setActiveSectionId,
    addSection,
    addSectionFromTemplate,
    updateSectionData,
    removeSectionById,
    duplicateSectionById,
    updateSectionsOrder,
    updateRepeatability,
    // Field operations
    addField,
    updateFieldData,
    removeFieldById,
    duplicateFieldById,
    updateFieldsOrder,
    moveField,
    // Conditional logic operations
    updateSectionNavigationLogic,
    getSectionDetails,
    getConditionalFieldsForSection,
    getSectionsForNavigation,
    validateLogic,
    checkCircularReferences,
  } = useEditForm()

  // Form state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    if (!slug) return

    getFormHeaderData(slug)
  }, [slug])

  // Load sections once we have formHeaderData
  useEffect(() => {
    if (!formHeaderData?.id) return

    loadSections(formHeaderData.id)
  }, [formHeaderData?.id])

  const handleSave = async (data: any) => {
    await saveFormHeaderData(slug, data)
  }

  const handlePublish = async () => {
    await toggleFormStatus(slug)
  }

  const handleHeaderSave = async (title: string, description: string, headerImageUrl?: string) => {
    await updateFormHeader(slug, title, description, headerImageUrl)
  }

  const handlePreview = () => {
    // Navigate to preview page
    router.push(`/forms/${slug}/preview`)
  }

  const handleShare = () => {
    // Open share dialog
    setShareDialogOpen(true)
  }

  const handleDuplicate = async () => {
    if (!userData?.data?.user) return

    const workspaceId = "demo_workspace_001"

    // TODO: Get actual formId from formHeaderData
    const formId = formHeaderData?.id || slug // Temporary - should get actual formId

    await duplicateForm(formId, workspaceId, userData.data.user.id)
  }

  const handleDelete = async () => {
    // TODO: Get actual workspace slug from form data or context
    const workspaceSlug = "default" // Temporary - should come from formHeaderData or user context
    await deleteForm(slug, workspaceSlug)
  }

  const handleSaveSettings = async (settings: {
    closeDate?: Date | null
    responseLimit?: number | null
    oneResponsePerUser?: boolean
    thankYouMessage?: string | null
  }) => {
    await updateFormSettings(slug, settings)
  }

  if (!formHeaderData) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
        {/* Loading Header Skeleton */}
        <div className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Back button skeleton */}
            <div className="w-16 sm:w-20 h-9 bg-muted/60 animate-pulse rounded-lg" />
            <div className="h-6 w-px bg-border/50 hidden sm:block" />
            {/* Form name skeleton */}
            <div className="w-32 sm:w-48 h-6 bg-muted/60 animate-pulse rounded-lg" />
            {/* Saved indicator skeleton */}
            <div className="w-14 sm:w-16 h-5 bg-muted/60 animate-pulse rounded-full hidden sm:block" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Action buttons skeleton */}
            <div className="w-9 h-9 bg-muted/60 animate-pulse rounded-lg sm:hidden" />
            <div className="hidden sm:block w-20 h-9 bg-muted/60 animate-pulse rounded-lg" />
            <div className="w-20 sm:w-24 h-9 bg-primary/20 animate-pulse rounded-lg" />
            <div className="hidden sm:block w-9 h-9 bg-muted/60 animate-pulse rounded-lg" />
            <div className="hidden sm:block w-9 h-9 bg-muted/60 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Loading Canvas Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex items-center justify-center p-4 sm:p-6">
            <div className="max-w-4xl w-full mx-auto space-y-4 sm:space-y-6">
              {/* Form Header Skeleton */}
              <div className="w-full bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
                {/* Header image skeleton with gradient */}
                <div className="h-40 sm:h-56 lg:h-64 bg-linear-to-br from-muted/80 via-muted/60 to-muted/40 animate-pulse relative">
                  <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent" />
                </div>

                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-4 sm:space-y-6">
                  {/* Title skeleton */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="h-8 sm:h-10 lg:h-12 bg-muted/60 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-8 sm:h-10 lg:h-12 bg-muted/40 rounded-lg w-1/2 animate-pulse" />
                  </div>

                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 sm:h-5 bg-muted/50 rounded-md w-full animate-pulse" />
                    <div className="h-4 sm:h-5 bg-muted/40 rounded-md w-5/6 animate-pulse" />
                    <div className="h-4 sm:h-5 bg-muted/30 rounded-md w-4/6 animate-pulse" />
                  </div>

                  {/* Meta info skeleton */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                      <div className="w-14 sm:w-16 h-4 bg-muted/40 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted/50 rounded-lg animate-pulse" />
                      <div className="w-20 sm:w-24 h-4 bg-muted/40 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Skeletons */}
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full bg-card rounded-xl border border-border/50 shadow-sm p-4 sm:p-6"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div className="space-y-3 sm:space-y-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg" />
                        <div className="h-5 sm:h-6 bg-muted/60 rounded-md w-2/3" />
                      </div>
                      <div className="h-4 bg-muted/40 rounded-md w-1/2" />
                      <div className="h-10 bg-muted/30 rounded-lg w-full" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading Text with Animation */}
              <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div
                    className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-b-primary/40 rounded-full animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  />
                </div>
                <div className="text-center space-y-1 sm:space-y-2">
                  <p className="text-base sm:text-lg font-semibold text-foreground">Loading your form</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Please wait while we fetch your data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-background via-background to-muted/10">
      <FormEditHeader
        formName={formHeaderData.title || "Untitled Form"}
        isSaved={isSaved}
        isPublished={isPublished}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onShare={handleShare}
        isSaving={isSaving}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        formSettings={{
          closeDate: formHeaderData.closeDate,
          responseLimit: formHeaderData.responseLimit,
          oneResponsePerUser: formHeaderData.oneResponsePerUser,
          thankYouMessage: formHeaderData.thankYouMessage,
        }}
        onSaveSettings={handleSaveSettings}
      />
      {/* Main Layout - Below Header */}
      <div className="flex-1 overflow-hidden pt-16">
        <FormCanvas
          formSlug={slug}
          formHeaderData={formHeaderData}
          onHeaderSave={handleHeaderSave}
          // Section props
          sections={sections}
          isLoadingSections={isLoadingSections}
          activeSectionId={activeSectionId}
          onActiveSectionChange={setActiveSectionId}
          onAddSection={addSection}
          onAddSectionFromTemplate={addSectionFromTemplate}
          onUpdateSection={updateSectionData}
          onDeleteSection={removeSectionById}
          onDuplicateSection={duplicateSectionById}
          onReorderSections={updateSectionsOrder}
          // Field props
          onAddField={addField}
          onUpdateField={updateFieldData}
          onDeleteField={removeFieldById}
          onDuplicateField={duplicateFieldById}
          onReorderFields={updateFieldsOrder}
          onMoveField={moveField}
          // Conditional logic props
          onUpdateSectionLogic={updateSectionNavigationLogic}
          onGetSectionDetails={getSectionDetails}
          onGetConditionalFields={getConditionalFieldsForSection}
          onGetSectionsForNavigation={getSectionsForNavigation}
          onValidateLogic={validateLogic}
          onCheckCircularReferences={checkCircularReferences}
          // Repeatability props
          onUpdateRepeatability={updateRepeatability}
        />
      </div>
      {/* Share Form Dialog */}
      <ShareFormDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        formSlug={slug}
        formName={formHeaderData?.form?.title || "Untitled Form"}
      />
    </div>
  )
}