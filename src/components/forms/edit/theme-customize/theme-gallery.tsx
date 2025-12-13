"use client"

import { Check, Lightbulb, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FormTheme } from "@/types/form-theme"

interface ThemeGalleryProps {
  themes: FormTheme[]
  selectedTheme: FormTheme
  onSelectTheme: (themeId: string) => void
  isLoading?: boolean
}

const getColors = (colors: unknown) => {
  if (typeof colors === "string") {
    try {
      return JSON.parse(colors)
    } catch {
      return { primary: "#6366f1", accent: "#eef2ff" }
    }
  }
  return (colors as { primary?: string; accent?: string }) || { primary: "#6366f1", accent: "#eef2ff" }
}

export default function ThemeGallery({ themes, selectedTheme, onSelectTheme, isLoading }: ThemeGalleryProps) {
  return (
    <div className="p-5 lg:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Palette className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-heading font-semibold text-foreground">Pre-built Themes</h3>
          <p className="text-xs text-muted-foreground">Select a professionally designed theme</p>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => {
          const isSelected = selectedTheme?.id === theme.id
          const colors = getColors(theme.colors)

          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              disabled={isLoading}
              className={cn(
                "group relative flex flex-col rounded-xl border transition-all overflow-hidden text-left",
                "hover:shadow-lg hover:-translate-y-0.5",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-md"
                  : "border-border hover:border-primary/40",
                isLoading && "opacity-50 cursor-not-allowed",
              )}
            >
              {/* Color Preview */}
              <div
                className="h-24 w-full relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary || "#6366f1"} 0%, ${colors.accent || "#eef2ff"} 100%)`,
                }}
              >
                {/* Decorative Shapes */}
                <div
                  className="absolute top-3 right-3 w-10 h-10 rounded-xl opacity-20"
                  style={{ backgroundColor: colors.card || "#ffffff" }}
                />
                <div
                  className="absolute bottom-3 left-3 w-7 h-7 rounded-full opacity-30"
                  style={{ backgroundColor: colors.card || "#ffffff" }}
                />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-3 rounded-full opacity-20"
                  style={{ backgroundColor: colors.card || "#ffffff" }}
                />

                {/* Check Icon for Selected */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Check className="h-6 w-6" style={{ color: colors.primary }} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-3.5 bg-card">
                <p className="text-sm font-medium text-foreground truncate">{theme.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{theme.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Pro Tip */}
      <div className="flex gap-3 p-4 rounded-xl bg-accent/50 border border-primary/10">
        <div className="shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-4.5 w-4.5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-0.5">Pro Tip</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Customize any theme using the Customize tab to match your brand colors and style preferences.
          </p>
        </div>
      </div>
    </div>
  )
}