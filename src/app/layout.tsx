import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import ConditionalFooter from "@/components/shared/ConditionalFooter";
import PostHogPageView from "@/components/shared/PostHogPageView";
import { Toaster } from "@/components/ui/sonner";
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
        {/* Google Fonts for theme support */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&display=swap"
          rel="stylesheet"
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
