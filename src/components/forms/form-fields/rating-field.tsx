"use client";

import { useState, useCallback, memo } from "react";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldWrapper from "../edit/shared/FieldWrapper";
import AdvancedPanel from "../edit/shared/AdvancedPanel";
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers";

interface RatingFieldProps {
  field: {
    id: string;
    question: string;
    description?: string;
    required: boolean;
    maxRating?: number;
    ratingStyle?: "stars" | "numbers" | "emoji";
  };
  index: number;
  onUpdate: (updates: Partial<RatingFieldProps["field"]>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEnhance?: () => void;
  isAdvancedOpen?: boolean;
  onAdvancedToggle?: () => void;
}

const RatingField = memo(
  function RatingField({
    field,
    index,
    onUpdate,
    onDelete,
    onDuplicate,
    onEnhance,
    isAdvancedOpen,
    onAdvancedToggle,
  }: RatingFieldProps) {
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const {
      isEditingQuestion,
      isEditingDescription,
      isHovered,
      questionRef,
      descriptionRef,
      handleQuestionClick,
      handleDescriptionClick,
      handleQuestionChange,
      handleDescriptionChange,
      handleQuestionBlur,
      handleDescriptionBlur,
      handleQuestionKeyDown,
      handleDescriptionKeyDown,
      handleMouseEnter,
      handleMouseLeave,
      handleAdvancedClick,
      handleAdvancedClose,
    } = useFieldHandlers(field, onUpdate, isAdvancedOpen, onAdvancedToggle);

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required });
    }, [field.required, onUpdate]);

    const maxRating = field.maxRating || 5;
    const ratingStyle = field.ratingStyle || "stars";

    const handleMaxRatingChange = (value: string) => {
      const num = parseInt(value);
      if (!isNaN(num) && num >= 1 && num <= 10) {
        onUpdate({ maxRating: num });
      }
    };

    const handleRatingStyleChange = (value: string) => {
      onUpdate({ ratingStyle: value as "stars" | "numbers" | "emoji" });
    };

    const renderRatingPreview = () => {
      const items = [];

      for (let i = 1; i <= maxRating; i++) {
        const isHovered = hoveredRating !== null && i <= hoveredRating;

        if (ratingStyle === "stars") {
          items.push(
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(null)}
              className="transition-all duration-150 cursor-pointer"
              disabled
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  isHovered
                    ? "fill-warning text-warning"
                    : "fill-none text-border"
                }`}
              />
            </button>
          );
        } else if (ratingStyle === "numbers") {
          items.push(
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled
              className={`h-10 w-10 rounded-lg border-2 transition-all duration-150 cursor-pointer font-semibold ${
                isHovered
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {i}
            </button>
          );
        } else if (ratingStyle === "emoji") {
          const emojis = [
            "😢",
            "😕",
            "😐",
            "🙂",
            "😊",
            "😄",
            "🤩",
            "😍",
            "🥰",
            "🤗",
          ];
          items.push(
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled
              className={`text-3xl transition-all duration-150 cursor-pointer ${
                isHovered ? "scale-125" : "scale-100 opacity-50"
              }`}
            >
              {emojis[i - 1] || "😊"}
            </button>
          );
        }
      }

      return items;
    };

    return (
      <>
        <FieldWrapper
          index={index}
          fieldType="Rating"
          fieldIcon={Star}
          fieldId={field.id}
          question={field.question}
          description={field.description}
          required={field.required}
          isEditingQuestion={isEditingQuestion}
          isEditingDescription={isEditingDescription}
          isHovered={isHovered}
          questionRef={questionRef}
          descriptionRef={descriptionRef}
          onQuestionClick={handleQuestionClick}
          onDescriptionClick={handleDescriptionClick}
          onQuestionChange={handleQuestionChange}
          onDescriptionChange={handleDescriptionChange}
          onQuestionBlur={handleQuestionBlur}
          onDescriptionBlur={handleDescriptionBlur}
          onQuestionKeyDown={handleQuestionKeyDown}
          onDescriptionKeyDown={handleDescriptionKeyDown}
          onRequiredToggle={handleRequiredToggle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onEnhance={onEnhance}
          onAdvancedClick={handleAdvancedClick}
        >
          {/* Rating Preview */}
          <div className="mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              {renderRatingPreview()}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {ratingStyle === "stars" && `Rate from 1 to ${maxRating} stars`}
              {ratingStyle === "numbers" && `Rate from 1 to ${maxRating}`}
              {ratingStyle === "emoji" && `Rate from 1 to ${maxRating} emoji`}
            </p>
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Advanced Settings"
          subtitle="Configure rating style and scale"
        >
          {/* Rating Style */}
          <div className="space-y-2">
            <Label
              htmlFor="ratingStyle"
              className="text-sm font-medium text-foreground"
            >
              Rating Style
            </Label>
            <Select value={ratingStyle} onValueChange={handleRatingStyleChange}>
              <SelectTrigger id="ratingStyle" className="w-full">
                <SelectValue placeholder="Select rating style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">⭐ Stars</SelectItem>
                <SelectItem value="numbers">🔢 Numbers</SelectItem>
                <SelectItem value="emoji">😊 Emoji</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how users will rate
            </p>
          </div>

          {/* Max Rating */}
          <div className="space-y-2">
            <Label
              htmlFor="maxRating"
              className="text-sm font-medium text-foreground"
            >
              Maximum Rating
            </Label>
            <Input
              id="maxRating"
              type="number"
              min="1"
              max="10"
              value={maxRating}
              onChange={(e) => handleMaxRatingChange(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Scale from 1 to {maxRating} (max: 10)
            </p>
          </div>

          {/* Preview Section */}
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Preview
            </h4>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 flex-wrap">
                {renderRatingPreview()}
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
      prevProps.field.maxRating === nextProps.field.maxRating &&
      prevProps.field.ratingStyle === nextProps.field.ratingStyle &&
      prevProps.index === nextProps.index &&
      prevProps.isAdvancedOpen === nextProps.isAdvancedOpen
    );
  }
);

export default RatingField;
