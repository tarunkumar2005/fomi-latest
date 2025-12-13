"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useEditForm } from "@/hooks/useEditForm"
import FormEditHeader from "@/components/forms/edit/header"
import FormCanvas from "@/components/forms/edit/form-canvas"
import ShareFormDialog from "@/components/forms/share-form-dialog"
import FormEditLoadingState from "@/components/forms/edit/form-edit-loading"
import FormEditErrorState from "@/components/forms/edit/form-edit-error"
import UnpublishDialog from "@/components/forms/edit/unpublish-dialog"
import { useSession } from "@/hooks/useSession"
import ErrorBoundary from "@/components/shared/ErrorBoundary"
import { toast } from "sonner"

export default function FormEditClient() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { data: userData } = useSession()

  // Safely extract user ID from session data
  const userId =
    userData && "data" in userData && userData.data && "user" in userData.data
      ? (userData.data as { user: { id: string } }).user.id
      : undefined

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
    isLoadingHeader,
    headerError,
    hasUnsavedChanges,
    isPublishing,
    isDuplicating,
    isDeleting,
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
    flushAllPendingUpdates,
    // AI Enhance operations
    enhanceFieldWithAI,
    regenerateEnhancement,
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
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)

  // Load form data
  useEffect(() => {
    if (!slug) return

    getFormHeaderData(slug).catch((error) => {
      toast.error("Failed to load form", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    })
  }, [slug])

  // Load sections once we have formHeaderData
  useEffect(() => {
    if (!formHeaderData?.id) return
    loadSections(formHeaderData.id)
  }, [formHeaderData?.id])

  // Warn user about unsaved changes before navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      flushAllPendingUpdates()

      if (hasUnsavedChanges || !isSaved) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      flushAllPendingUpdates()
    }
  }, [flushAllPendingUpdates, hasUnsavedChanges, isSaved])

  // Handlers
  const handleSave = useCallback(
    async (data: any) => {
      await saveFormHeaderData(slug, data)
    },
    [slug, saveFormHeaderData],
  )

  const handlePublish = useCallback(async () => {
    if (isPublished) {
      setUnpublishDialogOpen(true)
      return
    }
    await confirmPublish()
  }, [isPublished])

  const confirmPublish = useCallback(async () => {
    try {
      await toggleFormStatus(slug)
      toast.success(isPublished ? "Form unpublished" : "Form published successfully!", {
        description: isPublished ? "Form is now in draft mode" : "Your form is now live and accepting responses",
      })
    } catch (error) {
      toast.error("Failed to update form status", {
        description: error instanceof Error ? error.message : "Please try again",
      })
    }
  }, [isPublished, slug, toggleFormStatus])

  const handleHeaderSave = useCallback(
    async (title: string, description: string, headerImageUrl?: string) => {
      try {
        await updateFormHeader(slug, title, description, headerImageUrl)
        toast.success("Changes saved", {
          description: "Form header updated successfully",
        })
      } catch (error) {
        toast.error("Failed to save changes", {
          description: error instanceof Error ? error.message : "Please try again",
        })
      }
    },
    [slug, updateFormHeader],
  )

  const handlePreview = useCallback(() => {
    router.push(`/forms/${slug}/preview`)
  }, [router, slug])

  const handleShare = useCallback(() => {
    setShareDialogOpen(true)
  }, [])

  const handleDuplicate = useCallback(async () => {
    if (!userData?.data?.user) {
      toast.error("Authentication required", {
        description: "Please sign in to duplicate forms",
      })
      return
    }

    if (!formHeaderData?.id || !formHeaderData?.workspaceId) {
      toast.error("Cannot duplicate form", {
        description: "Form data is not loaded yet",
      })
      return
    }

    try {
      toast.loading("Duplicating form...", { id: "duplicate-form" })
      await duplicateForm(formHeaderData.id, formHeaderData.workspaceId, userData.data.user.id)
      toast.success("Form duplicated successfully!", {
        id: "duplicate-form",
        description: "Redirecting to the new form...",
      })
    } catch (error) {
      toast.error("Failed to duplicate form", {
        id: "duplicate-form",
        description: error instanceof Error ? error.message : "Please try again",
      })
    }
  }, [userData, formHeaderData, duplicateForm])

  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm("Are you sure you want to delete this form? This action cannot be undone.")

    if (!confirmed) return

    const workspaceSlug = formHeaderData?.workspace?.slug || "dashboard"

    try {
      toast.loading("Deleting form...", { id: "delete-form" })
      await deleteForm(slug, workspaceSlug)
      toast.success("Form deleted successfully", {
        id: "delete-form",
        description: "Redirecting to dashboard...",
      })
    } catch (error) {
      toast.error("Failed to delete form", {
        id: "delete-form",
        description: error instanceof Error ? error.message : "Please try again",
      })
    }
  }, [formHeaderData, slug, deleteForm])

  const handleSaveSettings = useCallback(
    async (settings: {
      closeDate?: Date | null
      responseLimit?: number | null
      oneResponsePerUser?: boolean
      thankYouMessage?: string | null
    }) => {
      try {
        await updateFormSettings(slug, settings)
        toast.success("Settings saved successfully", {
          description: "Form settings have been updated",
        })
      } catch (error) {
        toast.error("Failed to save settings", {
          description: error instanceof Error ? error.message : "Please try again",
        })
        throw error
      }
    },
    [slug, updateFormSettings],
  )

  const handleRetry = useCallback(() => {
    getFormHeaderData(slug).catch(() => {})
  }, [slug, getFormHeaderData])

  const handleBack = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  // Error State
  if (headerError) {
    return <FormEditErrorState error={headerError} onRetry={handleRetry} onBack={handleBack} />
  }

  // Loading State
  if (!formHeaderData) {
    return <FormEditLoadingState />
  }

  // Main Content
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <FormEditHeader
        formName={formHeaderData.title || "Untitled Form"}
        isSaved={isSaved}
        isPublished={isPublished}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onShare={handleShare}
        isSaving={isSaving}
        isPublishing={isPublishing}
        isDuplicating={isDuplicating}
        isDeleting={isDeleting}
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

      {/* Main Canvas */}
      <div className="flex-1 overflow-hidden pt-16">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error("Form canvas error:", error, errorInfo)
          }}
        >
          <FormCanvas
            formId={formHeaderData?.id || ""}
            formSlug={slug}
            userId={userId}
            workspaceId={formHeaderData?.workspaceId}
            formHeaderData={formHeaderData}
            onHeaderSave={handleHeaderSave}
            isSaving={isSaving}
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
            onAddField={addField}
            onUpdateField={updateFieldData}
            onDeleteField={removeFieldById}
            onDuplicateField={duplicateFieldById}
            onReorderFields={updateFieldsOrder}
            onMoveField={moveField}
            onEnhanceField={enhanceFieldWithAI}
            onRegenerateEnhancement={regenerateEnhancement}
            onUpdateSectionLogic={updateSectionNavigationLogic}
            onGetSectionDetails={getSectionDetails}
            onGetConditionalFields={getConditionalFieldsForSection}
            onGetSectionsForNavigation={getSectionsForNavigation}
            onValidateLogic={validateLogic}
            onCheckCircularReferences={checkCircularReferences}
            onUpdateRepeatability={updateRepeatability}
          />
        </ErrorBoundary>
      </div>

      {/* Share Dialog */}
      <ShareFormDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        formSlug={slug}
        formName={formHeaderData?.title || "Untitled Form"}
      />

      {/* Unpublish Confirmation Dialog */}
      <UnpublishDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
        onConfirm={confirmPublish}
        isPublishing={isPublishing}
      />
    </div>
  )
}