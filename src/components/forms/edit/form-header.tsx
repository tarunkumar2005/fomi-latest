"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface FormHeaderProps {
  formTitle: string;
  formDescription?: string;
  estimatedTime?: string;
  questionCount?: number;
  headerImageUrl?: string | null;
  onSaveHeader?: (
    title: string,
    description: string,
    headerImageUrl?: string
  ) => void;
}

export default function FormHeader({
  formTitle,
  formDescription,
  estimatedTime = "~3 min",
  questionCount = 8,
  headerImageUrl,
  onSaveHeader,
}: FormHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(formTitle);
  const [editDescription, setEditDescription] = useState(formDescription || "");
  const [isImageHovered, setIsImageHovered] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setEditTitle(formTitle);
  }, [formTitle]);

  useEffect(() => {
    setEditDescription(formDescription || "");
  }, [formDescription]);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
      descriptionRef.current.select();
    }
  }, [isEditingDescription]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editTitle !== formTitle) {
      onSaveHeader?.(editTitle, editDescription, headerImageUrl || undefined);
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (editDescription !== formDescription) {
      onSaveHeader?.(editTitle, editDescription, headerImageUrl || undefined);
    }
  };

  const handleImageUploadSuccess = (result: any) => {
    if (typeof result.info === "object" && "secure_url" in result.info) {
      onSaveHeader?.(editTitle, editDescription, result.info.secure_url);
    }
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header Image */}
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign-cloudinary"
        onSuccess={handleImageUploadSuccess}
        options={{
          sources: ["local", "url", "camera", "unsplash"],
          multiple: false,
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        }}
      >
        {({ open }) => {
          return (
            <div
              className="relative h-64 bg-muted overflow-hidden group cursor-pointer"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
              onClick={() => open?.()}
            >
              {headerImageUrl ? (
                <Image
                  src={headerImageUrl}
                  alt="Form header"
                  className="w-full h-full object-cover"
                  layout="fill"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                  isImageHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white hover:bg-white/90 text-foreground shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    open?.();
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {headerImageUrl ? "Change Header Image" : "Add Header Image"}
                </Button>
              </div>
            </div>
          );
        }}
      </CldUploadWidget>

      {/* Form Header Content */}
      <div className="px-8 py-10">
        {/* Title - Editable on Click */}
        <div className="mb-4">
          {isEditingTitle ? (
            <Input
              ref={titleRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleBlur();
                }
                if (e.key === "Escape") {
                  setEditTitle(formTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="text-4xl font-bold h-auto py-2 border-2 border-primary font-heading"
              placeholder="Enter form title"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="font-heading text-4xl font-bold text-foreground leading-tight cursor-text hover:text-primary/80 transition-colors"
            >
              {formTitle || "Click to add title"}
            </h1>
          )}
        </div>

        {/* Description - Editable on Click */}
        <div className="mb-8">
          {isEditingDescription ? (
            <Textarea
              ref={descriptionRef}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditDescription(formDescription || "");
                  setIsEditingDescription(false);
                }
              }}
              rows={3}
              className="text-base resize-none border-2 border-primary font-body"
              placeholder="Enter form description (optional)"
            />
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className="font-body text-base text-muted-foreground leading-relaxed max-w-2xl cursor-text hover:text-foreground transition-colors"
            >
              {formDescription || "Click to add description (optional)"}
            </p>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 pt-2">
          {/* Estimated Time */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="font-body font-medium text-foreground">
              {estimatedTime}
            </span>
          </div>

          {/* Question Count */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="font-body font-medium text-foreground">
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
