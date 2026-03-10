import type { Metadata } from "next";
import {
    Search, Users, BarChart2, FileText, CheckCircle2, ArrowRight,
    Zap, TrendingUp, Shield, Globe, Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Features | RankBoast — AI SEO Platform",
    description: "Explore RankBoast's full feature set: SEO Audits, Competitor Analysis, Analytics Dashboard, and AI Content Generation.",
};

const FEATURES = [
    {
        icon: Search, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        title: "SEO Audit",
        desc: "Analyse any public URL in seconds. RankBoast scrapes on-page elements and runs them through AI to produce a scored report covering title tags, meta descriptions, H1–H3 structure, image alt text, internal/external links, readability, and estimated load time.",
        bullets: ["SEO score out of 100", "Actionable error/warning/success insights", "Site structure comparison table", "PDF report export"],
    },
    {
        icon: Users, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        title: "Competitor Analysis",
        desc: "Enter your URL and a competitor's URL side-by-side. Our AI scrapes both sites and produces a head-to-head comparison across all key SEO metrics, highlighting exactly where you lead and where you're being outranked.",
        bullets: ["Domain Authority comparison", "Keyword Ranking overview", "Backlink count delta", "On-page meta structure diff"],
    },
    {
        icon: BarChart2, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        title: "Analytics Dashboard",
        desc: "Every audit and competitor analysis you run is saved and visualised. Track your SEO score trend over time, see how your score distribution shifts, and monitor your competitor win/loss record.",
        bullets: ["SEO score trend line chart", "Score distribution donut chart", "Competitor win/loss tracker", "Full audit & content history"],
    },
    {
        icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        title: "AI Content Generator",
        desc: "Generate fully SEO-optimised articles with a single click. Provide your topic, target keywords, tone, and audience — the AI creates structured content with proper heading hierarchy and a save-ready meta description.",
        bullets: ["H1/H2/H3 content structure", "Keyword density optimisation", "SEO title + meta description", "Word count targeting"],
    },
];

const TECH = [
    { label: "AI Models", value: "DeepSeek & Stepfun via OpenRouter" },
    { label: "Web Scraping", value: "Cheerio — server-side, no browser required" },
    { label: "Database", value: "PostgreSQL via Neon + Prisma ORM" },
    { label: "Auth", value: "NextAuth.js — credentials + Google OAuth" },
    { label: "Framework", value: "Next.js 14 App Router + TypeScript" },
    { label: "Styling", value: "Tailwind CSS v4 + shadcn/ui" },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Hero */}
            <section className="relative py-24 text-center overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Zap className="h-3 w-3" /> Features
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                        Everything in one platform
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                        Four AI-powered modules that cover the entire SEO workflow — from technical audits to content creation.
                    </p>
                    <Link href="/auth/signup">
                        <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 gap-2 px-8">
                            Start for free <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Feature Sections */}
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">
                {FEATURES.map((f, i) => (
                    <section key={f.title} className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-10 items-center`}>
                        <div className="flex-1">
                            <div className={`inline-flex p-3 rounded-xl border mb-4 ${f.color}`}>
                                <f.icon className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">{f.title}</h2>
                            <p className="text-muted-foreground leading-relaxed mb-5">{f.desc}</p>
                            <ul className="space-y-2">
                                {f.bullets.map(b => (
                                    <li key={b} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 rounded-2xl border border-border bg-card p-8 flex items-center justify-center min-h-[180px]">
                            <f.icon className={`h-24 w-24 opacity-10 ${f.color.split(" ")[0]}`} />
                        </div>
                    </section>
                ))}
            </div>

            {/* Why section */}
            <section className="bg-muted/30 border-y border-border py-16">
                <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
                    {[
                        { icon: Shield, label: "Secure", desc: "End-to-end encrypted data, zero tracking.", color: "text-emerald-400" },
                        { icon: Clock, label: "Fast", desc: "Full audit in under 30 seconds.", color: "text-indigo-400" },
                        { icon: Globe, label: "Any URL", desc: "Works on any publicly accessible website.", color: "text-cyan-400" },
                    ].map(item => (
                        <div key={item.label} className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-xl bg-card border ${item.color}`}><item.icon className="h-5 w-5" /></div>
                            <h3 className="font-semibold text-sm">{item.label}</h3>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech stack */}
            <section className="max-w-4xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold text-center mb-8">Built with modern tech</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {TECH.map(t => (
                        <div key={t.label} className="rounded-xl border border-border bg-card p-4">
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{t.label}</p>
                            <p className="text-sm font-medium text-foreground">{t.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
                <div className="max-w-xl mx-auto px-6">
                    <TrendingUp className="h-10 w-10 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold mb-3">Ready to improve your SEO?</h2>
                    <p className="text-muted-foreground mb-8">Start for free — no credit card required.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/auth/signup"><Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-8">Get started free</Button></Link>
                        <Link href="/pricing"><Button variant="outline" className="rounded-full px-8">View pricing</Button></Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
