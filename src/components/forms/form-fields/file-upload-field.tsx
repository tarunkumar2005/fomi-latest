"use client";

import { useCallback, memo } from "react";
import { Upload, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface FileUploadFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    required: boolean;
    acceptedTypes?: string;
    maxFileSize?: number;
    maxFiles?: number;
    requiredFiles?: number;
  };
  index: number;
  onUpdate: (updates: Partial<FileUploadFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const FileUploadField = memo(
  function FileUploadField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: FileUploadFieldProps) {
    const {
      isEditingQuestion,
      isEditingDescription,
      isHovered,
      questionRef,
      descriptionRef,
      handleQuestionClick,
      handleQuestionChange,
      handleQuestionBlur,
      handleQuestionKeyDown,
      handleDescriptionClick,
      handleDescriptionChange,
      handleDescriptionBlur,
      handleDescriptionKeyDown,
      handleMouseEnter,
      handleMouseLeave,
      handleAdvancedClick,
      handleAdvancedClose,
    } = useFieldHandlers(field, onUpdate, isAdvancedOpen, onAdvancedToggle);

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required });
    }, [field.required, onUpdate]);

    const handleAcceptedTypesChange = useCallback(
      (value: string) => {
        onUpdate({ acceptedTypes: value || undefined });
      },
      [onUpdate]
    );

    const handleMaxFileSizeChange = useCallback(
      (value: string) => {
        const numValue = parseInt(value);
        onUpdate({ maxFileSize: isNaN(numValue) ? undefined : numValue });
      },
      [onUpdate]
    );

    const handleMaxFilesChange = useCallback(
      (value: string) => {
        const numValue = parseInt(value);
        onUpdate({ maxFiles: isNaN(numValue) ? undefined : numValue });
      },
      [onUpdate]
    );

    const handleRequiredFilesChange = useCallback(
      (value: string) => {
        const numValue = parseInt(value);
        onUpdate({ requiredFiles: isNaN(numValue) ? undefined : numValue });
      },
      [onUpdate]
    );

    // Format file size for display
    const formatFileSize = (bytes?: number) => {
      if (!bytes) return "No limit";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="File Upload"
          fieldIcon={Upload}
          fieldId={field.id}
          question={field.question}
          description={field.description}
          required={field.required}
          isEditingQuestion={isEditingQuestion}
          isEditingDescription={isEditingDescription}
          isHovered={isHovered}
          onQuestionClick={handleQuestionClick}
          onDescriptionClick={handleDescriptionClick}
          onQuestionChange={handleQuestionChange}
          onDescriptionChange={handleDescriptionChange}
          onQuestionBlur={handleQuestionBlur}
          onDescriptionBlur={handleDescriptionBlur}
          onQuestionKeyDown={handleQuestionKeyDown}
          onDescriptionKeyDown={handleDescriptionKeyDown}
          onRequiredToggle={handleRequiredToggle}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onEnhance={onEnhance}
          onAdvancedClick={handleAdvancedClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          questionRef={questionRef}
          descriptionRef={descriptionRef}
          showAdvanced={true}
        >
          {/* Preview File Upload Area */}
          <div className="border-2 border-dashed border-border/60 rounded-lg p-8 bg-muted/30 cursor-not-allowed">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-primary/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground/60 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground/50">
                {field.acceptedTypes || "Any file type"} •{" "}
                {formatFileSize(field.maxFileSize)} •{" "}
                {field.maxFiles
                  ? `Max ${field.maxFiles} file${field.maxFiles > 1 ? "s" : ""}`
                  : "Unlimited files"}
              </p>
            </div>
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Advanced Settings"
          subtitle="Configure file upload constraints"
        >
          {/* Accepted File Types */}
          <div className="space-y-2">
            <Label
              htmlFor="acceptedTypes"
              className="text-sm font-medium text-foreground"
            >
              Accepted File Types
            </Label>
            <Textarea
              id="acceptedTypes"
              value={field.acceptedTypes || ""}
              onChange={(e) => handleAcceptedTypesChange(e.target.value)}
              placeholder=".pdf,.doc,.docx,image/*"
              className="w-full min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated MIME types or extensions (e.g., .pdf, image/*,
              application/pdf). Leave empty to accept all file types.
            </p>
          </div>

          {/* File Size Limit */}
          <div className="space-y-2">
            <Label
              htmlFor="maxFileSize"
              className="text-sm font-medium text-foreground"
            >
              Maximum File Size (bytes)
            </Label>
            <Input
              id="maxFileSize"
              type="number"
              value={field.maxFileSize || ""}
              onChange={(e) => handleMaxFileSizeChange(e.target.value)}
              placeholder="e.g., 5242880 (5MB)"
              className="w-full"
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Maximum size per file in bytes. Common values: 1MB = 1,048,576 |
              5MB = 5,242,880 | 10MB = 10,485,760
            </p>
          </div>

          {/* File Count Constraints */}
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-4">
              File Count Constraints
            </h4>

            {/* Maximum Files */}
            <div className="space-y-2 mb-4">
              <Label
                htmlFor="maxFiles"
                className="text-sm font-medium text-foreground"
              >
                Maximum Number of Files
              </Label>
              <Input
                id="maxFiles"
                type="number"
                value={field.maxFiles || ""}
                onChange={(e) => handleMaxFilesChange(e.target.value)}
                placeholder="e.g., 5"
                className="w-full"
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of files allowed. Leave empty for unlimited.
              </p>
            </div>

            {/* Required Files */}
            <div className="space-y-2">
              <Label
                htmlFor="requiredFiles"
                className="text-sm font-medium text-foreground"
              >
                Minimum Required Files
              </Label>
              <Input
                id="requiredFiles"
                type="number"
                value={field.requiredFiles || ""}
                onChange={(e) => handleRequiredFilesChange(e.target.value)}
                placeholder="e.g., 1"
                className="w-full"
                min={1}
                max={field.maxFiles || undefined}
              />
              <p className="text-xs text-muted-foreground">
                Minimum number of files that must be uploaded.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-start gap-2">
              <File className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">File Types:</strong> Use
                  MIME types (image/*, application/pdf) or extensions (.pdf,
                  .doc)
                </p>
                <p>
                  <strong className="text-foreground">Size Limits:</strong>{" "}
                  Helps prevent oversized uploads and ensures smooth form
                  submissions
                </p>
                <p>
                  <strong className="text-foreground">Count Limits:</strong>{" "}
                  Control how many files users can upload
                </p>
              </div>
            </div>
          </div>
        </AdvancedPanel>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.field.id === nextProps.field.id &&
      prevProps.field.question === nextProps.field.question &&
      prevProps.field.description === nextProps.field.description &&
      prevProps.field.required === nextProps.field.required &&
      prevProps.field.acceptedTypes === nextProps.field.acceptedTypes &&
      prevProps.field.maxFileSize === nextProps.field.maxFileSize &&
      prevProps.field.maxFiles === nextProps.field.maxFiles &&
      prevProps.field.requiredFiles === nextProps.field.requiredFiles &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default FileUploadField;
