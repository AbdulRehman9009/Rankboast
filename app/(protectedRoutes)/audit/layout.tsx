import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SEO Audit | RankBoast",
    description: "Analyze any page for SEO gaps, on-page errors, and AI-powered optimization recommendations.",
    robots: { index: false, follow: false },
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
