"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Search, BarChart2, FileText, Users, Zap, TrendingUp,
  CheckCircle2, ArrowRight, Star, Shield, Clock, Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "SEO Audit",
    desc: "Deep-scan any URL for technical SEO issues, missing tags, readability score, and AI-powered fix recommendations.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    accent: "#10b981",
  },
  {
    icon: Users,
    title: "Competitor Analysis",
    desc: "Compare your domain authority, backlinks, and keyword rankings head-to-head against any competitor.",
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    accent: "#6366f1",
  },
  {
    icon: BarChart2,
    title: "Analytics Dashboard",
    desc: "Track your SEO score trends, score distribution, and historical performance data all in one place.",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    accent: "#06b6d4",
  },
  {
    icon: FileText,
    title: "AI Content Generator",
    desc: "Generate fully SEO-optimised articles with proper H1/H2 structure, meta descriptions, and keyword placement.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    accent: "#f59e0b",
  },
];

const STATS = [
  { value: "10K+", label: "Websites Analyzed" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "3x", label: "Faster than Manual Audits" },
  { value: "24/7", label: "AI Availability" },
];

const TESTIMONIALS = [
  {
    quote: "RankBoast cut my SEO audit time from 2 hours to 5 minutes. The AI insights are genuinely actionable.",
    author: "Sarah K.", role: "Head of SEO, TechCorp",
    avatar: "S",
  },
  {
    quote: "The competitor analysis is incredible. I can see exactly where my rivals outrank me and what to fix.",
    author: "James M.", role: "Founder, GrowthAgency",
    avatar: "J",
  },
  {
    quote: "Content generation that actually ranks! Every article I've published scores 80+ from day one.",
    author: "Priya R.", role: "Content Strategist",
    avatar: "P",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign Up Free", desc: "Create your account in seconds — no credit card required." },
  { step: "02", title: "Enter Your URL", desc: "Paste any website URL to run an instant SEO audit." },
  { step: "03", title: "Get AI Insights", desc: "Receive prioritised, actionable fixes with effort estimates." },
  { step: "04", title: "Track Progress", desc: "Monitor your score improvements over time in the analytics dashboard." },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background grid + glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-[250px] w-[250px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm font-semibold mb-8"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-Powered SEO Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Dominate Search with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              AI-Powered
            </span>{" "}
            SEO
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Audit any page, analyse competitors, generate SEO content, and track rankings — all in one platform powered by the latest AI models.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-500/20">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-border hover:bg-muted/30 font-semibold gap-2">
                See all features
              </Button>
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xs text-muted-foreground flex items-center justify-center gap-2 flex-wrap"
          >
            <span className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
            </span>
            Trusted by 10,000+ websites · No credit card required · Free plan available
          </motion.p>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                {s.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <TrendingUp className="h-3 w-3" /> Features
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4"
          >
            Everything you need to rank #1
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Four powerful modules working together to give you a complete SEO advantage.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all overflow-hidden`}
            >
              {/* Subtle glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top left, ${f.accent}15, transparent 60%)` }} />
              <div className={`relative z-10 inline-flex p-2.5 rounded-xl border mb-4 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="relative z-10 font-bold text-lg mb-2 text-foreground">{f.title}</h3>
              <p className="relative z-10 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className={`relative z-10 mt-4 flex items-center gap-1 text-xs font-semibold ${f.color.split(" ")[0]} group-hover:gap-2 transition-all`}>
                Learn more <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/features">
            <Button variant="outline" className="rounded-full gap-2">
              View all features <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4"
            >
              Up and running in minutes
            </motion.h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Start seeing SEO improvements the same day you sign up.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-sm mb-4 mx-auto">
                  {item.step}
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+30px)] right-[calc(-50%+30px)] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3"
          >
            Loved by SEO professionals
          </motion.h2>
          <p className="text-muted-foreground">Real feedback from people using RankBoast every day.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col gap-4"
            >
              <div className="flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="h-9 w-9 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/20">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY US HIGHLIGHTS ────────────────────────────────────────────────── */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: Shield, label: "Secure & Private", desc: "Your data never leaves our encrypted servers.", color: "text-emerald-400" },
            { icon: Clock, label: "Instant Results", desc: "Full SEO audit in under 30 seconds, powered by AI.", color: "text-indigo-400" },
            { icon: Globe, label: "Any Website", desc: "Works on any publicly accessible URL worldwide.", color: "text-cyan-400" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={`p-3 rounded-xl bg-card border ${item.color}`}><item.icon className="h-5 w-5" /></div>
              <h3 className="font-semibold text-sm">{item.label}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-28 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto px-6"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ready to rank higher?
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Join thousands of websites already growing their organic traffic with RankBoast AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 font-semibold gap-2 shadow-lg shadow-indigo-500/20">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-full">
                View pricing
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-2" /> Cancel anytime
          </p>
        </motion.div>
      </section>

    </div>
  );
}