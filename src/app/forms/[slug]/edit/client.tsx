"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditForm } from "@/hooks/useEditForm";
import FormEditHeader from "@/components/forms/edit/header";
import FormCanvas from "@/components/forms/edit/form-canvas";
import ShareFormDialog from "@/components/forms/share-form-dialog";
import { useSession } from "@/hooks/useSession";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FormEditClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: userData } = useSession();

  // Safely extract user ID from session data
  const userId =
    userData && "data" in userData && userData.data && "user" in userData.data
      ? (userData.data as { user: { id: string } }).user.id
      : undefined;

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
  } = useEditForm();

  // Form state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    getFormHeaderData(slug).catch((error) => {
      toast.error("Failed to load form", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    });
  }, [slug]);

  // Load sections once we have formHeaderData
  useEffect(() => {
    if (!formHeaderData?.id) return;

    loadSections(formHeaderData.id);
  }, [formHeaderData?.id]);

  // Warn user about unsaved changes before navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Attempt to flush pending updates (best effort)
      flushAllPendingUpdates();

      // If there are unsaved changes, warn the user
      if (hasUnsavedChanges || !isSaved) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Flush pending updates when component unmounts
      flushAllPendingUpdates();
    };
  }, [flushAllPendingUpdates, hasUnsavedChanges, isSaved]);

  const handleSave = async (data: any) => {
    await saveFormHeaderData(slug, data);
  };

  const handlePublish = async () => {
    // If published, show confirmation dialog for unpublish
    if (isPublished) {
      setUnpublishDialogOpen(true);
      return;
    }

    // Directly publish if not published
    await confirmPublish();
  };

  const confirmPublish = async () => {
    try {
      await toggleFormStatus(slug);
      toast.success(
        isPublished ? "Form unpublished" : "Form published successfully!",
        {
          description: isPublished
            ? "Form is now in draft mode"
            : "Your form is now live and accepting responses",
        }
      );
    } catch (error) {
      toast.error("Failed to update form status", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleHeaderSave = async (
    title: string,
    description: string,
    headerImageUrl?: string
  ) => {
    try {
      await updateFormHeader(slug, title, description, headerImageUrl);
      toast.success("Changes saved", {
        description: "Form header updated successfully",
      });
    } catch (error) {
      toast.error("Failed to save changes", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handlePreview = () => {
    // Navigate to preview page
    router.push(`/forms/${slug}/preview`);
  };

  const handleShare = () => {
    // Open share dialog
    setShareDialogOpen(true);
  };

  const handleDuplicate = async () => {
    if (!userData?.data?.user) {
      toast.error("Authentication required", {
        description: "Please sign in to duplicate forms",
      });
      return;
    }

    if (!formHeaderData?.id) {
      toast.error("Cannot duplicate form", {
        description: "Form data is not loaded yet",
      });
      return;
    }

    if (!formHeaderData?.workspaceId) {
      toast.error("Cannot duplicate form", {
        description: "Workspace information is missing",
      });
      return;
    }

    try {
      toast.loading("Duplicating form...", { id: "duplicate-form" });
      await duplicateForm(
        formHeaderData.id,
        formHeaderData.workspaceId,
        userData.data.user.id
      );
      toast.success("Form duplicated successfully!", {
        id: "duplicate-form",
        description: "Redirecting to the new form...",
      });
    } catch (error) {
      toast.error("Failed to duplicate form", {
        id: "duplicate-form",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this form? This action cannot be undone."
    );

    if (!confirmed) return;

    // Use workspace slug from form data, fallback to dashboard if not available
    const workspaceSlug = formHeaderData?.workspace?.slug || "dashboard";

    try {
      toast.loading("Deleting form...", { id: "delete-form" });
      await deleteForm(slug, workspaceSlug);
      toast.success("Form deleted successfully", {
        id: "delete-form",
        description: "Redirecting to dashboard...",
      });
    } catch (error) {
      toast.error("Failed to delete form", {
        id: "delete-form",
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const handleSaveSettings = async (settings: {
    closeDate?: Date | null;
    responseLimit?: number | null;
    oneResponsePerUser?: boolean;
    thankYouMessage?: string | null;
  }) => {
    try {
      await updateFormSettings(slug, settings);
      toast.success("Settings saved successfully", {
        description: "Form settings have been updated",
      });
    } catch (error) {
      toast.error("Failed to save settings", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      throw error;
    }
  };

  if (headerError) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed to Load Form</h2>
          <p className="text-muted-foreground mb-6">{headerError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => getFormHeaderData(slug).catch(() => {})}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
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
        <div
          className="flex-1 overflow-hidden"
          role="status"
          aria-busy="true"
          aria-live="polite"
        >
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
                <div className="relative" aria-hidden="true">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div
                    className="absolute inset-0 w-10 h-10 sm:w-12 sm:h-12 border-4 border-transparent border-b-primary/40 rounded-full animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                    }}
                  />
                </div>
                <div className="text-center space-y-1 sm:space-y-2">
                  <p className="text-base sm:text-lg font-semibold text-foreground">
                    Loading your form
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Please wait while we fetch your data...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
      {/* Main Layout - Below Header */}
      <div className="flex-1 overflow-hidden pt-16">
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error("Form canvas error:", error, errorInfo);
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
            // AI Enhance props
            onEnhanceField={enhanceFieldWithAI}
            onRegenerateEnhancement={regenerateEnhancement}
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
        </ErrorBoundary>
      </div>
      {/* Share Form Dialog */}
      <ShareFormDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        formSlug={slug}
        formName={formHeaderData?.title || "Untitled Form"}
      />

      {/* Unpublish Confirmation Dialog */}
      <AlertDialog
        open={unpublishDialogOpen}
        onOpenChange={setUnpublishDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Form?</AlertDialogTitle>
            <AlertDialogDescription>
              This form will no longer be accessible to respondents. Any shared
              links will stop working until you publish it again. You can
              republish it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setUnpublishDialogOpen(false);
                await confirmPublish();
              }}
            >
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
