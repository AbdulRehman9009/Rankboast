"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  type: string;
  url: string;
  status: string;
  date: string;
  color: "emerald" | "indigo" | "amber";
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/activity")
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setActivities(data.data);
          }
        })
        .finally(() => setIsLoadingActivity(false));
    }
  }, [status]);

  if (!isMounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-medium animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{session.user?.name || "User"}</span>. Here&apos;s an overview of your projects.
          </p>
        </div>

        {/* Quick Actions / Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Competitors Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Competitors Tracking</h3>
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 backwards 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Compare your SEO metrics against top industry leaders.</p>
            <a href="/competitors" className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 group-hover:underline">
              View competitors &rarr;
            </a>
          </div>

          {/* Audit Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Content Audit</h3>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-square"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Analyze pages for SEO gaps and optimization opportunities.</p>
            <a href="/audit" className="inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 group-hover:underline">
              Run new audit &rarr;
            </a>
          </div>

          {/* Analytics Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Overall Analytics</h3>
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-line-chart"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Review historical data and track long-term growth trends.</p>
            <button disabled className="inline-flex items-center justify-center text-sm font-medium opacity-50 cursor-not-allowed">
              Coming soon
            </button>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-card-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">Your latest audits and competitor comparisons.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Activity</th>
                  <th scope="col" className="px-6 py-4 font-medium">Target URL</th>
                  <th scope="col" className="px-6 py-4 font-medium">Status</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoadingActivity ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2 ml-auto"></div></td>
                    </tr>
                  ))
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground flex items-center justify-center">
                      No recent activity found. Start an audit to see them here!
                    </td>
                  </tr>
                ) : (
                  activities.map((act) => {
                    const colorClasses: Record<string, string> = {
                      emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
                      amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                    };
                    const dotClass: Record<string, string> = {
                      emerald: "bg-emerald-500",
                      indigo: "bg-indigo-500",
                      amber: "bg-amber-500",
                    };
                    return (
                      <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${dotClass[act.color] || "bg-slate-500"}`}></div> {act.type}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{act.url}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClasses[act.color] || colorClasses.emerald}`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">{act.date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
