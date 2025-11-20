"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdvancedPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  showFooter?: boolean;
  footerButtonText?: string;
  onFooterButtonClick?: () => void;
}

export default function AdvancedPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  showFooter = true,
  footerButtonText = "Done",
  onFooterButtonClick,
}: AdvancedPanelProps) {
  const handleFooterClick = () => {
    if (onFooterButtonClick) {
      onFooterButtonClick();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Advanced Panel - Slide from Right */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full md:w-[420px] bg-background border-l border-border shadow-2xl z-50
          animate-in slide-in-from-right duration-300
        `}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9"
              aria-label="Close advanced settings"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Panel Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {children}
          </div>

          {/* Panel Footer */}
          {showFooter && (
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <Button onClick={handleFooterClick} className="w-full" size="lg">
                {footerButtonText}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile only */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
      />
    </>
  );
}
