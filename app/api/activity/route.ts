import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const mockActivity = [
            {
                id: "act-1",
                type: "Content Audit",
                url: "example.com/blog/seo",
                status: "Completed",
                date: "2 hours ago",
                color: "emerald"
            },
            {
                id: "act-2",
                type: "Competitor Gap",
                url: "example.com vs competitor.com",
                status: "Analyzed",
                date: "Yesterday",
                color: "indigo"
            },
            {
                id: "act-3",
                type: "Content Audit",
                url: "example.com/pricing",
                status: "Completed",
                date: "Mar 4, 2026",
                color: "emerald"
            },
            {
                id: "act-4",
                type: "Keyword Research",
                url: "Keywords for 'AI Tools'",
                status: "Running",
                date: "Just now",
                color: "amber"
            }
        ];

        return NextResponse.json({ data: mockActivity }, { status: 200 });

    } catch (error) {
        console.error("Error fetching activity:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
