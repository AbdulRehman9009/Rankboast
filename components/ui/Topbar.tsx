"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/Themetoggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    LogOut, User, Bell, Search, LayoutDashboard, BarChart2,
    CheckSquare, Users, FileText, X, ChevronRight,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Breadcrumb map ─────────────────────────────────────────────────────────────
const PAGE_META: Record<string, { label: string; icon: React.ReactNode }> = {
    "/dashboard": { label: "Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    "/audit": { label: "SEO Audit", icon: <CheckSquare className="h-3.5 w-3.5" /> },
    "/competitors": { label: "Competitor Analysis", icon: <Users className="h-3.5 w-3.5" /> },
    "/analytics": { label: "Analytics", icon: <BarChart2 className="h-3.5 w-3.5" /> },
    "/contentgenerator": { label: "Content Generator", icon: <FileText className="h-3.5 w-3.5" /> },
};

const QUICK_LINKS = [
    { label: "SEO Audit", href: "/audit", icon: <CheckSquare className="h-4 w-4" />, color: "text-emerald-500" },
    { label: "Competitor Analysis", href: "/competitors", icon: <Users className="h-4 w-4" />, color: "text-indigo-500" },
    { label: "Analytics", href: "/analytics", icon: <BarChart2 className="h-4 w-4" />, color: "text-cyan-500" },
    { label: "Content Generator", href: "/contentgenerator", icon: <FileText className="h-4 w-4" />, color: "text-amber-500" },
];

// ── Notification type ──────────────────────────────────────────────────────────
interface Notification {
    id: string;
    title: string;
    body: string;
    type: "audit" | "competitor" | "content";
    read: boolean;
    time: string;
}

const TYPE_COLOR: Record<string, string> = {
    audit: "bg-emerald-500",
    competitor: "bg-indigo-500",
    content: "bg-amber-500",
};

export function Topbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    // ── Notifications (derived from recent activity) ───────────────────────────
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [notifOpen, setNotifOpen] = useState(false);

    useEffect(() => {
        fetch("/api/activity")
            .then(r => r.json())
            .then(json => {
                if (!Array.isArray(json.data)) return;
                const notifs: Notification[] = json.data.slice(0, 6).map((
                    a: { id: string; type: string; url: string; status: string; date: string; color: string }
                ) => ({
                    id: a.id,
                    title: a.type,
                    body: a.url,
                    type: a.color === "emerald" ? "audit" : a.color === "indigo" ? "competitor" : "content",
                    read: false,
                    time: a.date,
                }));
                setNotifications(notifs);
                setUnread(notifs.length);
            })
            .catch(() => {/* silent fail */ });
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    }, []);

    // ── Search ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (searchOpen) { setTimeout(() => searchRef.current?.focus(), 50); }
        else { setQuery(""); }
    }, [searchOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSearchOpen(false);
            if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(v => !v); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const filteredLinks = QUICK_LINKS.filter(l =>
        l.label.toLowerCase().includes(query.toLowerCase())
    );

    // ── Breadcrumb ─────────────────────────────────────────────────────────────
    const pageMeta = Object.entries(PAGE_META).find(([k]) => pathname?.startsWith(k))?.[1];

    // ── Avatar initials ────────────────────────────────────────────────────────
    const initials = (session?.user?.name?.[0] || session?.user?.email?.[0] || "U").toUpperCase();

    return (
        <>
            {/* ── Search Modal overlay ── */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
                >
                    <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search pages..."
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                            <button onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="py-2 max-h-72 overflow-y-auto">
                            {filteredLinks.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results found</p>
                            ) : filteredLinks.map(link => (
                                <button
                                    key={link.href}
                                    onClick={() => { router.push(link.href); setSearchOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors text-sm"
                                >
                                    <span className={link.color}>{link.icon}</span>
                                    <span className="font-medium text-foreground">{link.label}</span>
                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                                </button>
                            ))}
                        </div>
                        <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[10px] text-muted-foreground">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate
                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd> select
                            <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd> close
                        </div>
                    </div>
                </div>
            )}

            {/* ── Topbar ── */}
            <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 px-3 sm:px-4">
                {/* Left: trigger + breadcrumb */}
                <div className="flex items-center gap-2 min-w-0">
                    <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-accent shrink-0" />
                    <div className="w-px h-4 bg-border mx-1 hidden sm:block shrink-0" />
                    {pageMeta && (
                        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                            <span className="text-muted-foreground/60">RankBoast</span>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                            <span className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                                {pageMeta.icon} {pageMeta.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: search + notifications + theme + user */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

                    {/* Search button */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg px-2 sm:px-3 py-1.5 transition-colors text-sm"
                        title="Search (⌘K)"
                    >
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline text-xs">Search</span>
                        <kbd className="hidden sm:inline px-1 py-0.5 rounded bg-muted text-[9px] font-mono">⌘K</kbd>
                    </button>

                    {/* Notifications */}
                    <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="relative p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                title="Notifications"
                            >
                                <Bell className="h-4 w-4" />
                                {unread > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[9px] font-bold">
                                        {unread > 9 ? "9+" : unread}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 mt-2 p-0 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <span className="font-semibold text-sm">Notifications</span>
                                {unread > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground">
                                    No recent activity yet
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.read ? "opacity-60" : "bg-muted/10 hover:bg-muted/20"}`}
                                        >
                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${TYPE_COLOR[n.type]}`} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-foreground">{n.title}</p>
                                                <p className="text-[11px] text-muted-foreground truncate">{n.body}</p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* User avatar + dropdown */}
                    {session?.user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 font-bold uppercase ring-1 ring-indigo-500/30 hover:bg-indigo-600/30 transition-colors shadow-sm cursor-pointer text-sm">
                                    {initials}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 mt-2">
                                <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 font-bold uppercase ring-1 ring-indigo-500/30 text-sm shrink-0">
                                        {initials}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-sm truncate">{session.user.name || "User"}</span>
                                        <span className="text-xs text-muted-foreground font-normal truncate">{session.user.email}</span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-muted-foreground gap-2" onClick={() => router.push("/profile")}>
                                    <User className="h-4 w-4" /> Profile Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
                                >
                                    <LogOut className="h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>
        </>
    );
}
