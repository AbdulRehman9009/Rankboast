"use client";

import { useState, useEffect } from "react";
import {
    User, Mail, Shield, Crown, Edit2, Save, X,
    Lock, CheckCircle2, AlertCircle, Loader2, BarChart2,
    Search, FileText, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";

interface ProfileUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    subscription: string;
    createdAt: string;
}

interface ProfileStats {
    audits: number;
    comparisons: number;
    content: number;
}

type Toast = { type: "success" | "error"; msg: string } | null;

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onDismiss, 4000);
        return () => clearTimeout(t);
    }, [toast, onDismiss]);

    if (!toast) return null;
    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all animate-in slide-in-from-top-2 ${toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
            {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {toast.msg}
            <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
    );
}

export default function ProfilePage() {
    const [user, setUser] = useState<ProfileUser | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast>(null);

    // Name editing
    const [editName, setEditName] = useState(false);
    const [nameVal, setNameVal] = useState("");
    const [savingName, setSavingName] = useState(false);

    // Password section
    const [pwSection, setPwSection] = useState(false);
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [savingPw, setSavingPw] = useState(false);

    function showToast(type: "success" | "error", msg: string) {
        setToast({ type, msg });
    }

    useEffect(() => {
        fetch("/api/profile")
            .then(r => r.json())
            .then(d => {
                if (d.user) { setUser(d.user); setNameVal(d.user.name || ""); }
                if (d.stats) setStats(d.stats);
            })
            .catch(() => showToast("error", "Failed to load profile"))
            .finally(() => setLoading(false));
    }, []);

    async function saveName() {
        if (!nameVal.trim() || nameVal === user?.name) { setEditName(false); return; }
        setSavingName(true);
        try {
            const r = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nameVal.trim() }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Failed");
            setUser(prev => prev ? { ...prev, name: nameVal.trim() } : prev);
            showToast("success", "Name updated successfully");
            setEditName(false);
        } catch (e: unknown) {
            showToast("error", e instanceof Error ? e.message : "Update failed");
        } finally {
            setSavingName(false);
        }
    }

    async function changePassword() {
        if (!currentPw || !newPw || !confirmPw) { showToast("error", "All password fields are required"); return; }
        if (newPw !== confirmPw) { showToast("error", "New passwords do not match"); return; }
        if (newPw.length < 8) { showToast("error", "New password must be at least 8 characters"); return; }
        setSavingPw(true);
        try {
            const r = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Failed");
            showToast("success", "Password changed — please sign in again");
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
            setPwSection(false);
            setTimeout(() => signOut({ callbackUrl: "/auth/signin" }), 2000);
        } catch (e: unknown) {
            showToast("error", e instanceof Error ? e.message : "Password change failed");
        } finally {
            setSavingPw(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const initials = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
    const memberSince = user ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <User className="h-7 w-7 text-indigo-500" /> Profile
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your account information and security.</p>
                </div>

                {/* Avatar + Basic Info */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    {/* Banner gradient */}
                    <div className="h-20 bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-cyan-600/20" />

                    <div className="px-5 pb-5">
                        {/* Avatar */}
                        <div className="-mt-10 flex items-end justify-between mb-4">
                            <div className="h-16 w-16 rounded-full bg-indigo-600/20 border-4 border-card ring-2 ring-indigo-500/40 flex items-center justify-center text-2xl font-bold text-indigo-400">
                                {initials}
                            </div>
                            <div className="flex items-center gap-2 pb-1">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${user?.subscription === "PREMIUM"
                                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                        : "bg-muted text-muted-foreground border-border"
                                    }`}>
                                    {user?.subscription === "PREMIUM" ? <span className="flex items-center gap-1"><Crown className="h-3 w-3" /> Premium</span> : "Free Plan"}
                                </span>
                            </div>
                        </div>

                        {/* Name row */}
                        <div className="flex items-center gap-2 mb-1">
                            {editName ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        value={nameVal}
                                        onChange={e => setNameVal(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditName(false); }}
                                        className="h-8 text-sm max-w-xs"
                                        autoFocus
                                    />
                                    <Button size="sm" onClick={saveName} disabled={savingName} className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700">
                                        {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setEditName(false); setNameVal(user?.name || ""); }} className="h-8">
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-xl font-bold">{user?.name || "—"}</span>
                                    <button onClick={() => setEditName(true)} className="text-muted-foreground hover:text-foreground transition-colors" title="Edit name">
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Detail rows */}
                        <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4 shrink-0" />
                                <span>Role: <span className="text-foreground font-medium capitalize">{user?.role?.toLowerCase()}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span>Member since <span className="text-foreground font-medium">{memberSince}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Stats */}
                {stats && (
                    <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-indigo-500" /> Your Usage
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Audits Run", value: stats.audits, icon: <Search className="h-4 w-4" />, color: "text-emerald-400 bg-emerald-500/10" },
                                { label: "Comparisons", value: stats.comparisons, icon: <BarChart2 className="h-4 w-4" />, color: "text-indigo-400  bg-indigo-500/10" },
                                { label: "Content Gen'd", value: stats.content, icon: <FileText className="h-4 w-4" />, color: "text-amber-400  bg-amber-500/10" },
                            ].map(s => (
                                <div key={s.label} className="rounded-xl border border-border bg-background p-3 flex flex-col items-center gap-2 text-center">
                                    <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
                                    <p className="text-2xl font-bold">{s.value}</p>
                                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Change Password */}
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="font-semibold text-sm flex items-center gap-2">
                            <Lock className="h-4 w-4 text-indigo-500" /> Password & Security
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPwSection(v => !v)}
                            className="text-xs h-7"
                        >
                            {pwSection ? "Cancel" : "Change password"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Keep your account secure with a strong password.</p>

                    {pwSection && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground font-medium mb-1 block">Current password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter current password"
                                    value={currentPw}
                                    onChange={e => setCurrentPw(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium mb-1 block">New password</label>
                                <Input
                                    type="password"
                                    placeholder="Min 8 characters"
                                    value={newPw}
                                    onChange={e => setNewPw(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-medium mb-1 block">Confirm new password</label>
                                <Input
                                    type="password"
                                    placeholder="Repeat new password"
                                    value={confirmPw}
                                    onChange={e => setConfirmPw(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") changePassword(); }}
                                    className="text-sm"
                                />
                            </div>
                            <Button
                                onClick={changePassword}
                                disabled={savingPw}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                            >
                                {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                Update password
                            </Button>
                        </div>
                    )}
                </div>

                {/* Danger zone */}
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                    <h2 className="font-semibold text-sm text-destructive mb-1">Danger Zone</h2>
                    <p className="text-xs text-muted-foreground mb-3">This will end your current session immediately.</p>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    >
                        Sign out of all sessions
                    </Button>
                </div>

            </div>
        </div>
    );
}
