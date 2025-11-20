"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditForm } from "@/hooks/useEditForm";
import FormEditHeader from "@/components/forms/edit/header";
import FormCanvas from "@/components/forms/edit/form-canvas";
import ShareFormDialog from "@/components/forms/share-form-dialog";

export default function FormEditClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { getFormHeaderData } = useEditForm();

  const [formHeaderData, setFormHeaderData] = useState<any>(null);

  useEffect(() => {
    // Fetch form header data on mount
    const fetchData = async () => {
      try {
        const data = await getFormHeaderData(slug);
        setFormHeaderData(data);
      } catch (error) {
        console.error("Error fetching form header data:", error);
      }
    };

    fetchData();
  }, [slug, getFormHeaderData]);

  // Form state
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
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <FormEditHeader
        formName={formHeaderData?.form?.title || "Untitled Form"}
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
      <div className="flex-1 overflow-hidden">
        <FormCanvas 
          formSlug={slug} 
          formHeaderData={formHeaderData}
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
  );
}
