"use client"

import DraggableFieldWrapper from "../shared/DraggableFieldWrapper"
import ShortAnswerField from "../../form-fields/short-answer-field"
import ParagraphField from "../../form-fields/paragraph-field"
import EmailField from "../../form-fields/email-field"
import NumberField from "../../form-fields/number-field"
import PhoneField from "../../form-fields/phone-field"
import MultipleChoiceField from "../../form-fields/multiple-choice-field"
import CheckboxesField from "../../form-fields/checkboxes-field"
import DropdownField from "../../form-fields/dropdown-field"
import RatingField from "../../form-fields/rating-field"
import LinearScaleField from "../../form-fields/linear-scale-field"
import UrlField from "../../form-fields/url-field"
import DateField from "../../form-fields/date-field"
import TimeField from "../../form-fields/time-field"
import DateRangeField from "../../form-fields/date-range-field"
import FileUploadField from "../../form-fields/file-upload-field"

import type { Field, FieldUpdateData } from "@/types/form-edit"

interface FieldRendererProps {
  field: Field
  index: number
  openAdvancedFieldId: string | null
  onUpdate: (fieldId: string, updates: FieldUpdateData) => void
  onDelete: (fieldId: string) => void
  onDuplicate: (fieldId: string) => void
  onEnhance: (fieldId: string) => void
  onAdvancedToggle: (fieldId: string) => void
}

export default function FieldRenderer({
  field,
  index,
  openAdvancedFieldId,
  onUpdate,
  onDelete,
  onDuplicate,
  onEnhance,
  onAdvancedToggle,
}: FieldRendererProps) {
  // Transform Prisma field to component field format
  // Prisma uses `null` for optional fields, but components expect `undefined`
  const transformedField = {
    ...field,
    description: field.description ?? undefined,
    placeholder: field.placeholder ?? undefined,
    minLabel: field.minLabel ?? undefined,
    maxLabel: field.maxLabel ?? undefined,
    minLength: field.minLength ?? undefined,
    maxLength: field.maxLength ?? undefined,
    min: field.min ?? undefined,
    max: field.max ?? undefined,
    minDate: field.minDate ?? undefined,
    maxDate: field.maxDate ?? undefined,
    minTime: field.minTime ?? undefined,
    maxTime: field.maxTime ?? undefined,
    maxRating: field.maxRating ?? undefined,
    acceptedTypes: field.acceptedTypes ?? undefined,
    maxFileSize: field.maxFileSize ?? undefined,
  }

  const commonProps = {
    field: transformedField as any,
    index,
    onUpdate: (updates: any) => onUpdate(field.id, updates),
    onDelete: () => onDelete(field.id),
    onDuplicate: () => onDuplicate(field.id),
    onEnhance: () => onEnhance(field.id),
    isAdvancedOpen: openAdvancedFieldId === field.id,
    onAdvancedToggle: () => onAdvancedToggle(field.id),
  }

  let fieldComponent

  switch (field.type) {
    case "PARAGRAPH":
      fieldComponent = <ParagraphField {...commonProps} />
      break
    case "EMAIL":
      fieldComponent = <EmailField {...commonProps} />
      break
    case "NUMBER":
      fieldComponent = <NumberField {...commonProps} />
      break
    case "PHONE":
      fieldComponent = <PhoneField {...commonProps} />
      break
    case "MULTIPLE_CHOICE":
      fieldComponent = <MultipleChoiceField {...commonProps} />
      break
    case "CHECKBOXES":
      fieldComponent = <CheckboxesField {...commonProps} />
      break
    case "DROPDOWN":
      fieldComponent = <DropdownField {...commonProps} />
      break
    case "RATING":
      fieldComponent = <RatingField {...commonProps} />
      break
    case "LINEAR_SCALE":
      fieldComponent = <LinearScaleField {...commonProps} />
      break
    case "URL":
      fieldComponent = <UrlField {...commonProps} />
      break
    case "DATE":
      fieldComponent = <DateField {...commonProps} />
      break
    case "TIME":
      fieldComponent = <TimeField {...commonProps} />
      break
    case "DATE_RANGE":
      fieldComponent = <DateRangeField {...commonProps} />
      break
    case "FILE_UPLOAD":
      fieldComponent = <FileUploadField {...commonProps} />
      break
    case "SHORT_ANSWER":
    default:
      fieldComponent = <ShortAnswerField {...commonProps} />
  }

  return (
    <DraggableFieldWrapper key={field.id} id={field.id}>
      {fieldComponent}
    </DraggableFieldWrapper>
  )
}

FieldRenderer.displayName = "FieldRenderer"