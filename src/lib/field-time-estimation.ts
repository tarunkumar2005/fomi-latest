/**
 * Estimated time in seconds for each field type
 * Based on user interaction and typing time
 */
export const FIELD_TIME_ESTIMATES = {
  // Quick selection fields (5-10 seconds)
  SHORT_TEXT: 10,
  EMAIL: 8,
  NUMBER: 6,
  PHONE: 8,
  DATE: 5,
  TIME: 5,
  URL: 10,
  
  // Medium complexity fields (15-30 seconds)
  SINGLE_CHOICE: 15,
  MULTIPLE_CHOICE: 20,
  DROPDOWN: 12,
  LINEAR_SCALE: 10,
  RATING: 8,
  
  // Longer fields (30-60 seconds)
  LONG_TEXT: 45,
  PARAGRAPH: 60,
  
  // File/Media fields (20-40 seconds)
  FILE_UPLOAD: 30,
  IMAGE_UPLOAD: 25,
  SIGNATURE: 20,
  
  // Special fields
  SECTION_BREAK: 2, // Just reading time
  CHECKBOX: 5,
  SWITCH: 3,
  SLIDER: 8,
  
  // Default for unknown types
  DEFAULT: 15,
} as const;

export type FieldType = keyof typeof FIELD_TIME_ESTIMATES;

/**
 * Calculate estimated time for a single field
 */
export function calculateFieldTime(fieldType: string): number {
  const normalizedType = fieldType.toUpperCase().replace(/-/g, '_') as FieldType;
  return FIELD_TIME_ESTIMATES[normalizedType] || FIELD_TIME_ESTIMATES.DEFAULT;
}

/**
 * Calculate total estimated time for all fields
 * @param fields - Array of field objects with type property
 * @returns Object with seconds and formatted time string
 */
export function calculateFormEstimatedTime(fields: Array<{ type: string }>) {
  if (!fields || fields.length === 0) {
    return {
      seconds: 0,
      minutes: 0,
      formatted: "~0 min",
    };
  }

  // Sum up time for all fields
  const totalSeconds = fields.reduce((total, field) => {
    return total + calculateFieldTime(field.type);
  }, 0);

  // Convert to minutes (round up)
  const totalMinutes = Math.ceil(totalSeconds / 60);

  // Format the time string
  let formatted: string;
  if (totalMinutes === 0) {
    formatted = "<1 min";
  } else if (totalMinutes === 1) {
    formatted = "~1 min";
  } else if (totalMinutes < 60) {
    formatted = `~${totalMinutes} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    formatted = mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`;
  }

  return {
    seconds: totalSeconds,
    minutes: totalMinutes,
    formatted,
  };
}

/**
 * Get a human-readable description of the time estimate
 */
export function getTimeEstimateDescription(minutes: number): string {
  if (minutes === 0) return "Quick form";
  if (minutes <= 2) return "Very short";
  if (minutes <= 5) return "Short";
  if (minutes <= 10) return "Medium";
  if (minutes <= 20) return "Long";
  return "Very long";
}