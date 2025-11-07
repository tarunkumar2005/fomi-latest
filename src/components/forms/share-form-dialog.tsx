"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

interface ShareFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formSlug: string;
  formName: string;
}

type ShareTab = "link" | "qrcode" | "embed" | "social";

export default function ShareFormDialog({
  open,
  onOpenChange,
  formSlug,
  formName,
}: ShareFormDialogProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>("link");
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate form URL
  const formUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/forms/${formSlug}`;

  // Generate embed code
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  // Generate QR code
  useEffect(() => {
    if (activeTab === "qrcode" && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        formUrl,
        {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );

      // Also generate data URL for download
      QRCode.toDataURL(formUrl, { width: 512 }, (err, url) => {
        if (!err) setQrCodeUrl(url);
      });
    }
  }, [activeTab, formUrl]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = `${formSlug}-qrcode.png`;
      link.click();
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(formUrl);
    const encodedText = encodeURIComponent(`Check out this form: ${formName}`);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const tabs = [
    { id: "link" as ShareTab, label: "Direct Link", icon: Copy },
    { id: "qrcode" as ShareTab, label: "QR Code", icon: QrCode },
    { id: "embed" as ShareTab, label: "Embed", icon: Code2 },
    { id: "social" as ShareTab, label: "Social", icon: MessageCircle },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Share Form</DialogTitle>
          <DialogDescription className="font-body">
            Share "{formName}" with your audience
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 font-body text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {/* Direct Link Tab */}
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="form-url"
                  className="font-body text-sm font-medium"
                >
                  Form URL
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="form-url"
                    value={formUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleCopy(formUrl, "link")}
                    variant="outline"
                    size="icon"
                  >
                    {copied === "link" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
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
                <canvas
                  ref={qrCanvasRef}
                  className="border border-border rounded-lg"
                />
                <div className="mt-4 space-x-2">
                  <Button onClick={handleDownloadQR} variant="outline">
                    Download QR Code
                  </Button>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-4 text-center max-w-md">
                  Scan this QR code with a mobile device to access the form
                  instantly
                </p>
              </div>
            </div>
          )}

          {/* Embed Tab */}
          {activeTab === "embed" && (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="embed-code"
                  className="font-body text-sm font-medium"
                >
                  Embed Code
                </Label>
                <div className="flex gap-2 mt-2">
                  <textarea
                    id="embed-code"
                    value={embedCode}
                    readOnly
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none"
                  />
                  <Button
                    onClick={() => handleCopy(embedCode, "embed")}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    {copied === "embed" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Copy this code and paste it into your website's HTML
                </p>
              </div>

              {/* Preview */}
              <div>
                <Label className="font-body text-sm font-medium">Preview</Label>
                <div className="mt-2 border border-border rounded-lg p-4 bg-muted/20">
                  <div className="aspect-video bg-background border border-border rounded flex items-center justify-center">
                    <p className="font-body text-sm text-muted-foreground">
                      Form will appear here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === "social" && (
            <div className="space-y-4">
              <div>
                <Label className="font-body text-sm font-medium mb-3 block">
                  Share on Social Media
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSocialShare("facebook")}
                    variant="outline"
                    className="justify-start gap-3"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="font-body">Facebook</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("twitter")}
                    variant="outline"
                    className="justify-start gap-3"
                  >
                    <Twitter className="h-5 w-5 text-sky-500" />
                    <span className="font-body">Twitter</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("linkedin")}
                    variant="outline"
                    className="justify-start gap-3"
                  >
                    <Linkedin className="h-5 w-5 text-blue-700" />
                    <span className="font-body">LinkedIn</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("whatsapp")}
                    variant="outline"
                    className="justify-start gap-3"
                  >
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span className="font-body">WhatsApp</span>
                  </Button>
                  <Button
                    onClick={() => handleSocialShare("email")}
                    variant="outline"
                    className="justify-start gap-3 col-span-2"
                  >
                    <Mail className="h-5 w-5 text-gray-600" />
                    <span className="font-body">Email</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
