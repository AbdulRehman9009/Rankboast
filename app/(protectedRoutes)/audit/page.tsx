"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Loader2, AlertCircle, CheckCircle2,
  FileText, XCircle, History, Plus, Zap, Clock,
  TrendingUp, ArrowRight, Globe,
} from "lucide-react";
import Link from "next/link";

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

interface AuditRecord {
  id: string;
  url: string | null;
  title: string;
  seoScore: number;
  resultsJson: AuditData;
  createdAt: string;
}

export default function AuditPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [userSiteUrl, setUserSiteUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // ── Load profile and history on mount ───────────────────────────────────────
  useEffect(() => {
    async function initAudit() {
      try {
        // 1. Fetch profile to get siteUrl
        const profRes = await fetch("/api/profile");
        const profData = await profRes.json();
        const savedUrl = profData?.user?.siteUrl;
        setUserSiteUrl(savedUrl || null);

        // 2. Fetch history
        const auditRes = await fetch("/api/audit");
        const auditData = await auditRes.json();
        const audits = auditData.data || [];
        setHistory(audits);

        // 3. Auto-load latest results if siteUrl is set
        if (savedUrl && audits.length > 0) {
          const latestForSite = audits.find((a: AuditRecord) => a.url === savedUrl);
          if (latestForSite) {
            setAuditData(latestForSite.resultsJson as AuditData);
            setAuditComplete(true);
            setTargetUrl(savedUrl);
          }
        }
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setHistoryLoading(false);
      }
    }
    initAudit();
  }, []);

  // ── Run new audit ────────────────────────────────────────────────────────────
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
        body: JSON.stringify({ url: targetUrl, keyword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to audit URL");
      }

      setAuditData(resData.data);
      setAuditComplete(true);

      // Refresh history after new audit
      const histRes = await fetch("/api/audit");
      const histData = await histRes.json();
      if (Array.isArray(histData.data)) setHistory(histData.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong during the audit.";
      setErrorMsg(message);
    } finally {
      setIsAuditing(false);
    }
  };

  // ── Load a historical audit into the results view ────────────────────────────
  const loadHistoryRecord = (record: AuditRecord) => {
    setAuditData(record.resultsJson as AuditData);
    setAuditComplete(true);
    setErrorMsg("");
    setTargetUrl(record.url || "");
    // Scroll to results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Clear results and jump to form ──────────────────────────────────────────
  const handleAuditNew = () => {
    setAuditComplete(false);
    setAuditData(null);
    setTargetUrl("");
    setKeyword("");
    setErrorMsg("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // ── Score color helper ───────────────────────────────────────────────────────
  const scoreColor = (s: number) =>
    s > 75 ? "text-emerald-500" : s > 50 ? "text-amber-500" : "text-red-500";
  const scoreBg = (s: number) =>
    s > 75 ? "bg-emerald-500/10 border-emerald-500/20" : s > 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Content Audit</h1>
            {userSiteUrl ? (
              <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 rounded-full px-3 py-1 w-fit mt-1">
                <Globe className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold truncate max-w-[200px] sm:max-w-xs">{userSiteUrl}</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm sm:text-base">
                Analyze your webpage content to discover SEO gaps and structure issues.
              </p>
            )}
          </div>
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 gap-1.5"
              onClick={handleAuditNew}
            >
              <Plus className="h-4 w-4" />
              New Audit
            </Button>
            <Link href="/contentgenerator">
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              >
                <Zap className="h-4 w-4" />
                Generate Content
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Audit Form ── */}
        <div ref={formRef} className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <form onSubmit={handleAudit} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-foreground">Target URL</label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                  className="h-11 bg-background"
                  disabled={isAuditing}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="keyword" className="text-sm font-medium text-foreground">
                  Target Keyword (Optional)
                </label>
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
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                    Run Audit
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Error block ── */}
        {errorMsg && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3 text-destructive animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* ── Results Dashboard ── */}
        {auditComplete && auditData && !isAuditing && (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className={`rounded-xl border p-4 sm:p-5 shadow-sm flex flex-col gap-2 ${scoreBg(auditData.seoScore)}`}>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">SEO Score</span>
                <div className="flex items-end gap-2 text-3xl sm:text-4xl font-bold">
                  <span className={scoreColor(auditData.seoScore)}>{auditData.seoScore}</span>
                  <span className="text-base sm:text-lg text-muted-foreground mb-1">/ 100</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Readability</span>
                <div className="flex items-end gap-2 text-indigo-500">
                  <span className="text-xl sm:text-2xl font-bold">{auditData.readability}</span>
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Load (Est)</span>
                <div className="flex items-end gap-2 text-xl sm:text-2xl font-bold text-amber-500">
                  <span>{auditData.loadTimeEst}</span>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 sm:p-5 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2 text-sm sm:text-base">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    AI Insights & Recommendations
                  </h3>
                </div>
                <div className="divide-y divide-border flex-1">
                  {auditData.insights.map((insight, idx) => {
                    let icon = <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />;
                    if (insight.type === "error") icon = <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />;
                    else if (insight.type === "warning") icon = <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />;
                    return (
                      <div key={idx} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                        {icon}
                        <div>
                          <h4 className="text-sm font-semibold">{insight.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-fit">
                <div className="p-4 sm:p-5 border-b border-border bg-muted/20">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    DOM Structure
                  </h3>
                </div>
                <div className="p-4 sm:p-5 flex-1">
                  <ul className="space-y-4 text-sm">
                    {[
                      { label: "Title", value: auditData.structure.titleLength },
                      { label: "H2 Tags", value: auditData.structure.h2Count },
                      { label: "H3 Tags", value: auditData.structure.h3Count },
                      { label: "Missing Alt", value: auditData.structure.imagesMissingAlt },
                      { label: "Internal", value: auditData.structure.internalLinks },
                      { label: "External", value: auditData.structure.externalLinks },
                    ].map((row, i) => (
                      <li key={i} className="flex justify-between items-center border-b border-border/50 last:border-0 pb-2 last:pb-0">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-semibold text-sm sm:text-base">Want to fix these SEO issues?</p>
                <p className="text-xs text-muted-foreground">Generate optimized content for this page right now.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuditNew}
                  className="flex-1 sm:flex-none h-9 border-border"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> New Audit
                </Button>
                <Link href="/contentgenerator" className="flex-1 sm:flex-none">
                  <Button size="sm" className="w-full h-9 bg-indigo-600 hover:bg-indigo-700">
                    <Zap className="h-4 w-4 mr-1.5" /> Fix Issues
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Audit History ── */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Audit History</h2>
          </div>

          {!historyLoading && history.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-xl bg-muted/5">
              <p className="text-sm text-muted-foreground">No recent audits found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((record) => (
                <button
                  key={record.id}
                  onClick={() => loadHistoryRecord(record)}
                  className="text-left rounded-xl border border-border bg-card p-4 hover:bg-accent/50 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{record.url}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-bold ${scoreColor(record.seoScore)}`}>
                          Score: {record.seoScore}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm ${scoreBg(record.seoScore)} ${scoreColor(record.seoScore)}`}>
                      {record.seoScore}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
