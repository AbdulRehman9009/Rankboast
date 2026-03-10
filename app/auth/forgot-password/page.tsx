"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) { setError("Please enter your email address"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send reset email");
            setSubmitted(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                    {/* Gradient top bar */}
                    <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500" />

                    <div className="p-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">R</div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">RankBoast</span>
                        </div>

                        {submitted ? (
                            // ── Success state ──
                            <div className="text-center py-4">
                                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto mb-4">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                                </div>
                                <h1 className="text-xl font-bold mb-2">Check your inbox</h1>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                    If <span className="text-foreground font-medium">{email}</span> is registered, you&apos;ll receive a password reset link shortly. It expires in <strong>1 hour</strong>.
                                </p>
                                <p className="text-xs text-muted-foreground mb-6">
                                    Didn&apos;t receive it? Check your spam folder or try again.
                                </p>
                                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="gap-2">
                                    <ArrowLeft className="h-3.5 w-3.5" /> Try again
                                </Button>
                            </div>
                        ) : (
                            // ── Form ──
                            <>
                                <h1 className="text-2xl font-bold tracking-tight mb-1">Forgot your password?</h1>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Enter your email and we&apos;ll send you a link to reset your password.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5" /> Email address
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(""); }}
                                            className={`text-sm ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                        {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Send reset link
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors">
                                        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
