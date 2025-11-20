"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface FormHeaderProps {
  formTitle: string;
  formDescription?: string;
  estimatedTime?: string;
  questionCount?: number;
  headerImageUrl?: string;
  onSaveHeader?: (title: string, description: string) => void;
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

  const handleTitleChange = (value: string) => {
    setEditTitle(value);
    onSaveHeader?.(value, editDescription);
  };

  const handleDescriptionChange = (value: string) => {
    setEditDescription(value);
    onSaveHeader?.(editTitle, value);
  };

  const handleChangeImage = () => {
    // TODO: Implement image upload
    console.log("Change header image");
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header Image */}
      <div
        className="relative h-64 bg-muted overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
        onClick={handleChangeImage}
      >
        {headerImageUrl && (
          <Image
            src={headerImageUrl}
            alt="Form header"
            className="w-full h-full object-cover"
            layout="fill"
          />
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
            onClick={handleChangeImage}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change Header Image
          </Button>
        </div>
      </div>

      {/* Form Header Content */}
      <div className="px-8 py-10">
        {/* Title - Editable on Click */}
        <div className="mb-4">
          {isEditingTitle ? (
            <Input
              ref={titleRef}
              value={editTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditingTitle(false);
                }
                if (e.key === "Escape") {
                  setEditTitle(formTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="text-4xl font-bold h-auto py-2 border-2 border-primary"
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
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => setIsEditingDescription(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditDescription(formDescription || "");
                  setIsEditingDescription(false);
                }
              }}
              rows={3}
              className="text-base resize-none border-2 border-primary"
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
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="font-body font-medium text-foreground">
              {estimatedTime}
            </span>
          </div>

          {/* Question Count */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
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
