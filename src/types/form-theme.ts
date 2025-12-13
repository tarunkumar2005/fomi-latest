export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  destructive: string;
  input: string;
  ring: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  fontSize: "small" | "medium" | "large";
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface ThemeLayout {
  borderRadius: number;
  spacing: "compact" | "normal" | "relaxed";
  shadow: "none" | "sm" | "md" | "lg";
}

export interface ThemeButtons {
  style: "rounded" | "sharp" | "pill";
  size: "sm" | "md" | "lg";
  variant: "solid" | "outline" | "ghost";
}

export interface ThemeInputFields {
  style: "outlined" | "filled" | "underlined";
  size: "sm" | "md" | "lg";
}

export interface FormTheme {
  id: string;
  name: string;
  description: string;
  category?: string;
  isBuiltIn: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  buttons: ThemeButtons;
  inputFields: ThemeInputFields;
}

export const DEFAULT_THEME: FormTheme = {
  id: "default",
  name: "Default",
  description: "Indigo & Clean",
  isBuiltIn: true,
  colors: {
    primary: "#6366f1",
    background: "#ffffff",
    card: "#ffffff",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    accent: "#eef2ff",
    destructive: "#ef4444",
    input: "#ffffff",
    ring: "#6366f1",
  },
  typography: {
    headingFont: "Sora",
    bodyFont: "Inter",
    fontSize: "medium",
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  layout: {
    borderRadius: 12,
    spacing: "normal",
    shadow: "md",
  },
  buttons: {
    style: "rounded",
    size: "md",
    variant: "solid",
  },
  inputFields: {
    style: "outlined",
    size: "md",
  },
};
