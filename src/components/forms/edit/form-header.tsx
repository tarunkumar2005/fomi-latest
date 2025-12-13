"use client";

import { useState, useRef, useEffect } from "react";
import { ImageIcon, FileText, Clock, Upload, Loader2 } from "lucide-react";
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
  isSaving?: boolean;
}

export default function FormHeader({
  formTitle,
  formDescription,
  estimatedTime = "~3 min",
  questionCount = 8,
  headerImageUrl,
  onSaveHeader,
  isSaving = false,
}: FormHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(formTitle);
  const [editDescription, setEditDescription] = useState(formDescription || "");
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditTitle(formTitle);
  }, [formTitle]);

  useEffect(() => {
    setEditDescription(formDescription || "");
  }, [formDescription]);

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

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (editTitle !== formTitle && onSaveHeader) {
      await onSaveHeader(
        editTitle,
        editDescription,
        headerImageUrl || undefined
      );
    }
  };

  const handleDescriptionBlur = async () => {
    setIsEditingDescription(false);
    if (editDescription !== formDescription && onSaveHeader) {
      await onSaveHeader(
        editTitle,
        editDescription,
        headerImageUrl || undefined
      );
    }
  };

  const handleImageUploadSuccess = async (result: any) => {
    if (typeof result.info === "object" && "secure_url" in result.info) {
      setIsUploadingImage(true);
      try {
        await onSaveHeader?.(
          editTitle,
          editDescription,
          result.info.secure_url
        );
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  return (
    <div
      className="w-full overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "var(--preview-card, hsl(var(--card)))",
        borderColor: "var(--preview-border, hsl(var(--border)))",
        borderWidth: "2px",
        borderStyle: "solid",
        borderRadius: "var(--preview-border-radius, 1rem)",
        boxShadow: "var(--preview-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))",
      }}
    >
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign-cloudinary"
        onSuccess={handleImageUploadSuccess}
        options={{
          sources: ["local", "url", "camera", "unsplash"],
          multiple: false,
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        }}
      >
        {({ open }) => (
          <div
            className="relative h-40 sm:h-56 lg:h-64 overflow-hidden group cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:outline-none"
            style={{
              borderRadius:
                "var(--preview-border-radius, 1rem) var(--preview-border-radius, 1rem) 0 0",
            }}
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
            onClick={() => open?.()}
            role="button"
            tabIndex={0}
            aria-label={
              headerImageUrl
                ? "Change form header image"
                : "Add form header image"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open?.();
              }
            }}
          >
            {headerImageUrl ? (
              <Image
                src={headerImageUrl || "/placeholder.svg"}
                alt="Form header"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                fill
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 5%, transparent), var(--preview-accent, hsl(var(--muted))), color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent))`,
                }}
              >
                <div className="text-center">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)",
                    }}
                  >
                    <Upload
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      style={{
                        color:
                          "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 60%, transparent)",
                      }}
                    />
                  </div>
                  <p
                    className="text-sm"
                    style={{
                      color:
                        "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                    }}
                  >
                    Click to add a header image
                  </p>
                </div>
              </div>
            )}

            <div
              className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                isImageHovered || isUploadingImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={isUploadingImage || isSaving}
                className="bg-white/95 hover:bg-white text-foreground shadow-lg rounded-xl px-4 py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  open?.();
                }}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {headerImageUrl ? "Change Image" : "Add Image"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CldUploadWidget>

      <div className="px-5 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Title */}
        <div className="mb-3 sm:mb-4">
          {isEditingTitle ? (
            <Input
              ref={titleRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleBlur}
              disabled={isSaving}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleBlur();
                if (e.key === "Escape") {
                  setEditTitle(formTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold h-auto py-2 border-2 border-primary rounded-xl"
              style={{
                fontFamily: "var(--preview-font-heading, var(--font-heading))",
                borderRadius: "var(--preview-radius, 12px)",
              }}
              placeholder="Enter form title"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight cursor-text transition-all hover:opacity-80 text-balance"
              style={{
                color: "var(--preview-text, hsl(var(--foreground)))",
                fontFamily: "var(--preview-font-heading, var(--font-heading))",
              }}
            >
              {formTitle || "Click to add title"}
            </h1>
          )}
        </div>

        {/* Description */}
        <div className="mb-6 sm:mb-8">
          {isEditingDescription ? (
            <Textarea
              ref={descriptionRef}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              disabled={isSaving}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditDescription(formDescription || "");
                  setIsEditingDescription(false);
                }
              }}
              rows={3}
              className="resize-none border-2 border-primary"
              style={{
                fontFamily: "var(--preview-font-body, var(--font-body))",
                borderRadius: "var(--preview-radius, 12px)",
                fontSize: "var(--preview-font-size, 16px)",
              }}
              placeholder="Enter form description (optional)"
            />
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className="font-body leading-relaxed max-w-2xl cursor-text transition-all hover:opacity-80"
              style={{
                color:
                  "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                fontFamily: "var(--preview-font-body, var(--font-body))",
                fontSize: "var(--preview-font-size, 16px)",
              }}
            >
              {formDescription || "Click to add description (optional)"}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 pt-2 flex-wrap">
          <div
            className="flex items-center gap-2 text-sm rounded-xl px-3 py-2 transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--preview-accent, hsl(var(--muted) / 0.5))",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)",
              }}
            >
              <Clock
                className="h-4 w-4"
                style={{ color: "var(--preview-primary, hsl(var(--primary)))" }}
              />
            </div>
            <span
              className="font-body font-medium text-sm"
              style={{ color: "var(--preview-text, hsl(var(--foreground)))" }}
            >
              {estimatedTime}
            </span>
          </div>

          <div
            className="flex items-center gap-2 text-sm rounded-xl px-3 py-2 transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--preview-accent, hsl(var(--muted) / 0.5))",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)",
              }}
            >
              <FileText
                className="h-4 w-4"
                style={{ color: "var(--preview-primary, hsl(var(--primary)))" }}
              />
            </div>
            <span
              className="font-body font-medium text-sm"
              style={{ color: "var(--preview-text, hsl(var(--foreground)))" }}
            >
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
