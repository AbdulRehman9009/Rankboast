"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle, CheckCircle2, FileText, XCircle } from "lucide-react";

interface AuditInsight {
  type: "error" | "warning" | "success";
  title: string;
  description: string;
}

interface AuditData {
  seoScore: number;
  readability: string;
  loadTimeEst: string;
  insights: AuditInsight[];
  structure: {
    titleLength: string;
    h2Count: number;
    h3Count: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
  };
}

export default function AuditPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsAuditing(true);
    setAuditComplete(false);
    setErrorMsg("");
    setAuditData(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, keyword })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to audit URL");
      }

      setAuditData(resData.data);
      setAuditComplete(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong during the audit.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Content Audit</h1>
          <p className="text-muted-foreground">
            Analyze your webpage content to discover SEO gaps, structure issues, and optimization opportunities using our AI core.
          </p>
        </div>

        {/* Audit Form Container */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleAudit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="url" className="text-sm font-medium text-foreground">Target URL</label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/blog-post"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                required
                className="h-11 bg-background"
                disabled={isAuditing}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="keyword" className="text-sm font-medium text-foreground">Target Keyword (Optional)</label>
              <Input
                id="keyword"
                type="text"
                placeholder="e.g. 'best AI tools'"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-11 bg-background"
                disabled={isAuditing}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isAuditing || !targetUrl}
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Run AI Audit
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Error message block */}
        {errorMsg && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3 text-destructive animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Loading State Overlay / Skeleton */}
        {isAuditing && (
          <div className="rounded-2xl border border-border bg-card p-12 shadow-sm flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin"></div>
              <Search className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">AI is scraping and analyzing your content...</h3>
            <p className="text-muted-foreground max-w-sm">
              Our Gemini AI agent is reading the page, extracting headers, comparing keyword density, and finding actionable SEO solutions.
            </p>
            <div className="w-full max-w-md h-2 bg-muted rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/2 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}

        {/* Results Dashboard (Real Results) */}
        {auditComplete && auditData && !isAuditing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">Overall SEO Score</span>
                <div className="flex items-end gap-2">
                  <span className={`text-4xl font-bold ${auditData.seoScore > 75 ? 'text-emerald-500' : auditData.seoScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                    {auditData.seoScore}
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">/ 100</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">Readability</span>
                <div className="flex items-end gap-2 text-indigo-500">
                  <span className="text-2xl font-bold">{auditData.readability}</span>
                  <CheckCircle2 className="h-6 w-6 mb-1" />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">Load Time (Est)</span>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-amber-500">{auditData.loadTimeEst}</span>
                </div>
              </div>
            </div>

            {/* Detailed Analysis Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Errors & Warnings */}
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Actionable AI Insights
                  </h3>
                </div>
                <div className="divide-y divide-border flex-1">
                  {auditData.insights && auditData.insights.length > 0 ? (
                    auditData.insights.map((insight, idx) => {
                      let icon = <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />;

                      if (insight.type === "error") {
                        icon = <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />;
                      } else if (insight.type === "warning") {
                        icon = <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />;
                      }

                      return (
                        <div key={idx} className="p-5 flex items-start gap-4 hover:bg-muted/10 transition-colors">
                          {icon}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">No insights found. Your page looks great!</div>
                  )}
                </div>
              </div>

              {/* Page Structure */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[fit-content]">
                <div className="p-5 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Scraped DOM Structure
                  </h3>
                </div>
                <div className="p-5 flex-1">
                  <ul className="space-y-4 text-sm">
                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Title Tags</span>
                      <span className="font-medium text-foreground text-right">{auditData.structure.titleLength}</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">{"<H2>"} Headers</span>
                      <span className={`font-medium ${auditData.structure.h2Count > 0 ? 'text-foreground' : 'text-red-500'}`}>{auditData.structure.h2Count} found</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">{"<H3>"} Headers</span>
                      <span className="font-medium text-foreground">{auditData.structure.h3Count} found</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Images w/o Alt</span>
                      <span className={`font-medium ${auditData.structure.imagesMissingAlt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{auditData.structure.imagesMissingAlt}</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Internal Links</span>
                      <span className="font-medium text-foreground">{auditData.structure.internalLinks}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">External Links</span>
                      <span className="font-medium text-foreground">{auditData.structure.externalLinks}</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
