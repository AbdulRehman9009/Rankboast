"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-rose-500 blur-[100px] opacity-10 -z-10 animate-pulse" />
        <div className="h-32 w-32 bg-card border-2 border-rose-500/30 rounded-full flex items-center justify-center shadow-2xl relative group overflow-hidden">
          <ShieldAlert className="h-16 w-16 text-rose-500 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/20 animate-scan" />
        </div>
        <AlertTriangle className="absolute -bottom-2 -right-2 h-10 w-10 text-amber-500 animate-bounce" />
      </div>

      <div className="space-y-4 max-w-lg mb-10">
        <h2 className="text-3xl font-bold tracking-tight">System Anomaly Detected</h2>
        <p className="text-muted-foreground leading-relaxed">
          We encountered an unexpected error while processing your request. 
          Our engineers have been notified and are investigating the connection.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          onClick={() => reset()}
          className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20"
        >
          <RefreshCcw className="mr-2 h-5 w-5" />
          Attempt Recovery
        </Button>
        <Link href="/">
          <Button size="lg" variant="outline" className="h-14 px-8 border-border text-muted-foreground hover:bg-muted/10">
            <Home className="mr-2 h-5 w-5" />
            Return to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mt-20 flex items-center gap-6 grayscale opacity-30 select-none">
        <div className="h-px w-12 bg-border" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Graceful Degradation</span>
        <div className="h-px w-12 bg-border" />
      </div>
    </div>
  );
}
