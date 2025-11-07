"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FormEditHeader from "@/components/forms/edit/header";
import FormCanvas from "@/components/forms/edit/form-canvas";
import ShareFormDialog from "@/components/forms/share-form-dialog";

export default function FormEditClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Form state
  const [formName, setFormName] = useState("Customer Feedback Survey");
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saving form...");
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving form:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual publish API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Publishing form...");
      setIsPublished(!isPublished);
      setIsSaved(true);
    } catch (error) {
      console.error("Error publishing form:", error);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-background">
      <FormEditHeader
        formName={formName}
        formSlug={slug}
        isSaved={isSaved}
        isPublished={isPublished}
        onSave={handleSave}
        onPublish={handlePublish}
        onPreview={handlePreview}
        onShare={handleShare}
        isSaving={isSaving}
      />

      {/* Main Layout - Below Header */}
      <div className="pt-[73px]">
        <FormCanvas formSlug={slug} />
      </div>

      {/* Share Form Dialog */}
      <ShareFormDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        formSlug={slug}
        formName={formName}
      />
    </div>
  );
}
