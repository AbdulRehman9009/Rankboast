import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; 
const MAX_REQUESTS = 60; 

export default withAuth(
    function middleware(req) {
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const now = Date.now();
        const windowData = rateLimitMap.get(ip);

        if (req.nextUrl.pathname.startsWith("/api")) {
            if (!windowData || now - windowData.lastReset > RATE_LIMIT_WINDOW) {
                rateLimitMap.set(ip, { count: 1, lastReset: now });
            } else {
                if (windowData.count >= MAX_REQUESTS) {
                    return new NextResponse("Too Many Requests", {
                        status: 429,
                        headers: { "Retry-After": "60" },
                    });
                }
                windowData.count++;
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/audit/:path*",
        "/competitors/:path*",
        "/analytics/:path*",
        "/contentgenerator/:path*",
        "/profile/:path*",
    ],
};
