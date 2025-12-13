"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  MoreVertical,
  Eye,
  Share2,
  Save,
  Settings,
  Copy,
  Trash2,
  LayoutDashboard,
  User,
  CreditCard,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Globe,
} from "lucide-react"
import { useSession, signOut } from "@/hooks/useSession"
import { cn } from "@/lib/utils"
import FormSettingsPopover from "./form-settings-popover"

interface FormSettings {
  closeDate?: Date | null
  responseLimit?: number | null
  oneResponsePerUser?: boolean
  thankYouMessage?: string | null
}

interface FormEditHeaderProps {
  formName: string
  isSaved: boolean
  isPublished: boolean
  onSave?: (data: any) => void
  onPublish?: () => void
  onPreview?: () => void
  onShare?: () => void
  isSaving?: boolean
  isPublishing?: boolean
  isDuplicating?: boolean
  isDeleting?: boolean
  onDuplicate?: () => void
  onDelete?: () => void
  formSettings?: FormSettings
  onSaveSettings?: (settings: FormSettings) => Promise<void>
}

export default function FormEditHeader({
  formName,
  isSaved,
  isPublished,
  onSave,
  onPublish,
  onPreview,
  onShare,
  isSaving = false,
  isPublishing = false,
  isDuplicating = false,
  isDeleting = false,
  onDuplicate,
  onDelete,
  formSettings,
  onSaveSettings,
}: FormEditHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handlePublishClick = () => {
    onPublish?.()
  }

  const handleShareClick = () => {
    if (!isPublished) return
    onShare?.()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

      <div className="relative max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-8 sm:h-9 px-2 sm:px-3 hover:bg-muted/80 rounded-xl transition-all group"
                  >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-medium text-sm hidden sm:inline ml-1.5">Back</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Back to Dashboard
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="h-5 sm:h-6 w-px bg-border/60 hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[300px] font-heading">
                {formName}
              </h1>

              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                {isSaved && !isSaving && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="text-[10px] sm:text-xs font-medium text-success hidden sm:inline">Saved</span>
                  </div>
                )}

                {isSaving && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20">
                    <Loader2 className="h-3 w-3 text-warning animate-spin" />
                    <span className="text-[10px] sm:text-xs font-medium text-warning hidden sm:inline">Saving...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Save Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving || isSaved}
                    className="h-8 sm:h-9 px-2.5 sm:px-4 text-xs sm:text-sm font-medium hidden md:flex border-border/60 hover:bg-muted/80 rounded-xl transition-all bg-transparent"
                  >
                    <Save className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden lg:inline">Save</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isSaved ? "All changes saved" : "Save changes"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Publish Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handlePublishClick}
                    disabled={isPublishing}
                    className={cn(
                      "h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all",
                      isPublished
                        ? "bg-success hover:bg-success/90 text-success-foreground shadow-success/25"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25",
                      "shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                    )}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        <span className="hidden sm:inline">Updating...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : isPublished ? (
                      <>
                        <Globe className="h-3.5 w-3.5 mr-1.5" />
                        <span className="hidden sm:inline">Published</span>
                        <span className="sm:hidden">Live</span>
                      </>
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isPublished ? (
                    <div className="text-center">
                      <p className="font-semibold">Form is live</p>
                      <p className="text-muted-foreground">Click to unpublish</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-semibold">Make form live</p>
                      <p className="text-muted-foreground">Share with respondents</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Form Settings Popover */}
            {formSettings && onSaveSettings && (
              <FormSettingsPopover
                settings={formSettings}
                onSave={onSaveSettings}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 sm:h-9 w-8 sm:w-9 p-0 hover:bg-muted/80 rounded-xl"
                    aria-label="Form settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                }
              />
            )}

            {/* Preview Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreview}
                    className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-medium border-border/60 hover:bg-muted/80 rounded-xl hidden sm:flex bg-transparent"
                    aria-label="Preview form"
                  >
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden lg:inline">Preview</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Preview form
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Share Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareClick}
                    disabled={!isPublished}
                    className={cn(
                      "h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-medium border-border/60 rounded-xl hidden sm:flex bg-transparent",
                      isPublished ? "hover:bg-muted/80" : "opacity-50 cursor-not-allowed",
                    )}
                    aria-label="Share form"
                  >
                    <Share2 className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden lg:inline">Share</span>
                  </Button>
                </TooltipTrigger>
                {!isPublished && (
                  <TooltipContent side="bottom" className="text-xs">
                    Publish form to share
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* More Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 sm:h-9 w-8 sm:w-9 p-0 hover:bg-muted/80 rounded-xl"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-border/50 p-1">
                {/* Mobile-only options */}
                <div className="sm:hidden">
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={onSave}
                  >
                    <Save className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Save</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={onPreview}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Preview</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={handleShareClick}
                    disabled={!isPublished}
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Share</span>
                    {!isPublished && <span className="text-xs text-muted-foreground ml-auto">(Publish first)</span>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                </div>

                <DropdownMenuItem
                  className="flex items-center gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                  onClick={onDuplicate}
                  disabled={isDuplicating || !session?.data?.user}
                >
                  {isDuplicating ? (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {isDuplicating
                      ? "Duplicating..."
                      : !session?.data?.user
                        ? "Sign in to duplicate"
                        : "Duplicate Form"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="flex items-center gap-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg mx-1 my-0.5 h-10"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span className="text-sm font-medium">{isDeleting ? "Deleting..." : "Delete Form"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            {session?.data?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 sm:py-1.5 hover:bg-muted/80 rounded-xl cursor-pointer transition-all outline-none ml-1 group"
                    aria-label="User menu"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-background shadow-sm group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                        {session.data.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-border/50 p-1">
                  {/* User Info */}
                  <div className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                        <AvatarImage src={session.data.user.image ?? undefined} alt={session.data.user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                          {session.data.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{session.data.user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{session.data.user.email}</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={() => router.push("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={() => router.push("/billing")}
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Billing</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer rounded-lg mx-1 my-0.5 h-10"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg mx-1 my-0.5 h-10"
                    onClick={async () => {
                      await signOut()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}