"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Palette } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AIEnhanceIcon from "@/assets/icon/ai-enhance.png";

interface SidebarToggleProps {
  side: "left" | "right";
  isOpen: boolean;
  onToggle: () => void;
  icon: "palette" | "sparkles";
  label: string;
}

export default function SidebarToggle({
  side,
  isOpen,
  onToggle,
  icon,
  label,
}: SidebarToggleProps) {
  const ChevronIcon =
    side === "left"
      ? isOpen
        ? ChevronLeft
        : ChevronRight
      : isOpen
      ? ChevronRight
      : ChevronLeft;
  const renderIcon = () => {
    if (icon === "palette") {
      return (
        <Palette className="h-4.5 w-4.5 text-primary relative group-hover:scale-110 transition-transform duration-200" />
      );
    }
    return (
      <Image
        src={AIEnhanceIcon}
        alt="AI"
        className="h-4.5 w-4.5 relative group-hover:scale-110 transition-transform duration-200"
        width={18}
        height={18}
      />
    );
  };

  // Desktop toggle button
  const desktopButton = (
    <button
      onClick={onToggle}
      className={cn(
        "hidden md:flex fixed top-1/2 -translate-y-1/2 z-30 flex-col items-center justify-center gap-1.5",
        "w-11 h-20 rounded-xl shadow-lg border border-border/50",
        "bg-card/95 backdrop-blur-sm",
        "hover:bg-card hover:border-primary/30 hover:shadow-xl hover:w-12",
        "transition-all duration-200 ease-out group",
        // Position based on side and state
        side === "left" &&
          (isOpen
            ? "left-80 lg:left-[380px] rounded-l-none"
            : "left-0 rounded-l-none"),
        side === "right" &&
          (isOpen
            ? "right-80 lg:right-[380px] rounded-r-none"
            : "right-0 rounded-r-none")
      )}
      aria-label={isOpen ? `Close ${label}` : `Open ${label}`}
    >
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        />
        {renderIcon()}
      </div>
      <ChevronIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );

  // Mobile floating action button
  const mobileButton = (
    <button
      onClick={onToggle}
      className={cn(
        "md:hidden fixed bottom-20 z-30",
        "w-12 h-12 rounded-xl shadow-lg border border-border/50",
        "flex items-center justify-center",
        "hover:scale-105 active:scale-95 transition-all duration-200",
        side === "left" && "left-4 bg-card text-primary",
        side === "right" && "right-4 bg-primary text-primary-foreground"
      )}
      aria-label={`Toggle ${label}`}
    >
      {icon === "palette" ? (
        <Palette className="h-5 w-5" />
      ) : (
        <Image
          src={AIEnhanceIcon}
          alt="AI"
          className="h-5 w-5"
          width={20}
          height={20}
        />
      )}
    </button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{desktopButton}</TooltipTrigger>
        <TooltipContent side={side === "left" ? "right" : "left"}>
          <p>{isOpen ? `Close ${label}` : `Open ${label}`}</p>
        </TooltipContent>
      </Tooltip>
      {mobileButton}
    </TooltipProvider>
  );
}
