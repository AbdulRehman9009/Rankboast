import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import axios from "axios";
import { URL } from "url";
import { env } from "@/lib/env";

// ── GET — return projects history & stats ────────────────────────────────────
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      // Return specific project details for graph
      const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
        include: {
          pages: {
            include: { outgoingLinks: true }
          }
        }
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      const nodes = project.pages.map(p => ({
        id: p.id,
        name: p.title || p.url,
        val: p.isOrphan ? 20 : 10,
        isOrphan: p.isOrphan,
        aiSuggestion: p.aiLinkSuggestion,
      }));

      const links: { source: string; target: string }[] = [];
      project.pages.forEach(p => {
        p.outgoingLinks.forEach(out => {
          links.push({ source: p.id, target: out.id });
        });
      });

      return NextResponse.json({ nodes, links });
    }

    // Default: return list of projects for history
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { pages: true }
        },
        pages: {
          where: { isOrphan: true },
          select: { id: true }
        }
      }
    });

    const formatted = projects.map(p => ({
      id: p.id,
      domain: p.domain,
      createdAt: p.createdAt,
      totalPages: p._count.pages,
      orphanPages: p.pages.length,
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    console.error("GET /api/visualizer Error:", err.message, err.stack);
    return NextResponse.json({ error: "Failed to fetch history: " + err.message }, { status: 500 });
  }
}

// ── BFS Crawler Helper ───────────────────────────────────────────────────────
async function crawlInternalLinks(startUrl: string, maxDepth = 3, maxPages = 50) {
  const domain = new URL(startUrl).hostname;
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
  const results: { url: string; title: string; snippet: string; links: string[] }[] = [];

  while (queue.length > 0 && results.length < maxPages) {
    const { url, depth } = queue.shift()!;
    if (visited.has(url) || depth > maxDepth) continue;
    visited.add(url);

    try {
      const isStartUrl = url === startUrl;
      const { data } = await axios.get(url, { 
        timeout: 8000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "max-age=0",
        }
      });
      const $ = cheerio.load(data);
      const title = $("title").text().trim() || "Untitled Page";
      const snippet = $("body").text().trim().replace(/\s+/g, " ").substring(0, 200);
      const internalLinks: string[] = [];

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        try {
          const absoluteUrl = new URL(href, url);
          // Only same domain, exclude non-http, ignore anchors
          if (
            absoluteUrl.hostname === domain &&
            (absoluteUrl.protocol === "http:" || absoluteUrl.protocol === "https:") &&
            !absoluteUrl.pathname.match(/\.(jpg|jpeg|png|gif|pdf|zip)$/i)
          ) {
            const cleanUrl = absoluteUrl.origin + absoluteUrl.pathname;
            internalLinks.push(cleanUrl);
            if (!visited.has(cleanUrl) && depth + 1 <= maxDepth) {
              queue.push({ url: cleanUrl, depth: depth + 1 });
            }
          }
        } catch {
          // Skip invalid URLs
        }
      });

      results.push({
        url,
        title,
        snippet,
        links: [...new Set(internalLinks)],
      });
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        if (url === startUrl) {
          throw new Error(`Access Denied: ${url} blocks automated analysis. This site might be protected by a firewall or anti-bot system.`);
        }
      }
      console.error(`Failed to crawl ${url}:`, err.message);
    }
  }

  return results;
}

