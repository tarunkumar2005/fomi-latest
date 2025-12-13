"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, Loader2, AlertCircle, Plus, Sparkles, LayoutTemplate } from "lucide-react"
import { useSectionTemplates } from "@/hooks/useSectionTemplates"
import TemplateCard from "./template-card"
import TemplatePreview from "./template-preview"
import { cn } from "@/lib/utils"

interface SectionTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (templateId: string) => Promise<void>
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Templates",
  personal: "Personal",
  business: "Business",
  education: "Education",
  payment: "Payment",
  other: "Other",
}

export default function SectionTemplateDialog({ open, onOpenChange, onSelectTemplate }: SectionTemplateDialogProps) {
  const { templates, categories, isLoading, error, searchTemplates, filterByCategory } = useSectionTemplates()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const selectedTemplate =
    selectedTemplateId === "blank"
      ? { id: "blank", name: "Blank Section", fields: [] }
      : templates.find((t) => t.id === selectedTemplateId)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      searchTemplates(query)
      setSelectedCategory("all")
      setSelectedTemplateId(null)
    } else {
      filterByCategory(selectedCategory === "all" ? null : selectedCategory)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterByCategory(category === "all" ? null : category)
    setSearchQuery("")
    setSelectedTemplateId(null)
  }

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplateId(templateId)
  }

  const handleUseTemplate = async () => {
    if (!selectedTemplateId) return

    setIsCreating(true)
    try {
      await onSelectTemplate(selectedTemplateId)
      onOpenChange(false)
      setSelectedTemplateId(null)
      setSearchQuery("")
      setSelectedCategory("all")
    } catch (error) {
      console.error("Failed to create section from template:", error)
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setSelectedTemplateId(null)
      setSearchQuery("")
      setSelectedCategory("all")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden bg-background",
          "w-full h-dvh max-w-full max-h-full rounded-none border-0",
          "sm:w-[92vw] sm:h-[88vh] sm:max-h-[700px] sm:max-w-2xl sm:rounded-2xl sm:border",
          "lg:max-w-5xl lg:max-h-[800px]",
          "xl:max-w-6xl",
        )}
      >
        {/* Header */}
        <div className="shrink-0 border-b bg-background">
          {/* Title Row */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <LayoutTemplate className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-heading font-semibold leading-tight">
                  Add Section
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  Choose a template or start with a blank section
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-xl p-2.5 -mr-2 hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="px-4 pb-4 sm:px-6 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 h-11 text-sm bg-muted/40 border-transparent focus-visible:bg-background focus-visible:border-input focus-visible:ring-1 focus-visible:ring-ring rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
              {[{ category: "all", count: templates.length }, ...categories].map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryChange(cat.category)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                    selectedCategory === cat.category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {CATEGORY_LABELS[cat.category] || cat.category}
                  {cat.category !== "all" && (
                    <span
                      className={cn(
                        "ml-1.5 text-[10px] sm:text-xs font-normal",
                        selectedCategory === cat.category ? "opacity-80" : "opacity-60",
                      )}
                    >
                      ({cat.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Template Grid */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Loading templates...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Failed to load templates</p>
                    <p className="text-xs text-muted-foreground">{error}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Blank Template Card */}
                    <div
                      onClick={() => handleTemplateClick("blank")}
                      className={cn(
                        "group relative rounded-xl sm:rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 bg-background",
                        "p-4 sm:p-5 min-h-[100px] sm:min-h-[130px]",
                        "flex flex-col items-center justify-center text-center",
                        selectedTemplateId === "blank"
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/20",
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-xl mb-3 transition-colors",
                          selectedTemplateId === "blank"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                        )}
                      >
                        <Plus className="h-5 w-5" />
                      </div>
                      <h4 className="font-medium text-sm text-foreground">Blank Section</h4>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Start from scratch</p>
                    </div>

                    {/* Template Cards */}
                    {templates.length === 0 && !searchQuery ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-muted-foreground">No templates available</p>
                      </div>
                    ) : searchQuery && templates.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                          No templates found for &quot;{searchQuery}&quot;
                        </p>
                      </div>
                    ) : (
                      templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          id={template.id}
                          name={template.name}
                          description={template.description}
                          category={template.category}
                          icon={template.icon}
                          fieldCount={template.fields.length}
                          onSelect={handleTemplateClick}
                          isSelected={selectedTemplateId === template.id}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Panel - Desktop only */}
          <div className="hidden lg:flex w-[300px] xl:w-[360px] border-l bg-muted/20 flex-col">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-5">
                  {selectedTemplate ? (
                    selectedTemplateId === "blank" ? (
                      <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                        <div className="p-5 rounded-2xl bg-background border shadow-sm mb-5">
                          <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-base font-heading font-semibold text-foreground mb-2">Blank Section</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Start with an empty section and add your own custom fields.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                        <TemplatePreview
                          templateName={selectedTemplate.name}
                          fields={selectedTemplate.fields}
                          className="border-0"
                        />
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                      <div className="p-5 rounded-2xl bg-background border shadow-sm mb-5">
                        <LayoutTemplate className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-sm font-medium text-foreground mb-1">Select a Template</h3>
                      <p className="text-xs text-muted-foreground">Click on a template to preview its fields</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Desktop Action Button */}
            <div className="shrink-0 p-4 border-t bg-background">
              <Button
                onClick={handleUseTemplate}
                disabled={!selectedTemplateId || isCreating}
                className="w-full h-11 text-sm rounded-xl"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : selectedTemplateId === "blank" ? (
                  "Create Blank Section"
                ) : selectedTemplateId ? (
                  "Use This Template"
                ) : (
                  "Select a Template"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Bottom Action Bar */}
        <div className="lg:hidden shrink-0 border-t bg-background px-4 py-4 sm:px-6">
          {selectedTemplateId ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedTemplate?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTemplateId === "blank" ? "Empty section" : `${selectedTemplate?.fields.length} fields`}
                </p>
              </div>
              <Button onClick={handleUseTemplate} disabled={isCreating} className="shrink-0 h-10 rounded-xl">
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Use Template"
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-1">Select a template to continue</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}