"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { status } = useSession();
  const pathname = usePathname();

  const isProtectedRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/audit') || pathname?.startsWith('/competitors');

  if (isProtectedRoute) {
    return null;
  }

  const sections = [
    {
      title: "Product",
      links: [
        { name: status === "authenticated" ? "Dashboard" : "Get Started", href: status === "authenticated" ? "/dashboard" : "/auth/signup" },
        { name: "Competitor Gap", href: "/competitors" },
        { name: "Content Audit", href: "/audit" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "API Reference", href: "#" },
        { name: "SEO Guide", href: "#" },
      ],
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="mt-20 border-t border-border bg-card py-12 px-6 sm:px-12 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">

          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-glow transition-transform group-hover:rotate-12">
                <Zap className="h-5 w-5 text-white fill-white" />
              </div>
              <div className="text-xl font-extrabold tracking-tight font-sans">
                Rank <span className="text-brand">Boost</span>
                <span className="ml-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">AI</span>
              </div>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Advanced SEO and content optimization platform built for the Department of Software Engineering.
            </p>
            <div className="flex gap-4">
              <Github className="h-4 w-4 text-muted-foreground hover:text-brand cursor-pointer transition-colors" />
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-brand cursor-pointer transition-colors" />
              <Linkedin className="h-4 w-4 text-muted-foreground hover:text-brand cursor-pointer transition-colors" />
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
          <div className="text-xs text-muted-foreground">
            &copy; {currentYear} RankBoost AI. Session 2022-2026.
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
            <span className="h-1 w-1 rounded-full bg-brand" />
            The Islamia University of Bahawalpur
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;