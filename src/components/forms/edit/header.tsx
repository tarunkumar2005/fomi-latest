"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { useSession, signOut } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

interface FormEditHeaderProps {
  formName: string;
  formSlug: string;
  isSaved: boolean;
  isPublished: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onShare?: () => void;
  isSaving?: boolean;
}

export default function FormEditHeader({
  formName,
  formSlug,
  isSaved,
  isPublished,
  onSave,
  onPublish,
  onPreview,
  onShare,
  isSaving = false,
}: FormEditHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate form
    console.log("Duplicate form");
  };

  const handleDelete = () => {
    // TODO: Implement delete form with confirmation
    console.log("Delete form");
  };

  const handleSettings = () => {
    // TODO: Navigate to form settings
    console.log("Form settings");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Back Button & Form Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-9 px-2 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span className="font-body text-sm font-medium hidden sm:inline">
                Back
              </span>
            </Button>

            <div className="h-6 w-px bg-border hidden sm:block" />

            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-heading text-base sm:text-lg font-semibold text-foreground truncate">
                {formName}
              </h1>

              {/* Saved Indicator */}
              {isSaved && !isSaving && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-body text-xs font-medium text-green-700 dark:text-green-400 hidden sm:inline">
                    Saved
                  </span>
                </div>
              )}

              {/* Saving Indicator */}
              {isSaving && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="font-body text-xs font-medium text-yellow-700 dark:text-yellow-400 hidden sm:inline">
                    Saving...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving || isSaved}
              className="h-9 px-3 sm:px-4 font-body text-sm font-medium hidden sm:flex"
            >
              <Save className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            {/* Publish Button */}
            <Button
              size="sm"
              onClick={onPublish}
              className={cn(
                "h-9 px-3 sm:px-4 font-body text-sm font-semibold",
                isPublished
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {isPublished ? "Published" : "Publish"}
            </Button>

            {/* More Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleSettings}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm font-medium">
                    Form Settings
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  <span className="font-body text-sm font-medium">
                    Duplicate Form
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="font-body text-sm font-medium">
                    Delete Form
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Preview Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              className="h-9 px-3 sm:px-4 font-body text-sm font-medium border border-border hover:bg-muted"
            >
              <Eye className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="h-9 px-3 sm:px-4 font-body text-sm font-medium border border-border hover:bg-muted"
            >
              <Share2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            {/* User Dropdown */}
            {session?.data?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-lg cursor-pointer transition-colors outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.data.user.image ?? undefined}
                        alt={session.data.user.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold font-heading">
                        {session.data.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* User Info */}
                  <div className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={session.data.user.image ?? undefined}
                          alt={session.data.user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold font-heading text-base">
                          {session.data.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-body text-sm font-semibold text-foreground">
                          {session.data.user.name}
                        </span>
                        <span className="font-body text-xs text-muted-foreground truncate max-w-40">
                          {session.data.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Menu Items */}
                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push("/dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-body text-sm font-medium">
                      Dashboard
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-body text-sm font-medium">
                      Profile Settings
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push("/billing")}
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-body text-sm font-medium">
                      Billing
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="font-body text-sm font-medium">
                      Settings
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    className="flex items-center gap-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={async () => {
                      await signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-body text-sm font-medium">
                      Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
