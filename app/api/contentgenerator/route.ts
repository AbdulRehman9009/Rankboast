import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { env } from "@/lib/env";

const contentSchema = z.object({
  topic: z.string().min(3),
  keywords: z.string().min(3),
  tone: z.string(),
  audience: z.string(),
  wordcount: z.coerce.number().min(100).max(5000),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = contentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { topic, keywords, tone, audience, wordcount } = result.data;

    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": env.NEXTAUTH_URL,
        "X-Title": "RankBoast"
      }
    });

    const prompt = `Act as a JSON-only API for an SEO Content Generation Engine. 
You must output a single, valid JSON object and absolutely nothing else. 
No preamble, no conversational filler, and no markdown code blocks.

### OUTPUT SCHEMA (STRICT COMPLIANCE REQUIRED):
{
  "seoTitle": "String(max 60 chars) - Must include the main topic and be catchy.",
  "metaDescription": "String(max 160 chars) - A compelling summary for search results.",
  "articleBody": "String - The full content formatted in Markdown. Include H1, H2, and H3 tags. Target word count: ${wordcount}.",
  "keywordsUsed": ["Array of strings"]
}

### CONTENT PARAMETERS:
- Topic: ${topic}
- Primary Keywords: ${keywords}
- Tone: ${tone}
- Target Audience: ${audience}

### SEO RULES:
1. The 'articleBody' must naturally integrate keywords.
2. Use bullet points and numbered lists within 'articleBody' for readability.
3. The 'seoTitle' must not be the same as the H1 inside the 'articleBody'.
4. Ensure the JSON is escaped correctly for special characters to prevent parsing errors.

Generate the JSON object now:`;

    const completion = await client.chat.completions.create({
      model: "stepfun/step-3.5-flash:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    let aiText = completion.choices?.[0]?.message?.content?.trim() || "";

    aiText = aiText.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();

    let content;
    try {
      content = JSON.parse(aiText);
    } catch (parseError) {
      console.error("AI JSON Parse Error:");
      return NextResponse.json({ error: "AI returned invalid JSON format" }, { status: 500 });
    }

    // Save to Database
    const savedContent = await prisma.generatedContent.create({
      data: {
        userId: session.user.id,
        topic,
        keywords,
        tone,
        audience,
        wordCount: wordcount,
        seoTitle: content.seoTitle,
        metaDescription: content.metaDescription,
        articleBody: content.articleBody,
        keywordsUsed: content.keywordsUsed,
      },
    });

    return NextResponse.json({
      id: savedContent.id,
      seoTitle: savedContent.seoTitle,
      metaDescription: savedContent.metaDescription,
      articleBody: savedContent.articleBody,
      keywordsUsed: savedContent.keywordsUsed,
      wordCount: savedContent.wordCount,
      createdAt: savedContent.createdAt,
    });
  } catch (error: unknown) {
    console.error("Generation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}