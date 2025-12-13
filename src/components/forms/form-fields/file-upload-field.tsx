"use client";

import { useCallback, memo } from "react";
import { Upload, File, CloudUpload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelInfoBox,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel";
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
      localQuestion,
      localDescription,
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
        const numValue = Number.parseInt(value);
        onUpdate({ maxFileSize: isNaN(numValue) ? undefined : numValue });
      },
      [onUpdate]
    );

    const handleMaxFilesChange = useCallback(
      (value: string) => {
        const numValue = Number.parseInt(value);
        onUpdate({ maxFiles: isNaN(numValue) ? undefined : numValue });
      },
      [onUpdate]
    );

    const handleRequiredFilesChange = useCallback(
      (value: string) => {
        const numValue = Number.parseInt(value);
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
          question={localQuestion}
          description={localDescription}
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
          <div
            className="border-2 border-dashed p-8 cursor-not-allowed transition-all duration-200"
            style={{
              borderColor:
                "color-mix(in srgb, var(--preview-border, hsl(var(--border))) 60%, transparent)",
              backgroundColor:
                "color-mix(in srgb, var(--preview-card, hsl(var(--muted))) 20%, transparent)",
              borderRadius: "var(--preview-radius, 12px)",
            }}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="w-14 h-14 flex items-center justify-center mb-4"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 10%, transparent)",
                  borderRadius: "50%",
                }}
              >
                <CloudUpload
                  className="h-7 w-7"
                  style={{
                    color:
                      "color-mix(in srgb, var(--preview-primary, hsl(var(--primary))) 60%, transparent)",
                  }}
                />
              </div>
              <p
                className="text-sm font-medium mb-1"
                style={{
                  fontFamily: "var(--preview-font-body, inherit)",
                  color:
                    "color-mix(in srgb, var(--preview-text, hsl(var(--foreground))) 70%, transparent)",
                }}
              >
                Click to upload or drag and drop
              </p>
              <p
                className="text-xs"
                style={{
                  color:
                    "var(--preview-text-muted, hsl(var(--muted-foreground)))",
                }}
              >
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
          title="File Upload Settings"
          subtitle="Configure file upload constraints"
        >
          <AdvancedPanelFieldGroup
            label="Accepted File Types"
            htmlFor="acceptedTypes"
            description="Comma-separated MIME types or extensions (e.g., .pdf, image/*). Leave empty to accept all."
          >
            <Textarea
              id="acceptedTypes"
              value={field.acceptedTypes || ""}
              onChange={(e) => handleAcceptedTypesChange(e.target.value)}
              placeholder=".pdf,.doc,.docx,image/*"
              className="w-full min-h-[80px] resize-none"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelFieldGroup
            label="Maximum File Size (bytes)"
            htmlFor="maxFileSize"
            description="Common values: 1MB = 1,048,576 | 5MB = 5,242,880 | 10MB = 10,485,760"
          >
            <Input
              id="maxFileSize"
              type="number"
              value={field.maxFileSize || ""}
              onChange={(e) => handleMaxFileSizeChange(e.target.value)}
              placeholder="e.g., 5242880 (5MB)"
              className="w-full"
              min={0}
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="File Count Constraints">
            <AdvancedPanelFieldGroup
              label="Maximum Number of Files"
              htmlFor="maxFiles"
              description="Maximum files allowed. Leave empty for unlimited."
            >
              <Input
                id="maxFiles"
                type="number"
                value={field.maxFiles || ""}
                onChange={(e) => handleMaxFilesChange(e.target.value)}
                placeholder="e.g., 5"
                className="w-full"
                min={1}
              />
            </AdvancedPanelFieldGroup>

            <AdvancedPanelFieldGroup
              label="Minimum Required Files"
              htmlFor="requiredFiles"
              description="Minimum files that must be uploaded."
            >
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
            </AdvancedPanelFieldGroup>
          </AdvancedPanelSection>

          <AdvancedPanelInfoBox icon={File}>
            <p>
              <strong className="text-foreground">File Types:</strong> Use MIME
              types (image/*, application/pdf) or extensions (.pdf, .doc)
            </p>
            <p>
              <strong className="text-foreground">Size Limits:</strong> Prevents
              oversized uploads
            </p>
            <p>
              <strong className="text-foreground">Count Limits:</strong> Control
              how many files users can upload
            </p>
          </AdvancedPanelInfoBox>
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
