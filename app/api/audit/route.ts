import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // 1. Scrape the URL
        let htmlData;
        try {
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                timeout: 10000,
            });
            htmlData = response.data;
        } catch (error) {
            console.error("Scraping error:", error);
            return NextResponse.json({ error: "Failed to fetch the provided URL. Make sure it is accessible." }, { status: 400 });
        }

        const $ = cheerio.load(htmlData);

        const title = $("title").text() || "No title found";
        const metaDescription = $('meta[name="description"]').attr("content") || "No meta description found";
        const h1s = $("h1").map((i, el) => $(el).text().trim()).get();
        const h2Count = $("h2").length;
        const h3Count = $("h3").length;
        const wordCount = $("body").text().trim().split(/\s+/).length || 0;

        const internalLinks = $("a[href^='/']").length + $(`a[href^='${url}']`).length;
        const externalLinks = $("a[href^='http']").length - $(`a[href^='${url}']`).length;
        const imagesMissingAlt = $("img:not([alt]), img[alt='']").length;

        const scrapedData = {
            title,
            metaDescription,
            h1s,
            h2Count,
            h3Count,
            wordCount,
            internalLinks,
            externalLinks,
            imagesMissingAlt
        };

        // 2. AI Analysis using Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using "gemini-1.5-flash-latest" as a more robust fallback for the SDK version
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
      You are an expert technical SEO auditor. Given the following scraped metrics for the URL "${url}", analyze them and provide a structured JSON response identifying SEO problems and actionable solutions to improve the page.

      Scraped Data:
      ${JSON.stringify(scrapedData, null, 2)}

      Your JSON response MUST follow this exact schema:
      {
        "seoScore": (integer between 0 and 100 representing overall health),
        "readability": (string, e.g., "Good", "Fair", "Poor"),
        "loadTimeEst": (string, estimate like "1.2s", just fake a reasonable guess based on word count/images),
        "insights": [
          {
            "type": (string, either "error", "warning", or "success"),
            "title": (string, short title of the issue),
            "description": (string, detailed explanation and how to fix it)
          }
        ],
        "structure": {
           "titleLength": (string, e.g., "Perfect (54 chars)" or "Too Long (75 chars)"),
           "h2Count": (number of h2 tags),
           "h3Count": (number of h3 tags),
           "imagesMissingAlt": (number),
           "internalLinks": (number),
           "externalLinks": (number)
        }
      }
      
      Respond ONLY with valid JSON. Do not include markdown blocks like \`\`\`json.
    `;

        const result = await model.generateContent(prompt);
        let aiText = result.response.text().trim();

        // Clean up potential markdown code block formatting
        if (aiText.startsWith("```json")) {
            aiText = aiText.substring(7);
        }
        if (aiText.startsWith("```")) {
            aiText = aiText.substring(3);
        }
        if (aiText.endsWith("```")) {
            aiText = aiText.substring(0, aiText.length - 3);
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(aiText.trim());
        } catch (e) {
            console.error("Failed to parse AI JSON:", aiText);
            return NextResponse.json({ error: "AI generated invalid JSON" }, { status: 500 });
        }

        const analysisRecord = await (prisma as any).analysis.create({
            data: {
                userId: session.user.id,
                url: url,
                title: title || url,
                seoScore: parsedResult.seoScore || 0,
                resultsJson: parsedResult
            }
        });

        return NextResponse.json({ data: parsedResult, analysisId: analysisRecord.id }, { status: 200 });

    } catch (error) {
        console.error("Error running audit:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
