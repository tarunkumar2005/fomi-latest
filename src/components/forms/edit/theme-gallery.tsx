"use client";

import { Check, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormTheme } from "@/types/form-theme";

interface ThemeGalleryProps {
  themes: FormTheme[];
  selectedTheme: FormTheme;
  onSelectTheme: (themeId: string) => void;
  isLoading?: boolean;
}

// Helper to parse JSON colors if needed
const getColors = (colors: any) => {
  if (typeof colors === "string") {
    try {
      return JSON.parse(colors);
    } catch {
      return { primary: "#6366f1", accent: "#eef2ff" };
    }
  }
  return colors || { primary: "#6366f1", accent: "#eef2ff" };
};

export default function ThemeGallery({
  themes,
  selectedTheme,
  onSelectTheme,
  isLoading,
}: ThemeGalleryProps) {
  return (
    <div className="p-4 lg:p-5 space-y-5">
      {/* Section Header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Pre-built Themes
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Select a professionally designed theme to get started
        </p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const isSelected = selectedTheme?.id === theme.id;
          const colors = getColors(theme.colors);

          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              disabled={isLoading}
              className={cn(
                "group relative flex flex-col rounded-xl border transition-all overflow-hidden text-left",
                "hover:shadow-md",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-sm"
                  : "border-border hover:border-primary/40",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Color Preview */}
              <div
                className="h-20 w-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${
                    colors.primary || "#6366f1"
                  } 0%, ${colors.accent || "#eef2ff"} 100%)`,
                }}
              >
                {/* Decorative Shapes */}
                <div
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg opacity-20"
                  style={{ backgroundColor: colors.card || "#ffffff" }}
                />
                <div
                  className="absolute bottom-2 left-2 w-6 h-6 rounded-full opacity-30"
                  style={{ backgroundColor: colors.card || "#ffffff" }}
                />

                {/* Check Icon for Selected */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check
                        className="h-5 w-5"
                        style={{ color: colors.primary }}
                        strokeWidth={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-3 bg-card">
                <p className="text-sm font-medium text-foreground truncate">
                  {theme.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {theme.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pro Tip */}
      <div className="flex gap-3 p-3 rounded-xl bg-accent border border-primary/10">
        <div className="shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-0.5">
            Pro Tip
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Customize any theme using the Customize tab to match your brand.
          </p>
        </div>
      </div>
    </div>
  );
}
