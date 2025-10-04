import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/fomi.png";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";

const footerLinks = [
  { name: "Features", href: "#features" },
  { name: "Demo", href: "#demo" },
  { name: "Templates", href: "#templates" },
  { name: "Pricing", href: "/pricing" },
];

const legalLinks = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" }
];

const socialLinks = [
  { name: "X", icon: Twitter, href: "https://x.com/tarunkumarcode" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/tarunkumar8278" },
  { name: "GitHub", icon: Github, href: "https://github.com/tarunkumar2005" },
  { name: "Email", icon: Mail, href: "mailto:tarunkumar6258278@gmail.com" }
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-background border-t border-border/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Image src={logo} alt="Fomi Logo" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Fomi
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  aria-label={social.name}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fomi. All rights reserved.
          </p>

          {/* Legal Links */}
          <div className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}