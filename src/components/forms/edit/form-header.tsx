"use client";

import { useState } from "react";
import { Image as ImageIcon, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormHeaderProps {
  formTitle: string;
  formDescription?: string;
  estimatedTime?: string;
  questionCount?: number;
  headerImageUrl?: string;
  onEditHeader?: () => void;
  onSaveHeader?: (title: string, description: string) => void;
}

export default function FormHeader({
  formTitle,
  formDescription,
  estimatedTime = "~3 min",
  questionCount = 8,
  headerImageUrl,
  onEditHeader,
  onSaveHeader,
}: FormHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(formTitle);
  const [editDescription, setEditDescription] = useState(formDescription || "");
  const [isImageHovered, setIsImageHovered] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(formTitle);
    setEditDescription(formDescription || "");
  };

  const handleSave = () => {
    onSaveHeader?.(editTitle, editDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(formTitle);
    setEditDescription(formDescription || "");
    setIsEditing(false);
  };

  const handleChangeImage = () => {
    // TODO: Implement image upload
    console.log("Change header image");
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Header Image */}
      <div
        className="relative h-48 bg-muted overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
        onClick={handleChangeImage}
      >
        {headerImageUrl && (
          <img
            src={headerImageUrl}
            alt="Form header"
            className="w-full h-full object-cover"
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

      {/* Edit Mode */}
      {isEditing ? (
        <div className="px-8 py-8 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Form Title
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter form title"
              className="text-2xl font-bold h-auto py-3 border-2 focus:border-primary"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={editDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditDescription(e.target.value)
              }
              placeholder="Enter form description"
              rows={3}
              className="resize-none border-2 focus:border-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header Actions Bar */}
          <div className="flex items-center justify-end px-6 py-3 border-b border-border/50 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 px-3 text-xs font-medium hover:bg-background/80"
            >
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Edit Header
            </Button>
          </div>

          {/* Form Header Content */}
          <div className="px-8 py-10">
            {/* Title */}
            <h1 className="font-heading text-4xl font-bold text-foreground mb-4 leading-tight">
              {formTitle}
            </h1>

            {/* Description */}
            {formDescription && (
              <p className="font-body text-base text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                {formDescription}
              </p>
            )}

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
        </>
      )}
    </div>
  );
}