// ── AI Semantic Analysis Helper ──────────────────────────────────────────────
async function getAIRecommendation(orphan: any, potentialParents: any[]) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": env.NEXTAUTH_URL,
      "X-Title": "RankBoast"
    }
  });

  const parentContext = potentialParents
    .map((p, i) => `Option ${i + 1}: [${p.title}] - Snippet: ${p.contentSnippet}`)
    .join("\n");

  const prompt = `
    You are an expert technical SEO auditor.
    Orphan Page: [${orphan.title}]
    Content Snippet: ${orphan.contentSnippet}

    Potential Parent Pages:
    ${parentContext}

    Identify the most semantically relevant parent page to link TO the orphan page.
    Suggest an exact Anchor Text to use for the link.
    Provide a 1-sentence reasoning for why this link improves topical authority.

    Return your answer in this JSON format:
    {
      "bestParentTitle": "Title of chosen parent",
      "anchorText": "Text",
      "reasoning": "Reason"
    }
    Respond ONLY with valid JSON.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const aiText = completion.choices?.[0]?.message?.content?.trim() || "";
    // Simple JSON extraction
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (err) {
    console.error("AI Recommendation failed:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { startUrl } = body;
    if (!startUrl) {
      return NextResponse.json({ error: "Missing startUrl" }, { status: 400 });
    }

    // 1. Crawl
    const crawlData = await crawlInternalLinks(startUrl);
    const domain = new URL(startUrl).hostname;

    // 2. Save Project & Pages
    const project = await prisma.project.upsert({
      where: { userId_domain: { userId: session.user.id, domain } },
      update: {},
      create: {
        userId: session.user.id,
        domain: domain,
      },
    });

    const projectId = project.id;

    // Collect all unique URLs (crawled + their targets)
    const allUrls = new Set<string>();
    crawlData.forEach(item => {
      allUrls.add(item.url);
      item.links.forEach(l => allUrls.add(l));
    });

    // 1. First pass: Upsert all URLs as pages (using atomic operations, not one giant transaction)
    await Promise.all(Array.from(allUrls).map(async (url) => {
      const crawled = crawlData.find(c => c.url === url);
      return prisma.page.upsert({
        where: { projectId_url: { projectId, url } },
        update: crawled ? {
          title: crawled.title,
          contentSnippet: crawled.snippet,
        } : {},
        create: {
          projectId,
          url,
          title: crawled?.title || "Stub Page",
          contentSnippet: crawled?.snippet || "Not crawled",
        },
      });
    }));

    // 2. Second pass: Connect Links
    for (const item of crawlData) {
      const validLinks = item.links.filter(l => l !== item.url);
      if (validLinks.length > 0) {
        await prisma.page.update({
          where: { projectId_url: { projectId, url: item.url } },
          data: {
            outgoingLinks: {
              connect: validLinks.map((linkUrl) => ({
                projectId_url: { projectId, url: linkUrl },
              })),
            },
          },
        });
      }
    }

    // 3. Detect Orphans
    const orphanPages = await prisma.page.findMany({
      where: {
        projectId,
        incomingLinks: { none: {} },
      },
    });

    // Mark orphans in DB
    await prisma.page.updateMany({
      where: { id: { in: orphanPages.map(p => p.id) } },
      data: { isOrphan: true },
    });

    // 4. AI Recommendations for Orphans
    const nonOrphanPages = await prisma.page.findMany({
      where: { projectId, isOrphan: false },
      take: 5,
    });

    if (nonOrphanPages.length > 0) {
      for (const orphan of orphanPages) {
        const recommendation = await getAIRecommendation(orphan, nonOrphanPages);
        if (recommendation) {
          const suggestionText = `Link from "${recommendation.bestParentTitle}" using anchor "${recommendation.anchorText}". ${recommendation.reasoning}`;
          await prisma.page.update({
            where: { id: orphan.id },
            data: { aiLinkSuggestion: suggestionText },
          });
        }
      }
    }

    // 5. Format for react-force-graph
    const finalPages = await prisma.page.findMany({
      where: { projectId },
      include: { outgoingLinks: true },
    });

    const nodes = finalPages.map(p => ({
      id: p.id,
      name: p.title || p.url,
      val: p.isOrphan ? 20 : 10,
      isOrphan: p.isOrphan,
      aiSuggestion: p.aiLinkSuggestion,
    }));

    const links: { source: string; target: string }[] = [];
    finalPages.forEach(p => {
      p.outgoingLinks.forEach(out => {
        links.push({ source: p.id, target: out.id });
      });
    });

    return NextResponse.json({ nodes, links });
  } catch (err: any) {
    console.error("POST /api/visualizer Error:", err.message);
    const msg = err.message || "Internal Error";
    const status = msg.includes("Access Denied") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
