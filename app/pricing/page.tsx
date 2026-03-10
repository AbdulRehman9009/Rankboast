import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Pricing | RankBoast — AI SEO Platform",
    description: "Simple, transparent pricing for RankBoast. Start free, upgrade when you're ready.",
};

const PLANS = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        desc: "Perfect for trying out RankBoast.",
        highlight: false,
        cta: "Get started free",
        href: "/auth/signup",
        features: [
            { text: "5 SEO Audits / month", included: true },
            { text: "3 Competitor Analyses / month", included: true },
            { text: "Analytics Dashboard", included: true },
            { text: "AI Content Generator (3 / month)", included: true },
            { text: "PDF Export", included: false },
            { text: "Priority AI processing", included: false },
            { text: "API Access", included: false },
        ],
    },
    {
        name: "Pro",
        price: "$19",
        period: "per month",
        desc: "For professionals who need unlimited SEO insights.",
        highlight: true,
        badge: "Most Popular",
        cta: "Start Pro trial",
        href: "/auth/signup",
        features: [
            { text: "Unlimited SEO Audits", included: true },
            { text: "Unlimited Competitor Analyses", included: true },
            { text: "Advanced Analytics Dashboard", included: true },
            { text: "Unlimited Content Generation", included: true },
            { text: "PDF Export", included: true },
            { text: "Priority AI processing", included: true },
            { text: "API Access", included: false },
        ],
    },
    {
        name: "Agency",
        price: "$49",
        period: "per month",
        desc: "For teams and agencies managing multiple websites.",
        highlight: false,
        cta: "Contact us",
        href: "/contact",
        features: [
            { text: "Everything in Pro", included: true },
            { text: "Team members (up to 5)", included: true },
            { text: "API Access", included: true },
            { text: "White-label reports", included: true },
            { text: "Dedicated support", included: true },
            { text: "Custom integrations", included: true },
            { text: "SLA guarantee", included: true },
        ],
    },
];

const FAQ = [
    { q: "Is the free plan really free?", a: "Yes — no credit card required. You get 5 audits and 3 competitor analyses per month at no cost, forever." },
    { q: "Can I upgrade or downgrade at any time?", a: "Absolutely. You can change your plan at any time and the billing will be prorated automatically." },
    { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards via Stripe, including Visa, Mastercard, and Amex." },
    { q: "What happens to my data if I cancel?", a: "Your data (audits, reports, content) is retained for 30 days after cancellation so you can export it." },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Hero */}
            <section className="py-20 text-center relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Zap className="h-3 w-3" /> Pricing
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Simple, transparent pricing</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">Start free. Upgrade when you need more. No hidden fees.</p>
                </div>
            </section>

            {/* Plans */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="grid md:grid-cols-3 gap-6">
                    {PLANS.map(plan => (
                        <div key={plan.name} className={`relative rounded-2xl border p-6 flex flex-col ${plan.highlight
                                ? "border-indigo-500/50 bg-indigo-600/5 shadow-xl shadow-indigo-500/10"
                                : "border-border bg-card"
                            }`}>
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">Most Popular</span>
                                </div>
                            )}
                            <div className="mb-4">
                                <h2 className="font-bold text-lg mb-1">{plan.name}</h2>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-4xl font-extrabold">{plan.price}</span>
                                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{plan.desc}</p>
                            </div>

                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.features.map(f => (
                                    <li key={f.text} className={`flex items-center gap-2 text-sm ${f.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                                        {f.included
                                            ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            : <X className="h-4 w-4 shrink-0" />}
                                        {f.text}
                                    </li>
                                ))}
                            </ul>

                            <Link href={plan.href}>
                                <Button className={`w-full rounded-full gap-2 ${plan.highlight ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                                    variant={plan.highlight ? "default" : "outline"}>
                                    {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-2xl mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
                <div className="space-y-4">
                    {FAQ.map(item => (
                        <div key={item.q} className="rounded-xl border border-border bg-card p-5">
                            <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 text-center">
                <div className="max-w-md mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
                    <p className="text-muted-foreground text-sm mb-6">Our team is happy to help you choose the right plan.</p>
                    <Link href="/contact">
                        <Button variant="outline" className="rounded-full gap-2 px-8">
                            Contact us <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
