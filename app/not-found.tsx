"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft, Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-20 -z-10 animate-pulse" />
        <div className="h-32 w-32 bg-card border-2 border-indigo-500/30 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden group">
          <Compass className="h-16 w-16 text-indigo-500 group-hover:rotate-180 transition-transform duration-1000" />
          <div className="absolute inset-0 border-t-2 border-indigo-400/20 animate-spin-slow" />
        </div>
        <div className="absolute -top-4 -right-4 h-12 w-12 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center border border-rose-500/20 rotate-12">
          <Search className="h-6 w-6" />
        </div>
      </div>

      <div className="space-y-4 max-w-lg mb-10">
        <h1 className="text-6xl font-black tracking-tighter text-indigo-500">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground leading-relaxed">
          It looks like the link you're looking for has been moved or archived. 
          Our SEO robots couldn't crawl this specific path.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
        <Link href="/audit">
          <Button size="lg" variant="outline" className="h-14 px-8 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/5">
            <Globe className="mr-2 h-5 w-5" />
            Audit a URL
          </Button>
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-40">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-widest">Protocol</span>
          <span className="text-[10px] font-mono">HTTP/2</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-widest">Status</span>
          <span className="text-[10px] font-mono">Orphaned</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-widest">Crawl</span>
          <span className="text-[10px] font-mono">Denied</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-widest">Search</span>
          <span className="text-[10px] font-mono">NoIndex</span>
        </div>
      </div>
    </div>
  );
}
