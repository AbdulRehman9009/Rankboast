import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forgot Password | RankBoast",
    description: "Reset your RankBoast password by entering your email address.",
    robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
