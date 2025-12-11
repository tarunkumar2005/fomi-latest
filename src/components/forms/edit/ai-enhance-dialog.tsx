"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Check,
  X,
  Lightbulb,
  ArrowRight,
  MessageSquarePlus,
} from "lucide-react";
import Image from "next/image";
import AIEnhanceIcon from "@/assets/icon/ai-enhance.png";
import type { FieldEnhanceResponse } from "@/lib/agent";
import { cn } from "@/lib/utils";

interface AIEnhanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: any;
  enhancement: FieldEnhanceResponse | null;
  isLoading: boolean;
  onApply: () => void;
  onRegenerate: (feedback?: string) => void;
}

export default function AIEnhanceDialog({
  open,
  onOpenChange,
  field,
  enhancement,
  isLoading,
  onApply,
  onRegenerate,
}: AIEnhanceDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const handleRegenerate = () => {
    onRegenerate(feedback || undefined);
    setFeedback("");
    setFeedbackModalOpen(false);
  };

  const handleClose = () => {
    setFeedback("");
    setFeedbackModalOpen(false);
    onOpenChange(false);
  };

  const handleOpenFeedbackModal = () => {
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedback("");
    setFeedbackModalOpen(false);
  };

  // Determine field capabilities (field types are UPPERCASE_SNAKE_CASE from Prisma)
  const hasOptions =
    field?.type === "MULTIPLE_CHOICE" ||
    field?.type === "CHECKBOXES" ||
    field?.type === "DROPDOWN";
  const hasScaleLabels =
    field?.type === "RATING" || field?.type === "LINEAR_SCALE";
  const hasPlaceholder = [
    "SHORT_ANSWER",
    "PARAGRAPH",
    "EMAIL",
    "PHONE",
    "URL",
    "NUMBER",
  ].includes(field?.type);

  // Check what changed
  const questionChanged = field?.question !== enhancement?.question;
  const descriptionChanged = field?.description !== enhancement?.description;
  const placeholderChanged = field?.placeholder !== enhancement?.placeholder;
  const optionsChanged =
    JSON.stringify(field?.options) !== JSON.stringify(enhancement?.options);
  const scaleChanged =
    field?.minLabel !== enhancement?.minLabel ||
    field?.maxLabel !== enhancement?.maxLabel;

  return (
    <>
      {/* Main Enhancement Preview Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Header */}
          <DialogHeader className="px-6 py-5 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Image
                  src={AIEnhanceIcon}
                  alt="AI Enhance"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  AI Enhancement Preview
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Review suggested improvements before applying
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <LoadingState />
            ) : enhancement ? (
              <div className="p-6 space-y-5">
                {/* Question */}
                <EnhancementCard
                  label="Question"
                  original={field?.question}
                  enhanced={enhancement.question}
                  hasChange={questionChanged}
                />

                {/* Description */}
                <EnhancementCard
                  label="Description"
                  original={field?.description}
                  enhanced={enhancement.description}
                  hasChange={descriptionChanged}
                  emptyText="No description"
                />

                {/* Placeholder (for text fields) */}
                {hasPlaceholder && (
                  <EnhancementCard
                    label="Placeholder"
                    original={field?.placeholder}
                    enhanced={enhancement.placeholder}
                    hasChange={placeholderChanged}
                    emptyText="No placeholder"
                    isCode
                  />
                )}

                {/* Options (for choice fields) */}
                {hasOptions && (
                  <OptionsCard
                    originalOptions={field?.options}
                    enhancedOptions={enhancement.options}
                    hasChange={optionsChanged}
                  />
                )}

                {/* Scale Labels */}
                {hasScaleLabels && (
                  <ScaleLabelsCard
                    originalMin={field?.minLabel}
                    originalMax={field?.maxLabel}
                    enhancedMin={enhancement.minLabel}
                    enhancedMax={enhancement.maxLabel}
                    hasChange={scaleChanged}
                  />
                )}

                {/* AI Suggestions */}
                {enhancement.suggestions &&
                  enhancement.suggestions.length > 0 && (
                    <SuggestionsCard suggestions={enhancement.suggestions} />
                  )}
              </div>
            ) : (
              <ErrorState onRetry={() => onRegenerate()} />
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-row justify-between sm:justify-between">
            <div>
              {!isLoading && enhancement && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenFeedbackModal}
                  className="text-muted-foreground hover:text-primary"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Not quite right?
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                onClick={onApply}
                disabled={isLoading || !enhancement}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Apply Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <MessageSquarePlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Regenerate Enhancement</DialogTitle>
                <DialogDescription>
                  Tell us what you&apos;d like changed
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="e.g., Make it shorter, more formal, add an 'Other' option..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              maxLength={200}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {feedback.length}/200 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseFeedbackModal}>
              Cancel
            </Button>
            <Button
              onClick={handleRegenerate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="relative mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <Image
            src={AIEnhanceIcon}
            alt="AI Enhance"
            className="h-8 w-8 animate-pulse"
          />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Enhancing your field...
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        AI is analyzing your content and crafting improvements
      </p>
      <div className="flex gap-1 mt-6">
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <X className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Enhancement Failed
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Something went wrong. Please try again.
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}

// Enhancement Card Component
function EnhancementCard({
  label,
  original,
  enhanced,
  hasChange,
  emptyText = "Empty",
  isCode = false,
}: {
  label: string;
  original: string | null | undefined;
  enhanced: string | null | undefined;
  hasChange: boolean;
  emptyText?: string;
  isCode?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-foreground">{label}</h4>
        {hasChange && (
          <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 font-medium border-0">
            Updated
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Original */}
        <div className="rounded-lg border bg-muted/40 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </span>
          <p
            className={cn(
              "mt-1.5 text-sm",
              isCode && "font-mono text-xs",
              !original && "text-muted-foreground italic"
            )}
          >
            {original || emptyText}
          </p>
        </div>
        {/* Enhanced */}
        <div
          className={cn(
            "rounded-lg border p-3 transition-colors",
            hasChange ? "bg-primary/5 border-primary/20" : "bg-muted/40"
          )}
        >
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              hasChange ? "text-primary" : "text-muted-foreground"
            )}
          >
            Enhanced
          </span>
          <p
            className={cn(
              "mt-1.5 text-sm",
              isCode && "font-mono text-xs",
              hasChange && "text-foreground font-medium",
              !enhanced && "text-muted-foreground italic"
            )}
          >
            {enhanced || emptyText}
          </p>
        </div>
      </div>
    </div>
  );
}

// Options Card Component
function OptionsCard({
  originalOptions,
  enhancedOptions,
  hasChange,
}: {
  originalOptions: Array<{ label: string; value: string }> | null | undefined;
  enhancedOptions: Array<{ label: string; value: string }> | null | undefined;
  hasChange: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-foreground">Options</h4>
        {hasChange && (
          <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 font-medium border-0">
            Updated
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Original Options */}
        <div className="rounded-lg border bg-muted/40 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </span>
          <div className="mt-2 space-y-1.5">
            {originalOptions && originalOptions.length > 0 ? (
              originalOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  {opt.label}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No options</p>
            )}
          </div>
        </div>
        {/* Enhanced Options */}
        <div
          className={cn(
            "rounded-lg border p-3",
            hasChange ? "bg-primary/5 border-primary/20" : "bg-muted/40"
          )}
        >
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              hasChange ? "text-primary" : "text-muted-foreground"
            )}
          >
            Enhanced
          </span>
          <div className="mt-2 space-y-1.5">
            {enhancedOptions && enhancedOptions.length > 0 ? (
              enhancedOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    hasChange
                      ? "text-foreground font-medium"
                      : "text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      hasChange ? "bg-primary" : "bg-muted-foreground/40"
                    )}
                  />
                  {opt.label}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No options</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Scale Labels Card Component
function ScaleLabelsCard({
  originalMin,
  originalMax,
  enhancedMin,
  enhancedMax,
  hasChange,
}: {
  originalMin: string | null | undefined;
  originalMax: string | null | undefined;
  enhancedMin: string | null | undefined;
  enhancedMax: string | null | undefined;
  hasChange: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-foreground">Scale Labels</h4>
        {hasChange && (
          <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 font-medium border-0">
            Updated
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Original */}
        <div className="rounded-lg border bg-muted/40 p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </span>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-foreground">{originalMin || "—"}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground">{originalMax || "—"}</span>
          </div>
        </div>
        {/* Enhanced */}
        <div
          className={cn(
            "rounded-lg border p-3",
            hasChange ? "bg-primary/5 border-primary/20" : "bg-muted/40"
          )}
        >
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              hasChange ? "text-primary" : "text-muted-foreground"
            )}
          >
            Enhanced
          </span>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className={cn(hasChange && "text-foreground font-medium")}>
              {enhancedMin || "—"}
            </span>
            <ArrowRight
              className={cn(
                "h-3.5 w-3.5",
                hasChange ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className={cn(hasChange && "text-foreground font-medium")}>
              {enhancedMax || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suggestions Card Component
function SuggestionsCard({ suggestions }: { suggestions: string[] }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="flex gap-3">
        <div className="shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
        <div className="pt-0.5">
          <h4 className="text-sm font-medium text-foreground mb-1">Pro Tips</h4>
          <ul className="space-y-1">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
