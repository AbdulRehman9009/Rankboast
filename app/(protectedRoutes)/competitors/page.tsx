"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import {
  Search, Globe, Link2, TrendingUp, BarChart2, Download, Loader2,
  AlertCircle, CheckCircle2, XCircle, RefreshCw, Shield, Tag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Insight {
  type: "error" | "warning" | "success";
  title: string;
  description: string;
}

interface SiteMetrics {
  domain: string;
  seoScore: number;
  domainAuthority: number;
  keywordRankings: number;
  backlinkCount: number;
  metaTagStatus: "Optimized" | "Needs Work" | "Missing";
  estimatedLoadTime: string;
  internalLinks: number;
  monthlyTrend: { month: string; score: number }[];
  insights: Insight[];
  rawScrape: {
    title: string;
    metaDescription: string;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    wordCount: number;
    imagesMissingAlt: number;
    hasOgTags: boolean;
    hasSchema: boolean;
    hasCanonical: boolean;
  };
}

interface AnalysisResult {
  user: SiteMetrics;
  competitor: SiteMetrics;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const urlSchema = z.object({
  userUrl: z.string().url({ message: "Please enter a valid URL (include https://)" }),
  competitorUrl: z.string().url({ message: "Please enter a valid URL (include https://)" }),
});

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Resolving domains...",
  "Crawling site structure & HTML...",
  "Extracting meta tags and link signals...",
  "Sending data to AI engine...",
  "Scoring SEO metrics with DeepSeek...",
  "Compiling comparison report...",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricStatusIcon({ status }: { status: SiteMetrics["metaTagStatus"] }) {
  if (status === "Optimized") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (status === "Needs Work") return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
  return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  return <span className={`text-3xl font-bold tabular-nums ${color}`}>{score}</span>;
}

function ComparisonCard({
  icon, label, userValue, compValue, format,
}: {
  icon: React.ReactNode;
  label: string;
  userValue: number | string;
  compValue: number | string;
  format?: (v: number) => string;
}) {
  const uv = typeof userValue === "number" ? (format ? format(userValue) : userValue) : userValue;
  const cv = typeof compValue === "number" ? (format ? format(compValue) : compValue) : compValue;
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        {icon}{label}
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-indigo-500/10 p-3">
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">You</p>
          <p className="text-lg font-bold text-indigo-400 leading-tight">{uv}</p>
        </div>
        <div className="rounded-lg bg-rose-500/10 p-3">
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1">Them</p>
          <p className="text-lg font-bold text-rose-400 leading-tight">{cv}</p>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

async function exportToPDF(result: AnalysisResult) {
  // Dynamic import keeps it client-side only and out of the server bundle
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 20;

  // ── Header ──
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RankBoast AI — Competitor Analysis Report", W / 2, 12, { align: "center" });

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y = 24;
  doc.text(`Generated: ${new Date().toLocaleString()}`, W / 2, y, { align: "center" });
  doc.text(`${result.user.domain}  vs  ${result.competitor.domain}`, W / 2, y + 5, { align: "center" });
  y += 14;

  // ── Scores banner ──
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y, W - 28, 18, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text(`Your SEO Score: ${result.user.seoScore}/100`, 22, y + 7);
  doc.setTextColor(244, 63, 94);
  doc.text(`Competitor SEO Score: ${result.competitor.seoScore}/100`, 22, y + 13);
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const verdict =
    result.user.seoScore >= result.competitor.seoScore
      ? "✓ Your site leads in SEO score."
      : "⚠ Competitor leads — review gaps below.";
  doc.text(verdict, W - 16, y + 10, { align: "right" });
  y += 24;

  // ── Metrics Comparison Table ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Metrics Comparison", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Metric", result.user.domain, result.competitor.domain]],
    body: [
      ["SEO Score", `${result.user.seoScore}/100`, `${result.competitor.seoScore}/100`],
      ["Domain Authority", `${result.user.domainAuthority}/100`, `${result.competitor.domainAuthority}/100`],
      ["Keyword Rankings", result.user.keywordRankings.toLocaleString(), result.competitor.keywordRankings.toLocaleString()],
      ["Backlinks", result.user.backlinkCount.toLocaleString(), result.competitor.backlinkCount.toLocaleString()],
      ["Meta Tag Status", result.user.metaTagStatus, result.competitor.metaTagStatus],
      ["Est. Load Time", result.user.estimatedLoadTime, result.competitor.estimatedLoadTime],
      ["Internal Links", String(result.user.internalLinks), String(result.competitor.internalLinks)],
    ],
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      1: { textColor: [79, 70, 229], fontStyle: "bold" },
      2: { textColor: [244, 63, 94], fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Site Structure Table ──
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Scraped Site Structure", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Signal", result.user.domain, result.competitor.domain]],
    body: [
      ["Page Title", result.user.rawScrape?.title?.slice(0, 40) || "—", result.competitor.rawScrape?.title?.slice(0, 40) || "—"],
      ["H1 Tags", String(result.user.rawScrape?.h1Count ?? "—"), String(result.competitor.rawScrape?.h1Count ?? "—")],
      ["H2 Tags", String(result.user.rawScrape?.h2Count ?? "—"), String(result.competitor.rawScrape?.h2Count ?? "—")],
      ["Word Count", String(result.user.rawScrape?.wordCount ?? "—"), String(result.competitor.rawScrape?.wordCount ?? "—")],
      ["Images Missing Alt", String(result.user.rawScrape?.imagesMissingAlt ?? "—"), String(result.competitor.rawScrape?.imagesMissingAlt ?? "—")],
      ["OG Tags Present", result.user.rawScrape?.hasOgTags ? "Yes" : "No", result.competitor.rawScrape?.hasOgTags ? "Yes" : "No"],
      ["Schema Markup", result.user.rawScrape?.hasSchema ? "Yes" : "No", result.competitor.rawScrape?.hasSchema ? "Yes" : "No"],
      ["Canonical Tag", result.user.rawScrape?.hasCanonical ? "Yes" : "No", result.competitor.rawScrape?.hasCanonical ? "Yes" : "No"],
    ],
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── AI Insights ──
  const allInsights = [
    ...result.user.insights.map((i) => ({ ...i, site: result.user.domain })),
    ...result.competitor.insights.map((i) => ({ ...i, site: result.competitor.domain })),
  ];

  if (allInsights.length > 0) {
    if (y > 210) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("AI Insights", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Site", "Type", "Finding", "Description"]],
      body: allInsights.map((ins) => [
        ins.site,
        ins.type.toUpperCase(),
        ins.title,
        ins.description,
      ]),
      theme: "striped",
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 3: { cellWidth: 80 } },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer ──
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text(`RankBoast AI  •  Page ${i} of ${totalPages}`, W / 2, 290, { align: "center" });
  }

  doc.save(`rankboast-competitor-${Date.now()}.pdf`);
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const [userUrl, setUserUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ userUrl?: string; competitorUrl?: string }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState<"user" | "competitor">("user");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    const validation = urlSchema.safeParse({ userUrl, competitorUrl });
    if (!validation.success) {
      const errs: { userUrl?: string; competitorUrl?: string } = {};
      for (const issue of validation.error.issues) {
        errs[issue.path[0] as "userUrl" | "competitorUrl"] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    if (userUrl.trim() === competitorUrl.trim()) {
      setErrorMsg("Please enter two different URLs to compare.");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setStepIndex(0);
    setAnalysisResult(null);


    let elapsed = 0;
    const MOCK_DURATION = 9000;
    timerRef.current = setInterval(() => {
      elapsed += 200;
      const pct = Math.min(85, Math.round((elapsed / MOCK_DURATION) * 85));
      setProgress(pct);
      setStepIndex(Math.min(Math.floor((pct / 85) * LOADING_STEPS.length), LOADING_STEPS.length - 1));
    }, 200);

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userUrl, competitorUrl }),
      });

      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");

