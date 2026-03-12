"use client";

import { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    TrendingUp, BarChart2, FileText, Users, CheckCircle2, AlertCircle,
    XCircle, Globe, Link2, RefreshCw, Loader2, Search, Sparkles, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Summary {
    totalAudits: number;
    totalComparisons: number;
    totalContentGenerated: number;
    avgSeoScore: number;
    bestScore: number;
    worstScore: number;
    competitorWins: number;
    competitorLosses: number;
}

interface ScoreTrendPoint {
    label: string;
    score: number;
    date: string;
}

interface Distribution {
    poor: number;
    fair: number;
    good: number;
}

interface AuditRecord {
    id: string;
    url: string | null;
    title: string;
    seoScore: number;
    createdAt: string;
    readability: string;
    loadTimeEst: string;
}

interface CompetitorRecord {
    id: string;
    userUrl: string | null;
    competitorUrl: string;
    userScore: number;
    competitorScore: number;
    userDomain: string;
    competitorDomain: string;
    createdAt: string;
}

interface ContentRecord {
    id: string;
    topic: string;
    seoTitle: string;
    wordCount: number;
    createdAt: string;
}

interface AnalyticsData {
    summary: Summary;
    scoreTrend: ScoreTrendPoint[];
    distribution: Distribution;
    auditHistory: AuditRecord[];
    competitorHistory: CompetitorRecord[];
    contentHistory: ContentRecord[];
    internalLinkHealth: {
        domain: string;
        totalPages: number;
        orphanPages: number;
        healthScore: number;
    }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ScoreChip({ score }: { score: number }) {
    const cls =
        score >= 75 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
            : score >= 50 ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                : "bg-red-500/15 text-red-400 border-red-500/20";
    const Icon = score >= 75 ? CheckCircle2 : score >= 50 ? AlertCircle : XCircle;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
            <Icon className="h-3 w-3" />{score}/100
        </span>
    );
}

function StatCard({ icon, label, value, sub, color = "indigo" }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
    const colors: Record<string, string> = {
        indigo: "text-indigo-400 bg-indigo-500/10",
        emerald: "text-emerald-400 bg-emerald-500/10",
        amber: "text-amber-400 bg-amber-500/10",
        rose: "text-rose-400 bg-rose-500/10",
        cyan: "text-cyan-400 bg-cyan-500/10",
    };
    return (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex items-start gap-4">
            <div className={`p-2.5 rounded-lg shrink-0 ${colors[color]}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const PIE_COLORS = ["#f43f5e", "#f59e0b", "#10b981"];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"audits" | "competitors" | "content">("audits");

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/analytics");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load analytics");
            setData(json);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const pieData = data
        ? [
            { name: "Poor (<40)", value: data.distribution.poor },
            { name: "Fair (40–70)", value: data.distribution.fair },
            { name: "Good (70+)", value: data.distribution.good },
        ].filter((d) => d.value > 0)
        : [];

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-4 border-muted" />
                        <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        </div>
                    </div>
                    <p className="text-muted-foreground text-sm">Loading your analytics...</p>
                </div>
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 flex flex-col items-center gap-4 text-center max-w-md w-full">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <p className="text-destructive font-semibold">{error}</p>
                    <Button onClick={fetchData} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Retry
                    </Button>
                </div>
            </div>
        );
    }

    // ── Empty State ────────────────────────────────────────────────────────────
    if (!data || data.summary.totalAudits === 0 && data.summary.totalComparisons === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="rounded-2xl border border-dashed border-border bg-card p-10 flex flex-col items-center gap-4 text-center max-w-md w-full opacity-80">
                    <BarChart2 className="h-14 w-14 text-muted-foreground" />
                    <h2 className="text-xl font-bold">No Data Yet</h2>
                    <p className="text-muted-foreground text-sm">
                        Run your first SEO Audit or Competitor Analysis — your results will appear here automatically.
                    </p>
                </div>
            </div>
        );
    }

    // ── Dashboard ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500 shrink-0" />
                            Analytics
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Your SEO performance history and aggregated insights.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchData} className="self-start gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                    <StatCard icon={<Search className="h-5 w-5" />} label="Total Audits" value={data.summary.totalAudits} color="indigo" />
                    <StatCard icon={<BarChart2 className="h-5 w-5" />} label="Avg SEO Score" value={`${data.summary.avgSeoScore}/100`} color="cyan" />
                    <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Best Score" value={`${data.summary.bestScore}/100`} color="emerald" />
                    <StatCard icon={<Users className="h-5 w-5" />} label="Comparisons" value={data.summary.totalComparisons} sub={`${data.summary.competitorWins}W / ${data.summary.competitorLosses}L`} color="amber" />
                    <StatCard icon={<Sparkles className="h-5 w-5" />} label="Content Generated" value={data.summary.totalContentGenerated} color="rose" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* Score Trend Line Chart */}
                    {data.scoreTrend.length > 0 && (
                        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                            <h2 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-indigo-500" /> SEO Score Trend
                            </h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={data.scoreTrend} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                                        formatter={(v: unknown) => [`${v as number}/100`, "SEO Score"]}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Score Distribution Pie */}
                    {pieData.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                            <h2 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-cyan-500" /> Score Distribution
                            </h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Competitor Win/Loss Bar */}
                {data.summary.totalComparisons > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                        <h2 className="font-semibold text-sm sm:text-base mb-4 flex items-center gap-2">
                            <Users className="h-4 w-4 text-amber-500" /> Competitor Performance Summary
                        </h2>
                        <ResponsiveContainer width="100%" height={120}>
                            <BarChart
                                data={[{ label: "Competitions", Wins: data.summary.competitorWins, Losses: data.summary.competitorLosses }]}
                                layout="vertical"
                                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                            >
                                <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={90} />
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                                <Legend wrapperStyle={{ fontSize: "11px" }} />
                                <Bar dataKey="Wins" fill="#10b981" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="Losses" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Internal Link Health Row */}
                {data.internalLinkHealth.length > 0 && (
                    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                        <h2 className="font-semibold text-sm sm:text-base mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-indigo-500" />
                                Internal Link Architecture Health
                            </div>
                            <Link href="/visualizer">
                                <Button variant="link" size="sm" className="text-indigo-400 h-auto p-0 text-xs">View Visualizer <ArrowRight className="ml-1 h-3 w-3" /></Button>
                            </Link>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.internalLinkHealth.map((project, i) => (
                                <div key={i} className="bg-muted/30 rounded-xl p-4 border border-border/50 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm truncate uppercase tracking-tight">{project.domain}</h3>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            project.healthScore >= 90 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            project.healthScore >= 70 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                            "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                            {project.healthScore}% Health
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold uppercase">Pages</span>
                                            <span className="text-foreground font-bold">{project.totalPages}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold uppercase">Orphans</span>
                                            <span className="text-rose-400 font-bold">{project.orphanPages}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${
                                                project.healthScore >= 90 ? "bg-emerald-500" :
                                                project.healthScore >= 70 ? "bg-amber-500" :
                                                "bg-red-500"
                                            }`}
                                            style={{ width: `${project.healthScore}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* History Tabs */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex border-b border-border overflow-x-auto">
                        {[
                            { key: "audits", label: "Audit History", icon: <Search className="h-3.5 w-3.5" />, count: data.auditHistory.length },
                            { key: "competitors", label: "Competitor History", icon: <Globe className="h-3.5 w-3.5" />, count: data.competitorHistory.length },
                            { key: "content", label: "Content History", icon: <FileText className="h-3.5 w-3.5" />, count: data.contentHistory.length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`flex items-center gap-1.5 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.key
                                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
                                    }`}
                            >
                                {tab.icon} {tab.label}
                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Audit History Table ── */}
                    {activeTab === "audits" && (
                        <div className="overflow-x-auto">
                            {data.auditHistory.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground text-sm">
                                    No audits yet. Run your first audit from the Audit page.
                                </div>
                            ) : (
                                <table className="w-full text-xs sm:text-sm min-w-[560px]">
                                    <thead>
                                        <tr className="border-b border-border text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground bg-muted/20">
                                            <th className="text-left py-3 px-4 font-semibold">URL / Title</th>
                                            <th className="text-center py-3 px-4 font-semibold">SEO Score</th>
                                            <th className="text-center py-3 px-4 font-semibold">Readability</th>
                                            <th className="text-center py-3 px-4 font-semibold">Load Time</th>
                                            <th className="text-right py-3 px-4 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {data.auditHistory.map((a) => (
                                            <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col">
                                                        {a.url && (
                                                            <a href={a.url} target="_blank" rel="noopener noreferrer"
                                                                className="text-indigo-400 hover:underline text-xs font-medium truncate max-w-[220px] flex items-center gap-1">
                                                                <Link2 className="h-3 w-3 shrink-0" />
                                                                {a.url.replace(/^https?:\/\/(www\.)?/, "")}
                                                            </a>
                                                        )}
                                                        <span className="text-muted-foreground text-[11px] truncate max-w-[220px]">{a.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center"><ScoreChip score={a.seoScore} /></td>
                                                <td className="py-3 px-4 text-center text-muted-foreground">{String(a.readability)}</td>
                                                <td className="py-3 px-4 text-center text-muted-foreground">{String(a.loadTimeEst)}</td>
                                                <td className="py-3 px-4 text-right text-muted-foreground text-[11px]">{formatDate(a.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── Competitor History Table ── */}
                    {activeTab === "competitors" && (
                        <div className="overflow-x-auto">
                            {data.competitorHistory.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground text-sm">
                                    No competitor analyses yet. Run your first comparison from the Competitors page.
                                </div>
                            ) : (
                                <table className="w-full text-xs sm:text-sm min-w-[540px]">
                                    <thead>
                                        <tr className="border-b border-border text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground bg-muted/20">
                                            <th className="text-left py-3 px-4 font-semibold">Your Site</th>
                                            <th className="text-left py-3 px-4 font-semibold">Competitor</th>
                                            <th className="text-center py-3 px-4 font-semibold">Your Score</th>
                                            <th className="text-center py-3 px-4 font-semibold">Their Score</th>
                                            <th className="text-center py-3 px-4 font-semibold">Result</th>
                                            <th className="text-right py-3 px-4 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {data.competitorHistory.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="text-indigo-400 font-medium truncate max-w-[120px] block">{c.userDomain}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-rose-400 font-medium truncate max-w-[120px] block">{c.competitorDomain}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center"><ScoreChip score={c.userScore} /></td>
                                                <td className="py-3 px-4 text-center"><ScoreChip score={c.competitorScore} /></td>
                                                <td className="py-3 px-4 text-center">
                                                    {c.userScore >= c.competitorScore ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                            <CheckCircle2 className="h-3 w-3" /> Win
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                                            <XCircle className="h-3 w-3" /> Loss
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right text-muted-foreground text-[11px]">{formatDate(c.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── Content History Table ── */}
                    {activeTab === "content" && (
                        <div className="overflow-x-auto">
                            {data.contentHistory.length === 0 ? (
                                <div className="p-10 text-center text-muted-foreground text-sm">
                                    No content generated yet. Try the Content Generator.
                                </div>
                            ) : (
                                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                                    <thead>
                                        <tr className="border-b border-border text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground bg-muted/20">
                                            <th className="text-left py-3 px-4 font-semibold">Topic</th>
                                            <th className="text-left py-3 px-4 font-semibold">SEO Title</th>
                                            <th className="text-center py-3 px-4 font-semibold">Words</th>
                                            <th className="text-right py-3 px-4 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {data.contentHistory.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3 px-4 text-muted-foreground truncate max-w-[140px]">{c.topic}</td>
                                                <td className="py-3 px-4 font-medium text-foreground truncate max-w-[200px]">{c.seoTitle}</td>
                                                <td className="py-3 px-4 text-center text-muted-foreground">{c.wordCount.toLocaleString()}</td>
                                                <td className="py-3 px-4 text-right text-muted-foreground text-[11px]">{formatDate(c.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
