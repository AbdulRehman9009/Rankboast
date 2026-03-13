import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScrapedData {
    title: string;
    metaDescription: string;
    metaKeywords: string;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    wordCount: number;
    imageCount: number;
    imagesMissingAlt: number;
    internalLinks: number;
    externalLinks: number;
    hasCanonical: boolean;
    hasRobots: boolean;
    hasViewport: boolean;
    hasOgTags: boolean;
    hasSchema: boolean;
}

interface SiteMetrics {
    domain: string;
    seoScore: number;
    domainAuthority: number;
    keywordRankings: number;
    backlinkCount: number;
    metaTagStatus: "Optimized" | "Needs Work" | "Missing";
    estimatedLoadTime: string;
    internalLinks: number;
    monthlyTrend: { month: string; score: number }[];
    insights: { type: "error" | "warning" | "success"; title: string; description: string }[];
    rawScrape: ScrapedData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
    try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

async function scrapeUrl(url: string): Promise<ScrapedData> {
    const response = await axios.get(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        },
        timeout: 12000,
        maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);

    const internalBase = new URL(url).hostname;
    let internalLinks = 0;
    let externalLinks = 0;

    $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        if (href.startsWith("/") || href.includes(internalBase)) {
            internalLinks++;
        } else if (href.startsWith("http")) {
            externalLinks++;
        }
    });

    return {
        title: $("title").text().trim() || "",
        metaDescription: $('meta[name="description"]').attr("content") || "",
        metaKeywords: $('meta[name="keywords"]').attr("content") || "",
        h1Count: $("h1").length,
        h2Count: $("h2").length,
        h3Count: $("h3").length,
        wordCount: $("body").text().trim().split(/\s+/).filter(Boolean).length,
        imageCount: $("img").length,
        imagesMissingAlt: $("img:not([alt]), img[alt='']").length,
        internalLinks,
        externalLinks,
        hasCanonical: $('link[rel="canonical"]').length > 0,
        hasRobots: $('meta[name="robots"]').length > 0,
        hasViewport: $('meta[name="viewport"]').length > 0,
        hasOgTags: $('meta[property^="og:"]').length > 0,
        hasSchema: $('script[type="application/ld+json"]').length > 0,
    };
}

// Build a simple deterministic trend from score (simulated monthly history)
function buildTrend(baseScore: number): { month: string; score: number }[] {
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    return months.map((month, i) => ({
        month,
        score: Math.max(10, Math.min(100, baseScore - 8 + Math.round(Math.sin(i + baseScore) * 6) + i)),
    }));
}

async function analyzeWithAI(
    url: string,
    scrape: ScrapedData,
    client: OpenAI
): Promise<SiteMetrics> {
    const domain = extractDomain(url);

    const prompt = `
You are an expert technical SEO analyst. Analyze the following scraped data for "${url}" and return a structured JSON response with realistic, data-driven estimates.

Scraped Metrics:
${JSON.stringify(scrape, null, 2)}

Return ONLY valid JSON (no markdown, no backticks) matching this exact schema:
{
  "seoScore": <integer 0-100, based on the scraped signals above>,
  "domainAuthority": <integer 0-100, estimate based on site complexity and link structure>,
  "keywordRankings": <integer, estimated number of keywords this site could rank for>,
  "backlinkCount": <integer, estimated total backlinks based on site size and structure>,
  "metaTagStatus": <"Optimized" | "Needs Work" | "Missing", based on title/meta/og availability>,
  "estimatedLoadTime": <string like "1.8s", estimate based on image count and word count>,
  "insights": [
    {
      "type": <"error" | "warning" | "success">,
      "title": <short title>,
      "description": <actionable explanation, 1-2 sentences>
    }
  ]
}

Base seoScore on: title presence, meta description, h1-h3 structure, canonical, OG tags, schema markup, internal links, image alt attributes, word count.
Provide 4-6 insights total. Be realistic and specific to the actual scraped data.
`;

    const completion = await client.chat.completions.create({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 900,
    });

    let aiText = completion.choices?.[0]?.message?.content?.trim() ?? "";
    aiText = aiText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed = JSON.parse(aiText);

    return {
        domain,
        seoScore: Math.min(100, Math.max(0, parseInt(parsed.seoScore) || 50)),
        domainAuthority: Math.min(100, Math.max(1, parseInt(parsed.domainAuthority) || 30)),
        keywordRankings: Math.max(1, parseInt(parsed.keywordRankings) || 500),
        backlinkCount: Math.max(0, parseInt(parsed.backlinkCount) || 1000),
        metaTagStatus: (["Optimized", "Needs Work", "Missing"].includes(parsed.metaTagStatus)
            ? parsed.metaTagStatus
            : "Needs Work") as "Optimized" | "Needs Work" | "Missing",
        estimatedLoadTime: String(parsed.estimatedLoadTime || "2.5s"),
        internalLinks: scrape.internalLinks,
        monthlyTrend: buildTrend(Math.min(100, Math.max(0, parseInt(parsed.seoScore) || 50))),
        insights: Array.isArray(parsed.insights) ? parsed.insights.slice(0, 6) : [],
        rawScrape: scrape,
    };
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!dbUser) {
            return NextResponse.json({ error: "User not found. Please sign in again." }, { status: 401 });
        }

        const body = await req.json();
        const result = z.object({
            userUrl: z.string().url("Invalid user URL"),
            competitorUrl: z.string().url("Invalid competitor URL"),
        }).safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        const { userUrl, competitorUrl } = result.data;

        const apiKey = env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
        }

        const client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey,
            defaultHeaders: {
                "HTTP-Referer": env.NEXTAUTH_URL,
                "X-Title": "RankBoast",
            },
        });

        let userScrape: ScrapedData;
        let competitorScrape: ScrapedData;

        try {
            [userScrape, competitorScrape] = await Promise.all([
                scrapeUrl(userUrl),
                scrapeUrl(competitorUrl),
            ]);
        } catch (scrapeErr: unknown) {
            const msg = scrapeErr instanceof Error ? scrapeErr.message : "Unknown scraping error";
            console.error("Scraping error:", msg);
            return NextResponse.json(
                { error: `Failed to fetch one of the URLs. Ensure both are publicly accessible. (${msg})` },
                { status: 400 }
            );
        }

        // ── Analyse both with AI in parallel ──
        let userMetrics: SiteMetrics;
        let competitorMetrics: SiteMetrics;

        try {
            [userMetrics, competitorMetrics] = await Promise.all([
                analyzeWithAI(userUrl, userScrape, client),
                analyzeWithAI(competitorUrl, competitorScrape, client),
            ]);
        } catch (aiErr: unknown) {
            const msg = aiErr instanceof Error ? aiErr.message : "AI analysis failed";
            console.error("AI analysis error:", msg);
            return NextResponse.json({ error: `AI analysis failed: ${msg}` }, { status: 500 });
        }
        const metricsPayload = JSON.parse(
            JSON.stringify({ user: userMetrics, competitor: competitorMetrics })
        );
        await prisma.competitor.create({
            data: {
                userId: session.user.id,
                userUrl,
                competitorUrl,
                metricsJson: metricsPayload,
            },
        });

        return NextResponse.json(
            { data: { user: userMetrics, competitor: competitorMetrics } },
            { status: 200 }
        );
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Internal Server Error";
        console.error("Competitors API error:", err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
