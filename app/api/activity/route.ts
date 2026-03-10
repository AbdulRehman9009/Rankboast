import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractDomain(url: string): string {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const [analyses, competitors, content] = await Promise.all([
            prisma.analysis.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, url: true, title: true, seoScore: true, createdAt: true },
            }),
            prisma.competitor.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 4,
                select: { id: true, userUrl: true, competitorUrl: true, createdAt: true },
            }),
            prisma.generatedContent.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 4,
                select: { id: true, topic: true, seoTitle: true, createdAt: true },
            }),
        ]);

        // Merge and sort all events chronologically
        type Row = { id: string; type: string; url: string; status: string; date: string; color: "emerald" | "indigo" | "amber"; score?: number; createdAt: Date };
        const rows: Row[] = [
            ...analyses.map(a => ({
                id: a.id,
                type: "SEO Audit",
                url: a.url ? extractDomain(a.url) : a.title,
                status: a.seoScore >= 70 ? "Good" : a.seoScore >= 45 ? "Fair" : "Poor",
                score: a.seoScore,
                date: timeAgo(new Date(a.createdAt)),
                color: (a.seoScore >= 70 ? "emerald" : a.seoScore >= 45 ? "amber" : "indigo") as Row["color"],
                createdAt: new Date(a.createdAt),
            })),
            ...competitors.map(c => ({
                id: c.id,
                type: "Competitor Analysis",
                url: `${c.userUrl ? extractDomain(c.userUrl) : "—"} vs ${extractDomain(c.competitorUrl)}`,
                status: "Analyzed",
                date: timeAgo(new Date(c.createdAt)),
                color: "indigo" as Row["color"],
                createdAt: new Date(c.createdAt),
            })),
            ...content.map(c => ({
                id: c.id,
                type: "Content Generated",
                url: c.topic,
                status: "Completed",
                date: timeAgo(new Date(c.createdAt)),
                color: "amber" as Row["color"],
                createdAt: new Date(c.createdAt),
            })),
        ];

        rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const data = rows.slice(0, 10).map(({ createdAt: _c, ...rest }) => rest);

        // ── Summary counts for dashboard stat cards ──
        const [totalAudits, totalComparisons, totalContent] = await Promise.all([
            prisma.analysis.count({ where: { userId } }),
            prisma.competitor.count({ where: { userId } }),
            prisma.generatedContent.count({ where: { userId } }),
        ]);

        const avgScore = analyses.length > 0
            ? Math.round(analyses.reduce((s, a) => s + a.seoScore, 0) / analyses.length)
            : 0;

        return NextResponse.json({
            data,
            stats: { totalAudits, totalComparisons, totalContent, avgScore },
        });
    } catch (error) {
        console.error("Activity API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

