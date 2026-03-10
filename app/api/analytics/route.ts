import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch all data in parallel
        const [analyses, competitors, generatedContent] = await Promise.all([
            prisma.analysis.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    url: true,
                    title: true,
                    seoScore: true,
                    resultsJson: true,
                    createdAt: true,
                },
            }),
            prisma.competitor.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    userUrl: true,
                    competitorUrl: true,
                    metricsJson: true,
                    createdAt: true,
                },
            }),
            prisma.generatedContent.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    topic: true,
                    seoTitle: true,
                    wordCount: true,
                    createdAt: true,
                },
            }),
        ]);

        // ── Aggregated summary stats ──────────────────────────────────────────────
        const avgSeoScore =
            analyses.length > 0
                ? Math.round(analyses.reduce((sum, a) => sum + a.seoScore, 0) / analyses.length)
                : 0;

        const bestScore = analyses.length > 0 ? Math.max(...analyses.map((a) => a.seoScore)) : 0;
        const worstScore = analyses.length > 0 ? Math.min(...analyses.map((a) => a.seoScore)) : 0;

        // ── Score trend: last 7 analyses in chronological order ───────────────────
        const scoreTrend = [...analyses]
            .reverse()
            .slice(-7)
            .map((a) => ({
                label: a.url ? new URL(a.url).hostname.replace("www.", "").slice(0, 18) : a.title.slice(0, 18),
                score: a.seoScore,
                date: a.createdAt,
            }));

        // ── Score distribution buckets ────────────────────────────────────────────
        const distribution = {
            poor: analyses.filter((a) => a.seoScore < 40).length,
            fair: analyses.filter((a) => a.seoScore >= 40 && a.seoScore < 70).length,
            good: analyses.filter((a) => a.seoScore >= 70).length,
        };

        // ── Competitor win/loss ratio ─────────────────────────────────────────────
        let competitorWins = 0;
        let competitorLosses = 0;
        for (const c of competitors) {
            const m = c.metricsJson as { user?: { seoScore?: number }; competitor?: { seoScore?: number } };
            const userScore = m?.user?.seoScore ?? 0;
            const compScore = m?.competitor?.seoScore ?? 0;
            if (userScore >= compScore) competitorWins++;
            else competitorLosses++;
        }

        return NextResponse.json({
            summary: {
                totalAudits: analyses.length,
                totalComparisons: competitors.length,
                totalContentGenerated: generatedContent.length,
                avgSeoScore,
                bestScore,
                worstScore,
                competitorWins,
                competitorLosses,
            },
            scoreTrend,
            distribution,
            auditHistory: analyses.map((a) => ({
                id: a.id,
                url: a.url,
                title: a.title,
                seoScore: a.seoScore,
                createdAt: a.createdAt,
                // pull key fields from resultsJson for the table
                readability: (a.resultsJson as Record<string, unknown>)?.readability ?? "—",
                loadTimeEst: (a.resultsJson as Record<string, unknown>)?.loadTimeEst ?? "—",
            })),
            competitorHistory: competitors.map((c) => {
                const m = c.metricsJson as {
                    user?: { seoScore?: number; domain?: string };
                    competitor?: { seoScore?: number; domain?: string };
                };
                return {
                    id: c.id,
                    userUrl: c.userUrl,
                    competitorUrl: c.competitorUrl,
                    userScore: m?.user?.seoScore ?? 0,
                    competitorScore: m?.competitor?.seoScore ?? 0,
                    userDomain: m?.user?.domain ?? c.userUrl ?? "—",
                    competitorDomain: m?.competitor?.domain ?? c.competitorUrl ?? "—",
                    createdAt: c.createdAt,
                };
            }),
            contentHistory: generatedContent,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Internal Server Error";
        console.error("Analytics API error:", err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
