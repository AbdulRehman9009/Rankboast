import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Competitor Analysis | RankBoast",
    description: "Compare your website's SEO metrics side-by-side against competitors with AI-powered insights.",
    robots: { index: false, follow: false },
};

export default function CompetitorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
