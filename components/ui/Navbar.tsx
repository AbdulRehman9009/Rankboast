"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/Themetoggle";
import { Zap, Menu, X, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const Navbar = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isProtectedRoute = ["/dashboard", "/profile", "/audit", "/competitors", "/contentgenerator", "/analytics"]
    .some(p => pathname?.startsWith(p));

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (isProtectedRoute) return null;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`sticky top-0 z-50 flex items-center justify-between gap-4 px-5 sm:px-10 py-3 transition-all duration-300 ${scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
          }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:rotate-12">
            <Zap className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Rank<span className="text-indigo-400">Boast</span>
            <span className="ml-1 hidden text-[9px] font-medium tracking-widest text-muted-foreground uppercase sm:inline">AI</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-foreground transition-colors ${pathname === link.href ? "text-foreground" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <div className="h-4 w-px bg-border hidden sm:block" />

          {status === "loading" ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded-full" />
          ) : session ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 hidden sm:flex">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 hidden sm:flex">
                  Get started
                </Button>
              </Link>
            </>
          )}

          {/* Hamburger */}
          <button
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sticky top-14 z-40 overflow-hidden border-b border-border bg-background/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col px-5 py-4 gap-2">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-border mt-2">
                {session ? (
                  <Link href="/dashboard">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button variant="outline" className="w-full rounded-full">Sign in</Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full">Get started free</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;