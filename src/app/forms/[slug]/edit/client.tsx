"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditForm } from "@/hooks/useEditForm";
import FormEditHeader from "@/components/forms/edit/header";
import FormCanvas from "@/components/forms/edit/form-canvas";
import ShareFormDialog from "@/components/forms/share-form-dialog";
import { useSession } from "@/hooks/useSession";

export default function FormEditClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: userData } = useSession();

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
  } = useEditForm();

  // Form state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    getFormHeaderData(slug);
  }, [slug]);

  // Load sections once we have formHeaderData
  useEffect(() => {
    if (!formHeaderData?.id) return;

    loadSections(formHeaderData.id);
  }, [formHeaderData?.id]);

  const handleSave = async (data: any) => {
    await saveFormHeaderData(slug, data);
  };

  const handlePublish = async () => {
    await toggleFormStatus(slug);
  };

  const handleHeaderSave = async (
    title: string,
    description: string,
    headerImageUrl?: string
  ) => {
    await updateFormHeader(slug, title, description, headerImageUrl);
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
    if (!userData?.data?.user) return;

    const workspaceId = "demo_workspace_001";

    // TODO: Get actual formId from formHeaderData
    const formId = formHeaderData?.id || slug; // Temporary - should get actual formId

    await duplicateForm(formId, workspaceId, userData.data.user.id);
  };

  const handleDelete = async () => {
    // TODO: Get actual workspace slug from form data or context
    const workspaceSlug = "default"; // Temporary - should come from formHeaderData or user context
    await deleteForm(slug, workspaceSlug);
  };

  const handleSaveSettings = async (settings: {
    closeDate?: Date | null;
    responseLimit?: number | null;
    oneResponsePerUser?: boolean;
    thankYouMessage?: string | null;
  }) => {
    await updateFormSettings(slug, settings);
  };

  if (!formHeaderData) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        {/* Loading Header Skeleton */}
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back button skeleton */}
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            {/* Form name skeleton */}
            <div className="w-48 h-6 bg-muted animate-pulse rounded-md" />
            {/* Saved indicator skeleton */}
            <div className="w-16 h-5 bg-muted animate-pulse rounded-full" />
          </div>

          <div className="flex items-center gap-3">
            {/* Action buttons skeleton */}
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
          </div>
        </div>

        {/* Loading Canvas Content */}
        <div className="flex-1 overflow-hidden bg-muted/20">
          <div className="h-full flex items-center justify-center">
            <div className="max-w-4xl w-full mx-auto px-6 space-y-6">
              {/* Form Header Skeleton */}
              <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-pulse">
                {/* Header image skeleton */}
                <div className="h-64 bg-muted" />

                <div className="px-8 py-10 space-y-6">
                  {/* Title skeleton */}
                  <div className="space-y-3">
                    <div className="h-12 bg-muted rounded-md w-3/4" />
                    <div className="h-12 bg-muted rounded-md w-1/2" />
                  </div>

                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <div className="h-5 bg-muted rounded-md w-full" />
                    <div className="h-5 bg-muted rounded-md w-5/6" />
                    <div className="h-5 bg-muted rounded-md w-4/6" />
                  </div>

                  {/* Meta info skeleton */}
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="w-16 h-4 bg-muted rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="w-24 h-4 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Skeletons */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full bg-card rounded-xl border border-border shadow-sm p-6 animate-pulse"
                  >
                    <div className="space-y-4">
                      {/* Question skeleton */}
                      <div className="h-6 bg-muted rounded-md w-2/3" />
                      {/* Description skeleton */}
                      <div className="h-4 bg-muted rounded-md w-1/2" />
                      {/* Input skeleton */}
                      <div className="h-10 bg-muted rounded-md w-full" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading Text with Animation */}
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    Loading your form
                  </p>
                  <p className="text-sm text-muted-foreground">
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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
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
      <div className="flex-1 overflow-hidden">
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
      </div>{" "}
      {/* Share Form Dialog */}
      <ShareFormDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        formSlug={slug}
        formName={formHeaderData?.form?.title || "Untitled Form"}
      />
    </div>
  );
}
