import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics | RankBoast",
    description: "View your SEO score trends, audit history, competitor win/loss ratio, and content generation stats.",
    robots: { index: false, follow: false },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
