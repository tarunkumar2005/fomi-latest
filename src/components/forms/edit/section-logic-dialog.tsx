"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  NextSectionLogic,
  ConditionalRule,
  ConditionalOperator,
  NavigationTarget,
} from "@/types/conditional-logic";
import {
  getValidOperators,
  getOperatorLabel,
  createDefaultLogic,
  createEmptyRule,
} from "@/types/conditional-logic";

interface Field {
  id: string;
  type: string;
  question: string;
  order: number;
  options?: Array<{ id: string; label: string; value: string }>;
  minValue?: number;
  maxValue?: number;
}

interface SectionOption {
  id: string;
  title: string;
  order: number;
}

interface SectionLogicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  currentLogic: NextSectionLogic | null;
  fields: Field[];
  availableSections: SectionOption[];
  onSave: (logic: NextSectionLogic) => Promise<void>;
  onValidate: (logic: NextSectionLogic) => Promise<{
    valid: boolean;
    errors: string[];
  }>;
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
  const [logic, setLogic] = useState<NextSectionLogic>(
    currentLogic || createDefaultLogic()
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Filter sections - exclude current section to prevent immediate loops
  const targetSections = availableSections.filter((s) => s.id !== sectionId);

  // Get fields that support conditional logic
  const conditionalFields = fields.filter((f) =>
    [
      "MULTIPLE_CHOICE",
      "DROPDOWN",
      "CHECKBOXES",
      "RATING",
      "LINEAR_SCALE",
    ].includes(f.type)
  );

  // Reset state when dialog opens with new data
  useEffect(() => {
    if (open) {
      setLogic(currentLogic || createDefaultLogic());
      setValidationErrors([]);
    }
  }, [open, currentLogic]);

  const handleTypeChange = (type: "linear" | "conditional") => {
    setLogic((prev) => ({
      ...prev,
      type,
      rules: type === "linear" ? [] : prev.rules,
    }));
    setValidationErrors([]);
  };

  const handleDefaultTargetChange = (target: NavigationTarget) => {
    setLogic((prev) => ({ ...prev, defaultTarget: target }));
  };

  const handleAddRule = () => {
    if (conditionalFields.length === 0) {
      setValidationErrors([
        "No conditional fields available. Add MULTIPLE_CHOICE, DROPDOWN, CHECKBOXES, RATING, or LINEAR_SCALE fields first.",
      ]);
      return;
    }

    const firstField = conditionalFields[0];
    const newRule = createEmptyRule(firstField.id, firstField.type);

    setLogic((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));
  };

  const handleRemoveRule = (ruleId: string) => {
    setLogic((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }));
  };

  const handleRuleChange = (
    ruleId: string,
    updates: Partial<ConditionalRule>
  ) => {
    setLogic((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => {
        if (rule.id !== ruleId) return rule;

        const updatedRule = { ...rule, ...updates };

        // If field changed, reset operator and value
        if (updates.fieldId && updates.fieldId !== rule.fieldId) {
          const field = conditionalFields.find((f) => f.id === updates.fieldId);
          if (field) {
            const validOps = getValidOperators(field.type as any);
            updatedRule.fieldType = field.type;
            updatedRule.operator = validOps[0];
            updatedRule.value = "";
          }
        }

        // If operator changed to 'between', initialize array value
        if (
          updates.operator === "between" &&
          !Array.isArray(updatedRule.value)
        ) {
          updatedRule.value = ["", ""];
        }

        // If operator changed from 'between' to something else, convert back to single value
        if (
          updates.operator &&
          updates.operator !== "between" &&
          Array.isArray(updatedRule.value)
        ) {
          updatedRule.value = "";
        }

        return updatedRule;
      }),
    }));
  };

  const getFieldOptions = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    return field?.options || [];
  };

  const getFieldById = (fieldId: string) => {
    return fields.find((f) => f.id === fieldId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsValidating(true);
    setValidationErrors([]);

    try {
      // Validate the logic
      const validation = await onValidate(logic);

      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setIsSaving(false);
        setIsValidating(false);
        return;
      }

      // Save the logic
      await onSave(logic);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving section logic:", error);
      setValidationErrors([
        error instanceof Error ? error.message : "Failed to save logic",
      ]);
    } finally {
      setIsSaving(false);
      setIsValidating(false);
    }
  };

  const renderRuleValue = (rule: ConditionalRule) => {
    const field = getFieldById(rule.fieldId);
    if (!field) return null;

    // Between operator - two inputs
    if (rule.operator === "between") {
      const values = Array.isArray(rule.value) ? rule.value : ["", ""];
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
            className="w-24"
          />
          <span className="text-muted-foreground">and</span>
          <Input
            type="number"
            placeholder="Max"
            value={values[1] || ""}
            onChange={(e) =>
              handleRuleChange(rule.id, {
                value: [values[0] || "", e.target.value],
              })
            }
            className="w-24"
          />
        </div>
      );
    }

    // Numeric fields (RATING, LINEAR_SCALE)
    if (["RATING", "LINEAR_SCALE"].includes(field.type)) {
      return (
        <Input
          type="number"
          placeholder="Enter value"
          value={rule.value as string}
          onChange={(e) => handleRuleChange(rule.id, { value: e.target.value })}
          className="w-32"
          min={field.minValue}
          max={field.maxValue}
        />
      );
    }

    // Multiple select operators (any_of, all_of, none_of)
    if (["any_of", "all_of", "none_of"].includes(rule.operator)) {
      const selectedValues = Array.isArray(rule.value)
        ? rule.value
        : rule.value
        ? [rule.value]
        : [];
      return (
        <Select
          value={selectedValues.join(",")}
          onValueChange={(value) => {
            const values = value.split(",").filter(Boolean);
            handleRuleChange(rule.id, { value: values });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select options..." />
          </SelectTrigger>
          <SelectContent>
            {getFieldOptions(rule.fieldId).map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Single select operators (equals, not_equals, contains)
    if (field.options && field.options.length > 0) {
      return (
        <Select
          value={rule.value as string}
          onValueChange={(value) => handleRuleChange(rule.id, { value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select option..." />
          </SelectTrigger>
          <SelectContent>
            {getFieldOptions(rule.fieldId).map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return null;
  };

  const getTargetLabel = (target: NavigationTarget) => {
    if (target === "NEXT") return "Next Section";
    if (target === "SUBMIT") return "Submit Form";
    const section = targetSections.find((s) => s.id === target);
    return section ? section.title : "Unknown Section";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Section Navigation Logic
          </DialogTitle>
          <DialogDescription>
            Configure how users navigate after completing "{sectionTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Navigation Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Navigation Type</Label>
            <RadioGroup
              value={logic.type}
              onValueChange={(value) =>
                handleTypeChange(value as "linear" | "conditional")
              }
            >
              <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="linear" id="linear" />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="linear"
                    className="font-medium cursor-pointer flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Linear Navigation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Always proceed to the next section in order
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="conditional" id="conditional" />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="conditional"
                    className="font-medium cursor-pointer flex items-center gap-2"
                  >
                    <GitBranch className="h-4 w-4" />
                    Conditional Navigation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Navigate based on user responses to fields in this section
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Logic Rules */}
          {logic.type === "conditional" && (
            <>
              <div className="border-t my-4" />

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Rules are evaluated in order from top to bottom. The first
                  matching rule determines the navigation path.
                </AlertDescription>
              </Alert>

              {/* No Conditional Fields Warning */}
              {conditionalFields.length === 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No conditional fields available. Add fields of type
                    MULTIPLE_CHOICE, DROPDOWN, CHECKBOXES, RATING, or
                    LINEAR_SCALE to create rules.
                  </AlertDescription>
                </Alert>
              )}

              {/* Rules List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Conditional Rules
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddRule}
                    disabled={conditionalFields.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>

                {logic.rules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    No rules defined. Add a rule to create conditional
                    navigation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logic.rules.map((rule, index) => {
                      const field = getFieldById(rule.fieldId);
                      const validOperators = field
                        ? getValidOperators(field.type as any)
                        : [];

                      return (
                        <div
                          key={rule.id}
                          className="border rounded-lg p-4 space-y-4 bg-accent/30"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-mono">
                              Rule {index + 1}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid gap-4">
                            {/* Field Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm">If field</Label>
                              <Select
                                value={rule.fieldId}
                                onValueChange={(value) => {
                                  const field = conditionalFields.find(
                                    (f) => f.id === value
                                  );
                                  if (field) {
                                    handleRuleChange(rule.id, {
                                      fieldId: value,
                                      fieldType: field.type,
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditionalFields.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                      {field.question}{" "}
                                      <span className="text-xs text-muted-foreground">
                                        ({field.type})
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Operator Selection */}
                            <div className="space-y-2">
                              <Label className="text-sm">Condition</Label>
                              <Select
                                value={rule.operator}
                                onValueChange={(value) =>
                                  handleRuleChange(rule.id, {
                                    operator: value as ConditionalOperator,
                                  })
                                }
                                disabled={!field}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {validOperators.map((op) => (
                                    <SelectItem key={op} value={op}>
                                      {getOperatorLabel(op)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Value Input */}
                            <div className="space-y-2">
                              <Label className="text-sm">Value</Label>
                              {renderRuleValue(rule)}
                            </div>

                            {/* Target Section */}
                            <div className="space-y-2">
                              <Label className="text-sm">Then go to</Label>
                              <Select
                                value={rule.targetSectionId as string}
                                onValueChange={(value) =>
                                  handleRuleChange(rule.id, {
                                    targetSectionId: value as NavigationTarget,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NEXT">
                                    Next Section
                                  </SelectItem>
                                  <SelectItem value="SUBMIT">
                                    Submit Form
                                  </SelectItem>
                                  {targetSections.length > 0 && (
                                    <>
                                      <div className="border-t my-2" />
                                      {targetSections.map((section) => (
                                        <SelectItem
                                          key={section.id}
                                          value={section.id}
                                        >
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
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Default Target */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Default Navigation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Where to go if no rules match
                </p>
                <Select
                  value={logic.defaultTarget as string}
                  onValueChange={(value) =>
                    handleDefaultTargetChange(value as NavigationTarget)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEXT">Next Section</SelectItem>
                    <SelectItem value="SUBMIT">Submit Form</SelectItem>
                    {targetSections.length > 0 && (
                      <>
                        <div className="border-t my-2" />
                        {targetSections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Logic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
