"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Copy,
  Check,
  QrCode,
  Code2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Link,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import QRCode from "qrcode"

interface ShareFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formSlug: string
  formName: string
}

type ShareTab = "link" | "qrcode" | "embed" | "social"

const tabs: { id: ShareTab; label: string; icon: React.ElementType }[] = [
  { id: "link", label: "Link", icon: Link },
  { id: "qrcode", label: "QR Code", icon: QrCode },
  { id: "embed", label: "Embed", icon: Code2 },
  { id: "social", label: "Social", icon: MessageCircle },
]

const socialPlatforms = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600", fullWidth: false },
  { id: "twitter", label: "Twitter", icon: Twitter, color: "text-sky-500", fullWidth: false },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700", fullWidth: false },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-500", fullWidth: false },
  { id: "email", label: "Email", icon: Mail, color: "text-muted-foreground", fullWidth: true },
] as const

export default function ShareFormDialog({ open, onOpenChange, formSlug, formName }: ShareFormDialogProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>("link")
  const [copied, setCopied] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const formUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/forms/${formSlug}`
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0" title="${formName}"></iframe>`

  // Generate QR code
  useEffect(() => {
    if (activeTab === "qrcode" && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        formUrl,
        {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error)
        },
      )

      QRCode.toDataURL(formUrl, { width: 512 }, (err, url) => {
        if (!err) setQrCodeUrl(url)
      })
    }
  }, [activeTab, formUrl])

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `${formSlug}-qrcode.png`
      link.click()
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(formUrl)
    const encodedText = encodeURIComponent(`Check out this form: ${formName}`)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl rounded-2xl border-border/60 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg sm:text-xl">Share Form</DialogTitle>
              <DialogDescription className="font-body text-sm text-muted-foreground">
                Share &quot;{formName}&quot; with your audience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/50 px-5 sm:px-6 mt-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap rounded-t-lg",
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6">
          {/* Direct Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-url" className="text-sm font-medium flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  Form URL
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="form-url"
                      value={formUrl}
                      readOnly
                      className="font-mono text-sm pr-10 bg-muted/30 border-border/60 rounded-xl h-11"
                    />
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleCopy(formUrl, "link")}
                          variant="outline"
                          size="icon"
                          className={cn(
                            "shrink-0 rounded-xl h-11 w-11 transition-all",
                            copied === "link" && "bg-success/10 border-success/30 text-success",
                          )}
                        >
                          {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied === "link" ? "Copied!" : "Copy link"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Quick share info */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-primary/10">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Link className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Direct Link</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Share this link to let people access your form directly from any device or browser.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === "qrcode" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center">
                <div className="p-5 bg-white rounded-2xl border border-border/60 shadow-sm">
                  <canvas ref={qrCanvasRef} className="rounded-lg" />
                </div>
                <div className="mt-5 flex gap-3">
                  <Button onClick={handleDownloadQR} variant="outline" className="rounded-xl h-10 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={() => handleCopy(formUrl, "qr")}
                    variant="outline"
                    className={cn(
                      "rounded-xl h-10 transition-all",
                      copied === "qr" && "bg-success/10 border-success/30 text-success",
                    )}
                  >
                    {copied === "qr" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied === "qr" ? "Copied!" : "Copy URL"}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-primary/10">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <QrCode className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Scan with any mobile device camera to instantly access the form.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === "embed" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="embed-code" className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  Embed Code
                </Label>
                <div className="flex gap-2">
                  <textarea
                    id="embed-code"
                    value={embedCode}
                    readOnly
                    rows={3}
                    className="flex w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleCopy(embedCode, "embed")}
                          variant="outline"
                          size="icon"
                          className={cn(
                            "shrink-0 rounded-xl h-11 w-11 transition-all self-start",
                            copied === "embed" && "bg-success/10 border-success/30 text-success",
                          )}
                        >
                          {copied === "embed" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied === "embed" ? "Copied!" : "Copy code"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
                  <div className="aspect-video bg-background border border-dashed border-border/60 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                        <Code2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Form will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Share on Social Media</Label>
                <div className="grid grid-cols-2 gap-3">
                  {socialPlatforms.map((platform) => (
                    <Button
                      key={platform.id}
                      onClick={() => handleSocialShare(platform.id)}
                      variant="outline"
                      className={cn(
                        "justify-start gap-3 rounded-xl h-12 hover:bg-muted/50 transition-all",
                        platform.fullWidth && "col-span-2",
                      )}
                    >
                      <platform.icon className={cn("h-5 w-5", platform.color)} />
                      <span className="text-sm font-medium">{platform.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/50 border border-primary/10">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Social Sharing</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reach your audience where they already spend their time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}