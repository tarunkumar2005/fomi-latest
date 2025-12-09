"use client"

import { useState, useRef, useEffect } from "react"
import { ImageIcon, FileText, Clock, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CldUploadWidget } from "next-cloudinary"
import Image from "next/image"

interface FormHeaderProps {
  formTitle: string
  formDescription?: string
  estimatedTime?: string
  questionCount?: number
  headerImageUrl?: string | null
  onSaveHeader?: (title: string, description: string, headerImageUrl?: string) => void
}

export default function FormHeader({
  formTitle,
  formDescription,
  estimatedTime = "~3 min",
  questionCount = 8,
  headerImageUrl,
  onSaveHeader,
}: FormHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editTitle, setEditTitle] = useState(formTitle)
  const [editDescription, setEditDescription] = useState(formDescription || "")
  const [isImageHovered, setIsImageHovered] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // Sync with prop changes
  useEffect(() => {
    setEditTitle(formTitle)
  }, [formTitle])

  useEffect(() => {
    setEditDescription(formDescription || "")
  }, [formDescription])

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [isEditingTitle])

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus()
      descriptionRef.current.select()
    }
  }, [isEditingDescription])

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (editTitle !== formTitle) {
      onSaveHeader?.(editTitle, editDescription, headerImageUrl || undefined)
    }
  }

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false)
    if (editDescription !== formDescription) {
      onSaveHeader?.(editTitle, editDescription, headerImageUrl || undefined)
    }
  }

  const handleImageUploadSuccess = (result: any) => {
    if (typeof result.info === "object" && "secure_url" in result.info) {
      onSaveHeader?.(editTitle, editDescription, result.info.secure_url)
    }
  }

  return (
    <div className="w-full bg-card rounded-xl sm:rounded-2xl border-2 border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign-cloudinary"
        onSuccess={handleImageUploadSuccess}
        options={{
          sources: ["local", "url", "camera", "unsplash"],
          multiple: false,
          maxFiles: 1,
          resourceType: "image",
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        }}
      >
        {({ open }) => {
          return (
            <div
              className="relative h-40 sm:h-56 lg:h-64 bg-linear-to-br from-muted/80 to-muted overflow-hidden group cursor-pointer"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
              onClick={() => open?.()}
            >
              {headerImageUrl ? (
                <Image
                  src={headerImageUrl || "/placeholder.svg"}
                  alt="Form header"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/5 via-muted to-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary/60" />
                    </div>
                    <p className="text-sm text-muted-foreground">Click to add a header image</p>
                  </div>
                </div>
              )}

              <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                  isImageHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/95 hover:bg-white text-foreground shadow-lg rounded-xl px-4 py-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    open?.()
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {headerImageUrl ? "Change Image" : "Add Image"}
                </Button>
              </div>
            </div>
          )
        }}
      </CldUploadWidget>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Title - Editable on Click */}
        <div className="mb-3 sm:mb-4">
          {isEditingTitle ? (
            <Input
              ref={titleRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleBlur()
                }
                if (e.key === "Escape") {
                  setEditTitle(formTitle)
                  setIsEditingTitle(false)
                }
              }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold h-auto py-2 border-2 border-primary font-heading rounded-lg"
              placeholder="Enter form title"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight cursor-text hover:text-primary/80 transition-colors text-balance"
            >
              {formTitle || "Click to add title"}
            </h1>
          )}
        </div>

        {/* Description - Editable on Click */}
        <div className="mb-6 sm:mb-8">
          {isEditingDescription ? (
            <Textarea
              ref={descriptionRef}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditDescription(formDescription || "")
                  setIsEditingDescription(false)
                }
              }}
              rows={3}
              className="text-sm sm:text-base resize-none border-2 border-primary font-body rounded-lg"
              placeholder="Enter form description (optional)"
            />
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl cursor-text hover:text-foreground transition-colors"
            >
              {formDescription || "Click to add description (optional)"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 pt-2 flex-wrap">
          {/* Estimated Time */}
          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-xl px-3 py-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-body font-medium text-foreground text-sm">{estimatedTime}</span>
          </div>

          {/* Question Count */}
          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-xl px-3 py-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="font-body font-medium text-foreground text-sm">
              {questionCount} question{questionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}