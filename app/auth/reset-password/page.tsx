"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token") ?? "";

    const [validating, setValidating] = useState(true);
    const [valid, setValid] = useState(false);
    const [tokenError, setTokenError] = useState("");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setTokenError("No reset token found. Please request a new link.");
            setValidating(false);
            return;
        }
        fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
            .then(r => r.json())
            .then(d => {
                if (d.valid) { setValid(true); }
                else { setTokenError(d.error || "Invalid or expired reset link."); }
            })
            .catch(() => setTokenError("Could not validate token. Please try again."))
            .finally(() => setValidating(false));
    }, [token]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) { setError("Passwords do not match"); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed");
            setSuccess(true);
            setTimeout(() => router.push("/auth/signin"), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    // ── Loading while validating token ───────────────────────────────────────
    if (validating) {
        return (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                <p className="text-sm">Validating your reset link…</p>
            </div>
        );
    }

    // ── Invalid / expired token ───────────────────────────────────────────────
    if (!valid) {
        return (
            <div className="py-6 text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-4">
                    <AlertCircle className="h-7 w-7 text-red-400" />
                </div>
                <h2 className="text-lg font-bold mb-2">Link invalid or expired</h2>
                <p className="text-sm text-muted-foreground mb-6">{tokenError}</p>
                <Link href="/auth/forgot-password">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-3.5 w-3.5" /> Request new link
                    </Button>
                </Link>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="py-4 text-center">
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto mb-4">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Password reset!</h2>
                <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
        );
    }

    // ── Reset form ────────────────────────────────────────────────────────────
    return (
        <>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Create new password</h1>
            <p className="text-muted-foreground text-sm mb-6">Must be at least 8 characters.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">New password</label>
                    <div className="relative">
                        <Input
                            type={showPw ? "text" : "password"}
                            placeholder="Min 8 characters"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(""); }}
                            className="text-sm pr-10"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirm new password</label>
                    <Input
                        type="password"
                        placeholder="Repeat new password"
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setError(""); }}
                        className={`text-sm ${error ? "border-destructive" : ""}`}
                    />
                    {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
                </div>

                {/* Strength indicator */}
                {password && (
                    <div className="space-y-1">
                        <div className="flex gap-1">
                            {[8, 12, 16].map((len, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= len
                                        ? i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-500" : "bg-emerald-500"
                                        : "bg-muted"
                                    }`} />
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            {password.length < 8 ? "Too short" : password.length < 12 ? "Weak" : password.length < 16 ? "Fair" : "Strong"}
                        </p>
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Set new password
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500" />
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">R</div>
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">RankBoast</span>
                        </div>
                        <Suspense fallback={
                            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                            </div>
                        }>
                            <ResetPasswordForm />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
