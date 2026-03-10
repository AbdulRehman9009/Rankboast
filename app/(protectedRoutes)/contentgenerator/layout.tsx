import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Content Generator | RankBoast",
    description: "Generate SEO-optimised articles and blog posts in seconds with AI-powered content creation.",
    robots: { index: false, follow: false },
};

export default function ContentGeneratorLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
