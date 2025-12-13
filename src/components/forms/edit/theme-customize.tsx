"use client";
import { useMemo } from "react";
import {
  Square,
  Circle,
  RectangleHorizontal,
  Maximize2,
  AlignJustify,
  AlignCenter,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  FormTheme,
  ThemeColors,
  ThemeTypography,
  ThemeLayout,
  ThemeButtons,
  ThemeInputFields,
} from "@/types/form-theme";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ThemeCustomizeProps {
  theme: FormTheme;
  onThemeChange: (updates: Partial<FormTheme>) => void;
  isLoading?: boolean;
}

const FONT_OPTIONS = [
  "Inter",
  "Sora",
  "Roboto",
  "Poppins",
  "Lato",
  "Open Sans",
  "Montserrat",
  "Raleway",
  "Playfair Display",
  "Merriweather",
];

// Helper to parse JSON if needed
const parseJson = <T,>(value: T | string, fallback: T): T => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value || fallback;
};

const defaultColors: ThemeColors = {
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
};

const defaultTypography: ThemeTypography = {
  headingFont: "Sora",
  bodyFont: "Inter",
  fontSize: "medium",
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: 0,
};

const defaultLayout: ThemeLayout = {
  borderRadius: 12,
  spacing: "normal",
  shadow: "md",
};

const defaultButtons: ThemeButtons = {
  style: "rounded",
  size: "md",
  variant: "solid",
};

const defaultInputFields: ThemeInputFields = {
  style: "outlined",
  size: "md",
};

