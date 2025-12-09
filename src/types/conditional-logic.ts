/**
 * Types for Section Conditional Logic & Navigation
 *
 * This system allows sections to navigate based on user responses to fields.
 * Supported field types: MULTIPLE_CHOICE, DROPDOWN, CHECKBOXES, RATING, LINEAR_SCALE
 */

// ==================== ENUMS ====================

/**
 * Operators for evaluating conditional rules
 */
export type ConditionalOperator =
  | "equals" // Field value equals specific value (for single-select)
  | "not_equals" // Field value does not equal specific value
  | "greater_than" // Numeric value greater than threshold (rating, linear-scale)
  | "less_than" // Numeric value less than threshold (rating, linear-scale)
  | "between" // Numeric value between min and max (rating, linear-scale)
  | "contains" // Array contains value (for checkboxes)
  | "any_of" // Field value is any of specified values (checkboxes)
  | "all_of" // Field value includes all specified values (checkboxes)
  | "none_of"; // Field value includes none of specified values (checkboxes)

/**
 * Target types for section navigation
 */
export type NavigationTarget =
  | string // Section ID to navigate to
  | "NEXT" // Go to next section in order
  | "SUBMIT"; // Submit the form (end)

// ==================== INTERFACES ====================

/**
 * A single conditional rule
 * Defines: IF field meets condition THEN go to target section
 */
export interface ConditionalRule {
  id: string; // Unique ID for the rule
  fieldId: string; // Which field in this section triggers the rule
  fieldType: string; // Type of field (for validation & UI)
  operator: ConditionalOperator; // How to evaluate the condition
  value: string | number | string[]; // The value(s) to compare against
  targetSectionId: NavigationTarget; // Where to navigate if condition is true
}

/**
 * Complete navigation logic for a section
 * Stored in Section.nextSectionLogic JSON field
 */
export interface NextSectionLogic {
  type: "linear" | "conditional"; // Linear = go to next section, Conditional = use rules
  defaultTarget: NavigationTarget; // Fallback if no rules match (usually "NEXT")
  rules: ConditionalRule[]; // Array of conditional rules (evaluated in order)
}

// ==================== FIELD TYPE SUPPORT ====================

/**
 * Field types that support conditional logic
 * These have discrete values that can be evaluated
 */
export const CONDITIONAL_FIELD_TYPES = [
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "CHECKBOXES",
  "RATING",
  "LINEAR_SCALE",
] as const;

export type ConditionalFieldType = (typeof CONDITIONAL_FIELD_TYPES)[number];

/**
 * Check if a field type supports conditional logic
 */
export function supportsConditionalLogic(fieldType: string): boolean {
  return CONDITIONAL_FIELD_TYPES.includes(fieldType as ConditionalFieldType);
}

// ==================== VALIDATION HELPERS ====================

/**
 * Get valid operators for a given field type
 */
export function getValidOperators(
  fieldType: ConditionalFieldType
): ConditionalOperator[] {
  switch (fieldType) {
    case "MULTIPLE_CHOICE":
    case "DROPDOWN":
      return ["equals", "not_equals"];

    case "CHECKBOXES":
      return ["contains", "any_of", "all_of", "none_of"];

    case "RATING":
    case "LINEAR_SCALE":
      return ["equals", "not_equals", "greater_than", "less_than", "between"];

    default:
      return [];
  }
}

/**
 * Validate if an operator is valid for a field type
 */
export function isValidOperator(
  fieldType: ConditionalFieldType,
  operator: ConditionalOperator
): boolean {
  return getValidOperators(fieldType).includes(operator);
}

/**
 * Get human-readable label for operator
 */
export function getOperatorLabel(operator: ConditionalOperator): string {
  const labels: Record<ConditionalOperator, string> = {
    equals: "is equal to",
    not_equals: "is not equal to",
    greater_than: "is greater than",
    less_than: "is less than",
    between: "is between",
    contains: "contains",
    any_of: "contains any of",
    all_of: "contains all of",
    none_of: "contains none of",
  };
  return labels[operator];
}

// ==================== DEFAULT VALUES ====================

/**
 * Create default navigation logic (linear mode)
 */
export function createDefaultLogic(): NextSectionLogic {
  return {
    type: "linear",
    defaultTarget: "NEXT",
    rules: [],
  };
}

/**
 * Create a new empty rule
 */
export function createEmptyRule(
  fieldId: string,
  fieldType: string
): ConditionalRule {
  const validOperators = getValidOperators(fieldType as ConditionalFieldType);

  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    fieldId,
    fieldType,
    operator: validOperators[0] || "equals",
    value: "",
    targetSectionId: "NEXT",
  };
}
