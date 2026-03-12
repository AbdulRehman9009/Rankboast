import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "RankBoost - Visualizer",
    description: "Visualize your website's link architecture and discover orphan pages that need better connectivity to rank.",
};

export default function VisualizerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}