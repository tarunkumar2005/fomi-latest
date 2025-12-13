"use client"

import { useState, useCallback, memo } from "react"
import { Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FieldWrapper from "../edit/shared/FieldWrapper"
import AdvancedPanel, {
  AdvancedPanelSection,
  AdvancedPanelFieldGroup,
  AdvancedPanelDivider,
} from "../edit/shared/AdvancedPanel"
import { useFieldHandlers } from "../edit/hooks/useFieldHandlers"
import { cn } from "@/lib/utils"

interface RatingFieldProps {
  field: {
    id: string
    question: string
    description?: string
    required: boolean
    maxRating?: number
    ratingStyle?: "stars" | "numbers" | "emoji"
  }
  index: number
  onUpdate: (updates: Partial<RatingFieldProps["field"]>) => void
  onDelete: () => void
  onDuplicate: () => void
  onEnhance?: () => void
  isAdvancedOpen?: boolean
  onAdvancedToggle?: () => void
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
    const [hoveredRating, setHoveredRating] = useState<number | null>(null)

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
    } = useFieldHandlers(field, onUpdate, isAdvancedOpen, onAdvancedToggle)

    const handleRequiredToggle = useCallback(() => {
      onUpdate({ required: !field.required })
    }, [field.required, onUpdate])

    const maxRating = field.maxRating || 5
    const ratingStyle = field.ratingStyle || "stars"

    const handleMaxRatingChange = (value: string) => {
      const num = Number.parseInt(value)
      if (!isNaN(num) && num >= 1 && num <= 10) {
        onUpdate({ maxRating: num })
      }
    }

    const handleRatingStyleChange = (value: string) => {
      onUpdate({ ratingStyle: value as "stars" | "numbers" | "emoji" })
    }

    const renderRatingPreview = () => {
      const items = []

      for (let i = 1; i <= maxRating; i++) {
        const isItemHovered = hoveredRating !== null && i <= hoveredRating

        if (ratingStyle === "stars") {
          items.push(
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(null)}
              className="transition-all duration-150 cursor-pointer p-0.5"
              disabled
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-all duration-200",
                  isItemHovered ? "fill-warning text-warning scale-110" : "fill-none text-border",
                )}
              />
            </button>,
          )
        } else if (ratingStyle === "numbers") {
          items.push(
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled
              className={cn(
                "h-10 w-10 rounded-lg border-2 font-semibold text-sm",
                "transition-all duration-200",
                isItemHovered
                  ? "border-primary bg-primary text-primary-foreground scale-105"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {i}
            </button>,
          )
        } else if (ratingStyle === "emoji") {
          const emojis = ["😢", "😕", "😐", "🙂", "😊", "😄", "🤩", "😍", "🥰", "🤗"]
          items.push(
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoveredRating(i)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled
              className={cn(
                "text-2xl transition-all duration-200 p-1",
                isItemHovered ? "scale-125" : "scale-100 opacity-50",
              )}
            >
              {emojis[i - 1] || "😊"}
            </button>,
          )
        }
      }

      return items
    }

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
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">{renderRatingPreview()}</div>
            <p className="text-xs text-muted-foreground/60">
              {ratingStyle === "stars" && `Rate from 1 to ${maxRating} stars`}
              {ratingStyle === "numbers" && `Rate from 1 to ${maxRating}`}
              {ratingStyle === "emoji" && `Rate from 1 to ${maxRating} emoji`}
            </p>
          </div>
        </FieldWrapper>

        <AdvancedPanel
          isOpen={isAdvancedOpen ?? false}
          onClose={handleAdvancedClose}
          title="Rating Settings"
          subtitle="Configure rating style and scale"
        >
          <AdvancedPanelFieldGroup label="Rating Style" htmlFor="ratingStyle" description="Choose how users will rate">
            <Select value={ratingStyle} onValueChange={handleRatingStyleChange}>
              <SelectTrigger id="ratingStyle" className="w-full">
                <SelectValue placeholder="Select rating style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Stars</SelectItem>
                <SelectItem value="numbers">Numbers</SelectItem>
                <SelectItem value="emoji">Emoji</SelectItem>
              </SelectContent>
            </Select>
          </AdvancedPanelFieldGroup>

          <AdvancedPanelFieldGroup
            label="Maximum Rating"
            htmlFor="maxRating"
            description={`Scale from 1 to ${maxRating} (max: 10)`}
          >
            <Input
              id="maxRating"
              type="number"
              min="1"
              max="10"
              value={maxRating}
              onChange={(e) => handleMaxRatingChange(e.target.value)}
              className="w-full"
            />
          </AdvancedPanelFieldGroup>

          <AdvancedPanelDivider />

          <AdvancedPanelSection title="Preview">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-1.5 flex-wrap">{renderRatingPreview()}</div>
            </div>
          </AdvancedPanelSection>
        </AdvancedPanel>
      </>
    )
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
    )
  },
)

export default RatingField