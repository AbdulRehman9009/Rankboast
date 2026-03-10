"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp, BarChart2, CheckSquare, Users, FileText,
  Sparkles, ArrowRight, Link2,
} from "lucide-react";

interface Activity {
  id: string;
  type: string;
  url: string;
  status: string;
  date: string;
  color: "emerald" | "indigo" | "amber";
  score?: number;
}

interface Stats {
  totalAudits: number;
  totalComparisons: number;
  totalContent: number;
  avgScore: number;
}

const COLOR_DOT: Record<string, string> = {
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
};
const COLOR_BADGE: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  indigo: "bg-indigo-500/10  text-indigo-500  border-indigo-500/20",
  amber: "bg-amber-500/10   text-amber-400   border-amber-500/20",
};

const QUICK_CARDS = [
  {
    title: "Competitor Analysis",
    desc: "Compare SEO metrics against industry leaders.",
    href: "/competitors",
    icon: <Users className="h-5 w-5" />,
    color: "text-indigo-500 bg-indigo-500/10",
    cta: "Run comparison",
  },
  {
    title: "SEO Audit",
    desc: "Analyze pages for SEO gaps and opportunities.",
    href: "/audit",
    icon: <CheckSquare className="h-5 w-5" />,
    color: "text-emerald-500 bg-emerald-500/10",
    cta: "Run new audit",
  },
  {
    title: "Analytics",
    desc: "Review historical data and track growth trends.",
    href: "/analytics",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "text-cyan-500 bg-cyan-500/10",
    cta: "View analytics",
  },
  {
    title: "Content Generator",
    desc: "Generate SEO-optimised articles in seconds.",
    href: "/contentgenerator",
    icon: <FileText className="h-5 w-5" />,
    color: "text-amber-500 bg-amber-500/10",
    cta: "Generate content",
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/activity")
        .then(r => r.json())
        .then(d => {
          if (d.data) setActivities(d.data);
          if (d.stats) setStats(d.stats);
        })
        .finally(() => setIsLoading(false));
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-medium animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!session) return null;

  const firstName = session.user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">{greeting} 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">
              Welcome back, <span className="text-indigo-400">{firstName}</span>
            </h1>
          </div>
          {stats && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 text-xs text-indigo-400 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              Avg SEO Score: {stats.avgScore}/100
            </div>
          )}
        </div>

        {/* ── Live stat chips ─────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Audits", value: stats.totalAudits, icon: <CheckSquare className="h-4 w-4" />, color: "text-emerald-400 bg-emerald-500/10" },
              { label: "Comparisons", value: stats.totalComparisons, icon: <Users className="h-4 w-4" />, color: "text-indigo-400  bg-indigo-500/10" },
              { label: "Content Generated", value: stats.totalContent, icon: <FileText className="h-4 w-4" />, color: "text-amber-400  bg-amber-500/10" },
              { label: "Avg SEO Score", value: `${stats.avgScore}/100`, icon: <Sparkles className="h-4 w-4" />, color: "text-cyan-400   bg-cyan-500/10" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-sm">
                <div className={`p-2 rounded-lg shrink-0 ${s.color}`}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
                  <p className="text-lg font-bold tracking-tight">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick Action Cards ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {QUICK_CARDS.map(c => (
              <Link key={c.href} href={c.href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all flex flex-col gap-3">
                <div className={`p-2.5 rounded-lg self-start ${c.color}`}>{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-card-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                </div>
                <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                  {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Activity Table ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-card-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Your latest audits, analyses, and content — live from the database.</p>
            </div>
            <Link href="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border text-[11px] sm:text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Activity</th>
                  <th className="px-5 py-3 font-semibold">Target</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-3.5"><div className="h-4 bg-muted rounded w-28" /></td>
                      <td className="px-5 py-3.5"><div className="h-4 bg-muted rounded w-40" /></td>
                      <td className="px-5 py-3.5"><div className="h-5 bg-muted rounded-full w-16" /></td>
                      <td className="px-5 py-3.5"><div className="h-4 bg-muted rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      No activity yet — run your first audit or competitor analysis to see results here.
                    </td>
                  </tr>
                ) : (
                  activities.map(act => (
                    <tr key={act.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                          <div className={`h-2 w-2 rounded-full shrink-0 ${COLOR_DOT[act.color] || "bg-slate-500"}`} />
                          {act.type}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs max-w-[200px]">
                          <Link2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{act.url}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COLOR_BADGE[act.color]}`}>
                          {act.status}{act.score != null ? ` · ${act.score}` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-muted-foreground text-xs whitespace-nowrap">
                        {act.date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