      setAnalysisResult(json.data);
    } catch (err: unknown) {
      if (timerRef.current) clearInterval(timerRef.current);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnalyzing(false);
    setProgress(0);
    setStepIndex(0);
    setAnalysisResult(null);
    setErrorMsg("");
    setFieldErrors({});
    setUserUrl("");
    setCompetitorUrl("");
  };

  const handleExportPDF = async () => {
    if (!analysisResult) return;
    setIsExportingPDF(true);
    try {
      await exportToPDF(analysisResult);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const barData = analysisResult ? [
    { metric: "DA Score", You: analysisResult.user.domainAuthority, Competitor: analysisResult.competitor.domainAuthority },
    { metric: "SEO Score", You: analysisResult.user.seoScore, Competitor: analysisResult.competitor.seoScore },
    { metric: "KW Rank (÷80)", You: Math.round(analysisResult.user.keywordRankings / 80), Competitor: Math.round(analysisResult.competitor.keywordRankings / 80) },
    { metric: "Backlinks (÷1k)", You: Math.round(analysisResult.user.backlinkCount / 1000), Competitor: Math.round(analysisResult.competitor.backlinkCount / 1000) },
  ] : [];

  const lineData = analysisResult
    ? analysisResult.user.monthlyTrend.map((point, i) => ({
      month: point.month,
      You: point.score,
      Competitor: analysisResult.competitor.monthlyTrend[i]?.score ?? 0,
    }))
    : [];

  const activeInsights = analysisResult
    ? (activeInsightTab === "user" ? analysisResult.user.insights : analysisResult.competitor.insights)
    : [];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
              <BarChart2 className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500 shrink-0" />
              Competitor Analysis
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Compare real SEO metrics side-by-side powered by web scraping &amp; AI.
            </p>
          </div>
          {analysisResult && (
            <Button variant="outline" size="sm" className="self-start flex items-center gap-2" onClick={handleReset}>
              <RefreshCw className="h-4 w-4" /> New Analysis
            </Button>
          )}
        </div>

        {/* ── Input Form ── */}
        {!analysisResult && !isAnalyzing && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                {/* Your URL */}
                <div className="space-y-1.5">
                  <label htmlFor="userUrl" className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indigo-400 shrink-0" /> Your Website URL
                  </label>
                  <Input
                    id="userUrl"
                    type="url"
                    placeholder="https://yoursite.com"
                    value={userUrl}
                    onChange={(e) => { setUserUrl(e.target.value); setFieldErrors((p) => ({ ...p, userUrl: undefined })); }}
                    className={`h-11 bg-background ${fieldErrors.userUrl ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {fieldErrors.userUrl && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.userUrl}
                    </p>
                  )}
                </div>

                {/* Competitor URL */}
                <div className="space-y-1.5">
                  <label htmlFor="competitorUrl" className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-rose-400 shrink-0" /> Competitor URL
                  </label>
                  <Input
                    id="competitorUrl"
                    type="url"
                    placeholder="https://competitor.com"
                    value={competitorUrl}
                    onChange={(e) => { setCompetitorUrl(e.target.value); setFieldErrors((p) => ({ ...p, competitorUrl: undefined })); }}
                    className={`h-11 bg-background ${fieldErrors.competitorUrl ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {fieldErrors.competitorUrl && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.competitorUrl}
                    </p>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-sm">{errorMsg}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={!userUrl || !competitorUrl}
                className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Analyze &amp; Compare
              </Button>
            </form>
          </div>
        )}

        {/* ── Loading State ── */}
        {isAnalyzing && (
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500 animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold">AI Analysis in Progress</h3>
              <p className="text-muted-foreground text-sm max-w-sm">{LOADING_STEPS[stepIndex]}</p>
            </div>
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress}% complete</span>
                <span>Powered by DeepSeek + Cheerio</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20 truncate max-w-[140px] sm:max-w-none">
                {userUrl}
              </span>
              <span className="text-muted-foreground self-center font-bold">vs</span>
              <span className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 font-medium border border-rose-500/20 truncate max-w-[140px] sm:max-w-none">
                {competitorUrl}
              </span>
            </div>
          </div>
        )}

        {/* Error after submit */}
        {errorMsg && !isAnalyzing && !analysisResult && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* ── Results Dashboard ── */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-5 sm:space-y-6">

            {/* Score Banner */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-row justify-around sm:justify-start sm:gap-10 items-center">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Your Site</p>
                    <div className="flex items-end gap-1 justify-center">
                      <ScoreBadge score={analysisResult.user.seoScore} />
                      <span className="text-lg font-bold text-indigo-400 mb-0.5">/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">{analysisResult.user.domain}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-2 sm:px-4">
                    <span className="text-2xl font-black text-muted-foreground">VS</span>
                    {analysisResult.user.seoScore > analysisResult.competitor.seoScore ? (
                      <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> You&apos;re ahead!
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                        <AlertCircle className="h-3 w-3" /> Room to grow
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">Competitor</p>
                    <div className="flex items-end gap-1 justify-center">
                      <ScoreBadge score={analysisResult.competitor.seoScore} />
                      <span className="text-lg font-bold text-rose-400 mb-0.5">/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">{analysisResult.competitor.domain}</p>
                  </div>
                </div>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExportingPDF ? "Generating PDF..." : "Export PDF Report"}
                </Button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <ComparisonCard
                icon={<Shield className="h-3.5 w-3.5" />}
                label="Domain Authority"
                userValue={analysisResult.user.domainAuthority}
                compValue={analysisResult.competitor.domainAuthority}
              />
              <ComparisonCard
                icon={<BarChart2 className="h-3.5 w-3.5" />}
                label="SEO Score"
                userValue={analysisResult.user.seoScore}
                compValue={analysisResult.competitor.seoScore}
              />
              <ComparisonCard
                icon={<Search className="h-3.5 w-3.5" />}
                label="Keyword Rankings"
                userValue={analysisResult.user.keywordRankings}
                compValue={analysisResult.competitor.keywordRankings}
                format={(v) => v.toLocaleString()}
              />
              <ComparisonCard
                icon={<Link2 className="h-3.5 w-3.5" />}
                label="Backlinks"
                userValue={analysisResult.user.backlinkCount}
                compValue={analysisResult.competitor.backlinkCount}
                format={(v) => v.toLocaleString()}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* Bar Chart */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                <h2 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-indigo-500" /> Metrics Comparison
                </h2>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="You" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Competitor" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                <h2 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-500" /> SEO Score Trend — Last 6 Months
                </h2>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={lineData} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line type="monotone" dataKey="You" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="Competitor" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3, fill: "#f43f5e" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Site Structure Table */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-500 shrink-0" />
                <h2 className="font-semibold text-sm sm:text-base">Site Structure &amp; Meta Tag Status</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[420px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-4 font-semibold">Signal</th>
                      <th className="text-center py-3 px-4 font-semibold text-indigo-400">{analysisResult.user.domain}</th>
                      <th className="text-center py-3 px-4 font-semibold text-rose-400">{analysisResult.competitor.domain}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { label: "Meta Tag Status", user: <span className="inline-flex items-center gap-1"><MetricStatusIcon status={analysisResult.user.metaTagStatus} />{analysisResult.user.metaTagStatus}</span>, comp: <span className="inline-flex items-center gap-1"><MetricStatusIcon status={analysisResult.competitor.metaTagStatus} />{analysisResult.competitor.metaTagStatus}</span> },
                      { label: "Est. Load Time", user: analysisResult.user.estimatedLoadTime, comp: analysisResult.competitor.estimatedLoadTime },
                      { label: "Internal Links", user: analysisResult.user.internalLinks, comp: analysisResult.competitor.internalLinks },
                      { label: "Domain Authority", user: analysisResult.user.domainAuthority, comp: analysisResult.competitor.domainAuthority },
                      { label: "Total Backlinks", user: analysisResult.user.backlinkCount.toLocaleString(), comp: analysisResult.competitor.backlinkCount.toLocaleString() },
                      { label: "Word Count", user: analysisResult.user.rawScrape?.wordCount?.toLocaleString() ?? "—", comp: analysisResult.competitor.rawScrape?.wordCount?.toLocaleString() ?? "—" },
                      { label: "OG Tags", user: analysisResult.user.rawScrape?.hasOgTags ? "✓ Present" : "✗ Missing", comp: analysisResult.competitor.rawScrape?.hasOgTags ? "✓ Present" : "✗ Missing" },
                      { label: "Schema Markup", user: analysisResult.user.rawScrape?.hasSchema ? "✓ Present" : "✗ Missing", comp: analysisResult.competitor.rawScrape?.hasSchema ? "✓ Present" : "✗ Missing" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-4 text-muted-foreground font-medium">{row.label}</td>
                        <td className="py-2.5 px-4 text-center font-medium">{row.user}</td>
                        <td className="py-2.5 px-4 text-center font-medium">{row.comp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" /> AI SEO Insights
                </h2>
                <div className="flex rounded-lg border border-border overflow-hidden w-fit">
                  <button
                    onClick={() => setActiveInsightTab("user")}
                    className={`px-3 sm:px-4 py-1.5 text-xs font-semibold transition-colors ${activeInsightTab === "user" ? "bg-indigo-600 text-white" : "bg-card text-muted-foreground hover:bg-muted/30"}`}
                  >
                    {analysisResult.user.domain}
                  </button>
                  <button
                    onClick={() => setActiveInsightTab("competitor")}
                    className={`px-3 sm:px-4 py-1.5 text-xs font-semibold transition-colors ${activeInsightTab === "competitor" ? "bg-rose-600 text-white" : "bg-card text-muted-foreground hover:bg-muted/30"}`}
                  >
                    {analysisResult.competitor.domain}
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {activeInsights.length > 0 ? activeInsights.map((ins, idx) => {
                  const icon =
                    ins.type === "error" ? <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" /> :
                      ins.type === "warning" ? <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" /> :
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />;
                  return (
                    <div key={idx} className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-muted/10 transition-colors">
                      {icon}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{ins.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{ins.description}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">No insights returned for this site.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
