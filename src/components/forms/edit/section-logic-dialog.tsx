"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Plus, Trash2, AlertTriangle, Info, ArrowRight, GitBranch, Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  NextSectionLogic,
  ConditionalRule,
  ConditionalOperator,
  NavigationTarget,
} from "@/types/conditional-logic"
import { getValidOperators, getOperatorLabel, createDefaultLogic, createEmptyRule } from "@/types/conditional-logic"

interface Field {
  id: string
  type: string
  question: string
  order: number
  options?: Array<{ id: string; label: string; value: string }>
  minValue?: number
  maxValue?: number
}

interface SectionOption {
  id: string
  title: string
  order: number
}

interface SectionLogicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  sectionTitle: string
  currentLogic: NextSectionLogic | null
  fields: Field[]
  availableSections: SectionOption[]
  onSave: (logic: NextSectionLogic) => Promise<void>
  onValidate: (logic: NextSectionLogic) => Promise<{
    valid: boolean
    errors: string[]
  }>
}

export default function SectionLogicDialog({
  open,
  onOpenChange,
  sectionId,
  sectionTitle,
  currentLogic,
  fields,
  availableSections,
  onSave,
  onValidate,
}: SectionLogicDialogProps) {
  const [logic, setLogic] = useState<NextSectionLogic>(currentLogic || createDefaultLogic())
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Filter sections - exclude current section to prevent immediate loops
  const targetSections = availableSections.filter((s) => s.id !== sectionId)

  // Get fields that support conditional logic
  const conditionalFields = fields.filter((f) =>
    ["MULTIPLE_CHOICE", "DROPDOWN", "CHECKBOXES", "RATING", "LINEAR_SCALE"].includes(f.type),
  )

  // Reset state when dialog opens with new data
  useEffect(() => {
    if (open) {
      setLogic(currentLogic || createDefaultLogic())
      setValidationErrors([])
    }
  }, [open, currentLogic])

  const handleTypeChange = (type: "linear" | "conditional") => {
    setLogic((prev) => ({
      ...prev,
      type,
      rules: type === "linear" ? [] : prev.rules,
    }))
    setValidationErrors([])
  }

  const handleDefaultTargetChange = (target: NavigationTarget) => {
    setLogic((prev) => ({ ...prev, defaultTarget: target }))
  }

  const handleAddRule = () => {
    if (conditionalFields.length === 0) {
      setValidationErrors([
        "No conditional fields available. Add MULTIPLE_CHOICE, DROPDOWN, CHECKBOXES, RATING, or LINEAR_SCALE fields first.",
      ])
      return
    }

    const firstField = conditionalFields[0]
    const newRule = createEmptyRule(firstField.id, firstField.type)

    setLogic((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }))
  }

  const handleRemoveRule = (ruleId: string) => {
    setLogic((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }))
  }

  const handleRuleChange = (ruleId: string, updates: Partial<ConditionalRule>) => {
    setLogic((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => {
        if (rule.id !== ruleId) return rule

        const updatedRule = { ...rule, ...updates }

        // If field changed, reset operator and value
        if (updates.fieldId && updates.fieldId !== rule.fieldId) {
          const field = conditionalFields.find((f) => f.id === updates.fieldId)
          if (field) {
            const validOps = getValidOperators(field.type as any)
            updatedRule.fieldType = field.type
            updatedRule.operator = validOps[0]
            updatedRule.value = ""
          }
        }

        // If operator changed to 'between', initialize array value
        if (updates.operator === "between" && !Array.isArray(updatedRule.value)) {
          updatedRule.value = ["", ""]
        }

        // If operator changed from 'between' to something else, convert back to single value
        if (updates.operator && updates.operator !== "between" && Array.isArray(updatedRule.value)) {
          updatedRule.value = ""
        }

        return updatedRule
      }),
    }))
  }

  const getFieldOptions = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    return field?.options || []
  }

  const getFieldById = (fieldId: string) => {
    return fields.find((f) => f.id === fieldId)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setIsValidating(true)
    setValidationErrors([])

    try {
      // Validate the logic
      const validation = await onValidate(logic)

      if (!validation.valid) {
        setValidationErrors(validation.errors)
        setIsSaving(false)
        setIsValidating(false)
        return
      }

      // Save the logic
      await onSave(logic)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving section logic:", error)
      setValidationErrors([error instanceof Error ? error.message : "Failed to save logic"])
    } finally {
      setIsSaving(false)
      setIsValidating(false)
    }
  }

  const renderRuleValue = (rule: ConditionalRule) => {
    const field = getFieldById(rule.fieldId)
    if (!field) return null

    // Between operator - two inputs
    if (rule.operator === "between") {
      const values = Array.isArray(rule.value) ? rule.value : ["", ""]
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={values[0] || ""}
            onChange={(e) =>
              handleRuleChange(rule.id, {
                value: [e.target.value, values[1] || ""],
              })
            }
            className="w-20 sm:w-24 h-9 text-sm rounded-lg"
          />
          <span className="text-xs text-muted-foreground">and</span>
          <Input
            type="number"
            placeholder="Max"
            value={values[1] || ""}
            onChange={(e) =>
              handleRuleChange(rule.id, {
                value: [values[0] || "", e.target.value],
              })
            }
            className="w-20 sm:w-24 h-9 text-sm rounded-lg"
          />
        </div>
      )
    }

    // Numeric fields (RATING, LINEAR_SCALE)
    if (["RATING", "LINEAR_SCALE"].includes(field.type)) {
      return (
        <Input
          type="number"
          placeholder="Enter value"
          value={rule.value as string}
          onChange={(e) => handleRuleChange(rule.id, { value: e.target.value })}
          className="w-28 sm:w-32 h-9 text-sm rounded-lg"
          min={field.minValue}
          max={field.maxValue}
        />
      )
    }

    // Multiple select operators (any_of, all_of, none_of)
    if (["any_of", "all_of", "none_of"].includes(rule.operator)) {
      const selectedValues = Array.isArray(rule.value) ? rule.value : rule.value ? [rule.value] : []
      return (
        <Select
          value={selectedValues.join(",")}
          onValueChange={(value) => {
            const values = value.split(",").filter(Boolean)
            handleRuleChange(rule.id, { value: values })
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm rounded-lg">
            <SelectValue placeholder="Select options..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {getFieldOptions(rule.fieldId).map((option) => (
              <SelectItem key={option.id} value={option.value} className="rounded-lg">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // Single select operators (equals, not_equals, contains)
    if (field.options && field.options.length > 0) {
      return (
        <Select value={rule.value as string} onValueChange={(value) => handleRuleChange(rule.id, { value })}>
          <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm rounded-lg">
            <SelectValue placeholder="Select option..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {getFieldOptions(rule.fieldId).map((option) => (
              <SelectItem key={option.id} value={option.value} className="rounded-lg">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold">Section Navigation Logic</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm mt-0.5">
                Configure navigation after "{sectionTitle}"
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Navigation Type */}
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Navigation Type
              </Label>
              <RadioGroup
                value={logic.type}
                onValueChange={(value) => handleTypeChange(value as "linear" | "conditional")}
                className="grid gap-3"
              >
                <div
                  className={cn(
                    "flex items-start space-x-3 space-y-0 rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all",
                    logic.type === "linear"
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30 hover:bg-muted/30",
                  )}
                  onClick={() => handleTypeChange("linear")}
                >
                  <RadioGroupItem value="linear" id="linear" className="mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="linear"
                      className="font-medium cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                    >
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      Linear Navigation
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Always proceed to the next section in order
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start space-x-3 space-y-0 rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all",
                    logic.type === "conditional"
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30 hover:bg-muted/30",
                  )}
                  onClick={() => handleTypeChange("conditional")}
                >
                  <RadioGroupItem value="conditional" id="conditional" className="mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor="conditional"
                      className="font-medium cursor-pointer flex items-center gap-2 text-sm sm:text-base"
                    >
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      Conditional Navigation
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Navigate based on user responses to fields in this section
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Logic Rules */}
            {logic.type === "conditional" && (
              <>
                <div className="border-t border-border/50" />

                {/* Info Alert */}
                <Alert className="rounded-xl border-sky-500/20 bg-sky-500/5">
                  <Info className="h-4 w-4 text-sky-500" />
                  <AlertDescription className="text-xs sm:text-sm text-sky-700 dark:text-sky-300">
                    Rules are evaluated in order from top to bottom. The first matching rule determines the navigation
                    path.
                  </AlertDescription>
                </Alert>

                {/* No Conditional Fields Warning */}
                {conditionalFields.length === 0 && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs sm:text-sm">
                      No conditional fields available. Add fields of type MULTIPLE_CHOICE, DROPDOWN, CHECKBOXES, RATING,
                      or LINEAR_SCALE to create rules.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Rules List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm sm:text-base font-semibold">Conditional Rules</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRule}
                      disabled={conditionalFields.length === 0}
                      className="h-8 px-3 text-xs sm:text-sm rounded-lg bg-transparent"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Rule
                    </Button>
                  </div>

                  {logic.rules.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                      <GitBranch className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No rules defined</p>
                      <p className="text-xs mt-1">Add a rule to create conditional navigation</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logic.rules.map((rule, index) => {
                        const field = getFieldById(rule.fieldId)
                        const validOperators = field ? getValidOperators(field.type as any) : []

                        return (
                          <div
                            key={rule.id}
                            className="border border-border/50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 bg-card shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="font-mono text-xs rounded-lg px-2.5 py-1">
                                Rule {index + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveRule(rule.id)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-3 sm:gap-4">
                              {/* Field Selection */}
                              <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm text-muted-foreground">If field</Label>
                                <Select
                                  value={rule.fieldId}
                                  onValueChange={(value) => {
                                    const field = conditionalFields.find((f) => f.id === value)
                                    if (field) {
                                      handleRuleChange(rule.id, {
                                        fieldId: value,
                                        fieldType: field.type,
                                      })
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-9 text-sm rounded-lg">
                                    <SelectValue placeholder="Select field..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    {conditionalFields.map((field) => (
                                      <SelectItem key={field.id} value={field.id} className="rounded-lg">
                                        <span className="truncate">{field.question}</span>
                                        <span className="text-xs text-muted-foreground ml-2">({field.type})</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Operator Selection */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs sm:text-sm text-muted-foreground">Condition</Label>
                                  <Select
                                    value={rule.operator}
                                    onValueChange={(value) =>
                                      handleRuleChange(rule.id, {
                                        operator: value as ConditionalOperator,
                                      })
                                    }
                                    disabled={!field}
                                  >
                                    <SelectTrigger className="h-9 text-sm rounded-lg">
                                      <SelectValue placeholder="Select condition..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      {validOperators.map((op) => (
                                        <SelectItem key={op} value={op} className="rounded-lg">
                                          {getOperatorLabel(op)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Value Input */}
                                <div className="space-y-1.5">
                                  <Label className="text-xs sm:text-sm text-muted-foreground">Value</Label>
                                  {renderRuleValue(rule)}
                                </div>
                              </div>

                              {/* Target Section */}
                              <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                                  <ArrowRight className="h-3.5 w-3.5" />
                                  Then go to
                                </Label>
                                <Select
                                  value={rule.targetSectionId as string}
                                  onValueChange={(value) =>
                                    handleRuleChange(rule.id, {
                                      targetSectionId: value as NavigationTarget,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-9 text-sm rounded-lg">
                                    <SelectValue placeholder="Select destination..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    <SelectItem value="NEXT" className="rounded-lg">
                                      Next Section
                                    </SelectItem>
                                    <SelectItem value="SUBMIT" className="rounded-lg">
                                      Submit Form
                                    </SelectItem>
                                    {targetSections.length > 0 && (
                                      <>
                                        <div className="border-t border-border/50 my-2" />
                                        {targetSections.map((section) => (
                                          <SelectItem key={section.id} value={section.id} className="rounded-lg">
                                            {section.title}
                                          </SelectItem>
                                        ))}
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Default Target */}
                <div className="space-y-3 pt-2">
                  <Label className="text-sm sm:text-base font-semibold">Default Navigation</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Where to go if no rules match</p>
                  <Select
                    value={logic.defaultTarget as string}
                    onValueChange={(value) => handleDefaultTargetChange(value as NavigationTarget)}
                  >
                    <SelectTrigger className="h-10 text-sm rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="NEXT" className="rounded-lg">
                        Next Section
                      </SelectItem>
                      <SelectItem value="SUBMIT" className="rounded-lg">
                        Submit Form
                      </SelectItem>
                      {targetSections.length > 0 && (
                        <>
                          <div className="border-t border-border/50 my-2" />
                          {targetSections.map((section) => (
                            <SelectItem key={section.id} value={section.id} className="rounded-lg">
                              {section.title}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-9 px-4 text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-5 text-sm rounded-lg min-w-[100px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Logic"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}