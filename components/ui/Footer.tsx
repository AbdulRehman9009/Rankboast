"use client";

import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { status } = useSession();
  const pathname = usePathname();

  const isProtectedRoute = ["/dashboard", "/visualizer", "/profile", "/audit", "/competitors", "/analytics", "/contentgenerator"]
    .some(p => pathname?.startsWith(p));

  if (isProtectedRoute) return null;

  const sections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "SEO Audit", href: status === "authenticated" ? "/audit" : "/auth/signup" },
        { name: "Competitor Analysis", href: status === "authenticated" ? "/competitors" : "/auth/signup" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-border bg-card py-12 px-6 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 md:gap-12">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 transition-transform group-hover:rotate-12">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Rank<span className="text-indigo-400">Boast</span>
                <span className="ml-1 text-[9px] font-medium tracking-widest text-muted-foreground uppercase">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              AI-powered SEO platform for audits, competitor analysis, and content generation.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-indigo-400 transition-colors"><Github className="h-4 w-4" /></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-indigo-400 transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-indigo-400 transition-colors"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          {sections.map(section => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-indigo-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">&copy; {currentYear} RankBoast AI. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;