import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import ConditionalFooter from "@/components/shared/ConditionalFooter";
import PostHogPageView from "@/components/shared/PostHogPageView";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fomi - Modern Form Builder",
    template: "%s | Fomi",
  },
  description:
    "Create beautiful, intelligent forms with AI-powered enhancements. Build surveys, registrations, and feedback forms with ease.",
  keywords: [
    "form builder",
    "survey creator",
    "form maker",
    "AI forms",
    "online forms",
  ],
  authors: [{ name: "Fomi Team" }],
  creator: "Fomi",
  publisher: "Fomi",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fomi",
    title: "Fomi - Modern Form Builder",
    description:
      "Create beautiful, intelligent forms with AI-powered enhancements.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fomi - Modern Form Builder",
    description:
      "Create beautiful, intelligent forms with AI-powered enhancements.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </head>
      <body className={`antialiased`}>
        <Providers>
          <PostHogPageView />
          {children}
          <Toaster />
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
