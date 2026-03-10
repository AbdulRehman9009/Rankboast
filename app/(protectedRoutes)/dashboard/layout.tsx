import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | RankBoast",
    description: "Your RankBoast dashboard — overview of audits, competitor analyses, and content performance at a glance.",
    robots: { index: false, follow: false }, // Protected page — do not index
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
