import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const res = NextResponse.next();

        res.headers.set("X-Frame-Options", "DENY");
        // Prevent MIME sniffing
        res.headers.set("X-Content-Type-Options", "nosniff");
        // XSS protection (legacy browsers)
        res.headers.set("X-XSS-Protection", "1; mode=block");
        // Referrer policy
        res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        // Permissions policy (disable microphone, camera etc.)
        res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        // Force HTTPS in production
        if (process.env.NODE_ENV === "production") {
            res.headers.set(
                "Strict-Transport-Security",
                "max-age=63072000; includeSubDomains; preload"
            );
        }
        // Basic CSP — tighten further once you know your asset domains
        res.headers.set(
            "Content-Security-Policy",
            [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these at the moment
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: blob: https:",
                "connect-src 'self' https://openrouter.ai wss:",
                "frame-ancestors 'none'",
            ].join("; ")
        );

        return res;
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
