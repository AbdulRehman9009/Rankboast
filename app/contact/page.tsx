"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [key]: e.target.value }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) { setError("Please fill in all required fields."); return; }
        setLoading(true);
        setError("");
        // Simulate send (replace with real API call when email sending is wired up)
        await new Promise(r => setTimeout(r, 1200));
        setSent(true);
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Header */}
            <section className="py-20 text-center relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-3xl" />
                </div>
                <div className="relative z-10 max-w-xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-6">
                        <MessageSquare className="h-3 w-3" /> Get in touch
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Contact us</h1>
                    <p className="text-muted-foreground text-lg">Have a question, feedback, or need help? We&apos;re here for you.</p>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-5 gap-10">

                {/* Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                        {[
                            { icon: Mail, label: "Email", value: "support@rankboast.ai" },
                            { icon: Clock, label: "Response time", value: "Within 24 hours" },
                            { icon: MapPin, label: "Headquarters", value: "Remote-first, worldwide" },
                        ].map(item => (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0"><item.icon className="h-4 w-4" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                                    <p className="text-sm font-semibold">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <h3 className="font-semibold text-sm mb-2">Common questions</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>→ Billing and plan changes</li>
                            <li>→ Technical issues with audits</li>
                            <li>→ Agency / partnership enquiries</li>
                            <li>→ Feature requests and feedback</li>
                        </ul>
                    </div>
                </div>

                {/* Form */}
                <div className="md:col-span-3">
                    {sent ? (
                        <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center text-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold">Message sent!</h2>
                            <p className="text-muted-foreground text-sm">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name *</label>
                                    <Input placeholder="Your name" value={form.name} onChange={set("name")} className="text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email *</label>
                                    <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className="text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                                <Input placeholder="What&apos;s this about?" value={form.subject} onChange={set("subject")} className="text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message *</label>
                                <textarea
                                    rows={5}
                                    placeholder="Tell us more..."
                                    value={form.message}
                                    onChange={set("message")}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                />
                            </div>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 rounded-full">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Send message
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
