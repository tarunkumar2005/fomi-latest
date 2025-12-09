"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import QRCode from "qrcode"
import { useEffect, useRef } from "react"

interface ShareFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formSlug: string
  formName: string
}

type ShareTab = "link" | "qrcode" | "embed" | "social"

export default function ShareFormDialog({ open, onOpenChange, formSlug, formName }: ShareFormDialogProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>("link")
  const [copied, setCopied] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  // Generate form URL
  const formUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/forms/${formSlug}`

  // Generate embed code
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`

  // Generate QR code
  useEffect(() => {
    if (activeTab === "qrcode" && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        formUrl,
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
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

  const tabs = [
    { id: "link" as ShareTab, label: "Link", icon: Link },
    { id: "qrcode" as ShareTab, label: "QR Code", icon: QrCode },
    { id: "embed" as ShareTab, label: "Embed", icon: Code2 },
    { id: "social" as ShareTab, label: "Social", icon: MessageCircle },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl rounded-2xl border-border/60 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-0">
          <DialogTitle className="font-heading text-lg sm:text-xl">Share Form</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Share &quot;{formName}&quot; with your audience
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-1 border-b border-border/50 px-4 sm:px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-body text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Direct Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="form-url" className="font-body text-sm font-medium mb-2 block">
                  Form URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="form-url"
                    value={formUrl}
                    readOnly
                    className="font-mono text-xs sm:text-sm rounded-lg flex-1"
                  />
                  <Button
                    onClick={() => handleCopy(formUrl, "link")}
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-lg"
                  >
                    {copied === "link" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Share this link to let people access your form directly
                </p>
              </div>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === "qrcode" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl border border-border/60 shadow-sm">
                  <canvas ref={qrCanvasRef} className="rounded-lg" />
                </div>
                <div className="mt-4">
                  <Button onClick={handleDownloadQR} variant="outline" className="rounded-lg bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-4 text-center max-w-md">
                  Scan this QR code with a mobile device to access the form instantly
                </p>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === "embed" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="embed-code" className="font-body text-sm font-medium mb-2 block">
                  Embed Code
                </Label>
                <div className="flex gap-2">
                  <textarea
                    id="embed-code"
                    value={embedCode}
                    readOnly
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs sm:text-sm font-mono resize-none"
                  />
                  <Button
                    onClick={() => handleCopy(embedCode, "embed")}
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-lg"
                  >
                    {copied === "embed" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Copy this code and paste it into your website&apos;s HTML
                </p>
              </div>

              {/* Preview */}
              <div>
                <Label className="font-body text-sm font-medium mb-2 block">Preview</Label>
                <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
                  <div className="aspect-video bg-background border border-border/60 rounded-lg flex items-center justify-center">
                    <p className="font-body text-sm text-muted-foreground">Form will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <div>
                <Label className="font-body text-sm font-medium mb-3 block">Share on Social Media</Label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    onClick={() => handleSocialShare("facebook")}
                    variant="outline"
                    className="justify-start gap-2 sm:gap-3 rounded-lg h-11"
                  >
                    <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="font-body text-sm">Facebook</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("twitter")}
                    variant="outline"
                    className="justify-start gap-2 sm:gap-3 rounded-lg h-11"
                  >
                    <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-sky-500" />
                    <span className="font-body text-sm">Twitter</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("linkedin")}
                    variant="outline"
                    className="justify-start gap-2 sm:gap-3 rounded-lg h-11"
                  >
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
                    <span className="font-body text-sm">LinkedIn</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("whatsapp")}
                    variant="outline"
                    className="justify-start gap-2 sm:gap-3 rounded-lg h-11"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                    <span className="font-body text-sm">WhatsApp</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("email")}
                    variant="outline"
                    className="justify-start gap-2 sm:gap-3 col-span-2 rounded-lg h-11"
                  >
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <span className="font-body text-sm">Email</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}