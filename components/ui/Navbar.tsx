"use client"

import { motion } from "framer-motion" // Note: standard import for Framer Motion
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/Themetoggle"
import { LayoutDashboard, Globe, FileText, Zap } from "lucide-react"

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}

      className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md sm:px-12"
    >
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-glow transition-transform group-hover:rotate-12">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        <div className="text-xl font-extrabold tracking-tight">
          Rank <span className="text-brand">Boost</span>
          <span className="ml-1 hidden text-[10px] font-medium tracking-widest text-muted-foreground uppercase sm:inline">AI</span>
        </div>
      </Link>

      <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
        <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
        <Link href="/competitors" className="hover:text-brand transition-colors">Competitor Gap</Link>
        <Link href="/audit" className="hover:text-brand transition-colors">Content Audit</Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          Login
        </Button>
        <Button variant="default" size="sm" className="rounded-full px-5">
          Sign Up
        </Button>
      </div>
    </motion.nav>
  )
}

export default Navbar