export default function ThemeCustomize({
  theme,
  onThemeChange,
  isLoading,
}: ThemeCustomizeProps) {
  // Parse colors, typography, layout, buttons, and inputFields from JSON if needed
  const colors = useMemo(
    () => parseJson(theme?.colors, defaultColors),
    [theme?.colors]
  );
  const typography = useMemo(
    () => parseJson(theme?.typography, defaultTypography),
    [theme?.typography]
  );
  const layout = useMemo(
    () => parseJson(theme?.layout, defaultLayout),
    [theme?.layout]
  );
  const buttons = useMemo(
    () => parseJson(theme?.buttons, defaultButtons),
    [theme?.buttons]
  );
  const inputFields = useMemo(
    () => parseJson(theme?.inputFields, defaultInputFields),
    [theme?.inputFields]
  );

  const updateColors = (key: keyof ThemeColors, value: string) => {
    onThemeChange({
      colors: {
        ...colors,
        [key]: value,
      },
    });
  };

  const updateTypography = (key: keyof ThemeTypography, value: any) => {
    onThemeChange({
      typography: {
        ...typography,
        [key]: value,
      },
    });
  };

  const updateLayout = (key: keyof ThemeLayout, value: any) => {
    onThemeChange({
      layout: {
        ...layout,
        [key]: value,
      },
    });
  };

  const colorSwatches: Array<{
    key: keyof ThemeColors;
    label: string;
    description?: string;
  }> = [
    { key: "primary", label: "Primary", description: "Brand color" },
    { key: "background", label: "Background", description: "Page BG" },
    { key: "card", label: "Surface", description: "Card BG" },
    { key: "text", label: "Text", description: "Main text" },
    { key: "border", label: "Border", description: "Dividers" },
    { key: "accent", label: "Accent", description: "Highlights" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 lg:p-5 space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Design Studio
              </h3>
              <p className="text-xs text-muted-foreground">
                Fine-tune your form
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">Live</span>
          </div>
        </div>

        {/* Mini Preview */}
        <div
          className="p-4 rounded-xl border-2 overflow-hidden"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: `${layout.borderRadius}px`,
          }}
        >
          <div className="space-y-2">
            <div
              className="h-2 rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: "60%",
              }}
            />
            <div
              className="h-1.5 rounded-full"
              style={{
                backgroundColor: colors.textMuted,
                width: "80%",
                opacity: 0.5,
              }}
            />
            <div
              className="h-1.5 rounded-full"
              style={{
                backgroundColor: colors.textMuted,
                width: "40%",
                opacity: 0.5,
              }}
            />
          </div>
        </div>

        {/* COLORS Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Colors
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {colorSwatches.map((swatch) => (
              <Popover key={swatch.key}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all group">
                    <div
                      className="h-9 w-9 rounded-lg shadow-sm ring-1 ring-border group-hover:ring-primary/30 transition-all flex-shrink-0"
                      style={{ backgroundColor: colors[swatch.key] }}
                    />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {swatch.label}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {colors[swatch.key]}
                      </p>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="start">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium">
                        {swatch.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {swatch.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colors[swatch.key]}
                        onChange={(e) =>
                          updateColors(swatch.key, e.target.value)
                        }
                        className="h-9 w-12 rounded-md cursor-pointer border border-border"
                      />
                      <Input
                        type="text"
                        value={colors[swatch.key]}
                        onChange={(e) =>
                          updateColors(swatch.key, e.target.value)
                        }
                        className="flex-1 h-9 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>

        {/* TYPOGRAPHY Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Typography
          </h4>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Heading Font
              </Label>
              <Select
                value={typography.headingFont}
                onValueChange={(value) =>
                  updateTypography("headingFont", value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Body Font
              </Label>
              <Select
                value={typography.bodyFont}
                onValueChange={(value) => updateTypography("bodyFont", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Font Size
            </Label>
            <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-lg">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateTypography("fontSize", size)}
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-medium transition-all",
                    typography.fontSize === size
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size === "small"
                    ? "Small"
                    : size === "medium"
                    ? "Medium"
                    : "Large"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LAYOUT Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Layout & Spacing
          </h4>

          {/* Border Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground">
                Corner Radius
              </Label>
              <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                {layout.borderRadius}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[layout.borderRadius]}
                onValueChange={([value]) => updateLayout("borderRadius", value)}
                min={0}
                max={24}
                step={2}
                className="flex-1"
              />
              <RectangleHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          {/* Content Width */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Content Width
            </Label>
            <ToggleGroup
              type="single"
              value={layout.spacing}
              onValueChange={(value) => value && updateLayout("spacing", value)}
              className="flex w-full gap-1.5 p-1 bg-muted/50 rounded-lg"
            >
              <ToggleGroupItem
                value="compact"
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                <AlignCenter className="h-4 w-4" />
                <span className="text-xs">Narrow</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="normal"
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                <AlignJustify className="h-4 w-4" />
                <span className="text-xs">Medium</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="relaxed"
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="text-xs">Wide</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Shadow Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <div>
              <Label className="text-xs font-medium text-foreground">
                Add Depth
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable card shadows
              </p>
            </div>
            <Switch
              checked={layout.shadow !== "none"}
              onCheckedChange={(checked) =>
                updateLayout("shadow", checked ? "md" : "none")
              }
            />
          </div>
        </div>

        {/* BUTTONS Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Buttons
          </h4>

          {/* Button Shape */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Shape</Label>
            <ToggleGroup
              type="single"
              value={buttons.style}
              onValueChange={(value) =>
                value &&
                onThemeChange({
                  buttons: {
                    ...buttons,
                    style: value as "rounded" | "sharp" | "pill",
                  },
                })
              }
              className="flex w-full gap-1.5 p-1 bg-muted/50 rounded-lg"
            >
              <ToggleGroupItem
                value="sharp"
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                <Square className="h-4 w-4" />
                <span className="text-xs">Sharp</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="rounded"
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                <RectangleHorizontal className="h-4 w-4" />
                <span className="text-xs">Rounded</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="pill"
                className="flex-1 flex flex-col items-center gap-1 h-auto py-2.5 rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                <Circle className="h-4 w-4" />
                <span className="text-xs">Pill</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Button Size */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Size</Label>
            <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg">
              {(["sm", "md", "lg"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    onThemeChange({
                      buttons: { ...buttons, size },
                    })
                  }
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-medium transition-all",
                    buttons.size === size
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
                </button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Style</Label>
            <ToggleGroup
              type="single"
              value={buttons.variant}
              onValueChange={(value) =>
                value &&
                onThemeChange({
                  buttons: {
                    ...buttons,
                    variant: value as "outline" | "solid" | "ghost",
                  },
                })
              }
              className="flex w-full gap-1.5 p-1 bg-muted/50 rounded-lg"
            >
              <ToggleGroupItem
                value="solid"
                className="flex-1 h-8 text-xs rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                Solid
              </ToggleGroupItem>
              <ToggleGroupItem
                value="outline"
                className="flex-1 h-8 text-xs rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                Outline
              </ToggleGroupItem>
              <ToggleGroupItem
                value="ghost"
                className="flex-1 h-8 text-xs rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                Ghost
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* INPUT FIELDS Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Input Fields
          </h4>

          {/* Input Style */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">Style</Label>
            <ToggleGroup
              type="single"
              value={inputFields.style}
              onValueChange={(value) =>
                value &&
                onThemeChange({
                  inputFields: {
                    ...inputFields,
                    style: value as "outlined" | "filled" | "underlined",
                  },
                })
              }
              className="flex w-full gap-1.5 p-1 bg-muted/50 rounded-lg"
            >
              <ToggleGroupItem
                value="outlined"
                className="flex-1 h-8 text-xs rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                Outlined
              </ToggleGroupItem>
              <ToggleGroupItem
                value="filled"
                className="flex-1 h-8 text-xs rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                Filled
              </ToggleGroupItem>
              <ToggleGroupItem
                value="underlined"
                className="flex-1 h-8 text-xs rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm"
              >
                Underline
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Input Height */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
              Height
            </Label>
            <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg">
              {(["sm", "md", "lg"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    onThemeChange({
                      inputFields: { ...inputFields, size },
                    })
                  }
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-medium transition-all",
                    inputFields.size === size
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ADVANCED Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Advanced
          </h4>

          {/* Animations Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
            <div>
              <Label className="text-xs font-medium text-foreground">
                Animations
              </Label>
              <p className="text-xs text-muted-foreground">
                Smooth transitions
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          {/* Custom CSS */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Custom CSS
            </Label>
            <Textarea
              placeholder="/* Custom overrides */"
              className="font-mono text-xs min-h-20 resize-none bg-muted/30"
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
