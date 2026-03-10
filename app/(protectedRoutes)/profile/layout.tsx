import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile | RankBoast",
    description: "Manage your RankBoast account — update your name, change your password, and view usage statistics.",
    robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
