import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Target, Heart, TrendingUp, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "About | RankBoast — AI SEO Platform",
    description: "Learn about RankBoast — the AI-powered SEO platform built to help every website rank higher.",
};

const VALUES = [
    { icon: Target, title: "Accuracy first", desc: "Every insight we show is grounded in real scraped data, not guesses.", color: "text-indigo-400 bg-indigo-500/10" },
    { icon: Zap, title: "Speed", desc: "Full SEO audits in under 30 seconds — because your time matters.", color: "text-amber-400 bg-amber-500/10" },
    { icon: Heart, title: "User experience", desc: "Complex SEO made simple. No jargon, just clear, actionable steps.", color: "text-rose-400 bg-rose-500/10" },
    { icon: TrendingUp, title: "Continuous improvement", desc: "We update our AI models and analysis algorithms regularly.", color: "text-emerald-400 bg-emerald-500/10" },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Hero */}
            <section className="py-24 text-center relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Zap className="h-3 w-3" /> About RankBoast
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
                        Built to help every website rank higher
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                        RankBoast is an AI-powered SEO platform that brings enterprise-grade analysis to individuals, startups, and agencies. We believe great rankings shouldn't require a team of SEO consultants.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="max-w-4xl mx-auto px-6 pb-20">
                <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center">
                    <h2 className="text-2xl font-extrabold mb-4">Our mission</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mx-auto">
                        To democratise SEO. We use the latest AI models to give any website owner the same depth of analysis that was previously only available to large organisations with dedicated SEO teams and expensive tools.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <h2 className="text-2xl font-bold text-center mb-10">What we stand for</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {VALUES.map(v => (
                        <div key={v.title} className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                            <div className={`p-2.5 rounded-xl self-start ${v.color}`}><v.icon className="h-5 w-5" /></div>
                            <h3 className="font-semibold text-sm">{v.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Story */}
            <section className="bg-muted/30 border-y border-border py-20">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-6 text-center">The story</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                            RankBoast was built out of frustration with existing SEO tools — they were either too expensive, too complex, or produced reports that required a specialist to interpret. We wanted something that gave you a score, told you what was wrong, and explained exactly how to fix it.
                        </p>
                        <p>
                            We integrated the latest large language models to interpret raw scraped data into human-readable insights. The result is a platform that anyone — from a solo blogger to a growth agency — can use effectively from day one.
                        </p>
                        <p>
                            Today, RankBoast handles thousands of audits and competitor analyses every month, helping websites across every industry improve their organic search performance.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
                <div className="max-w-md mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-3">Want to join our journey?</h2>
                    <p className="text-muted-foreground text-sm mb-8">Start improving your SEO today — completely free.</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link href="/auth/signup">
                            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 gap-2 px-8">
                                Get started free <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" className="rounded-full px-8">Contact us</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
