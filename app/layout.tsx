
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import NextTopLoader from 'nextjs-toploader';

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "RankBoast - AI-Powered SEO Analysis",
    template: "%s | RankBoast",
  },
  description: "Advanced SEO competitor analysis, audit tool, and content generator powered by AI.",
  keywords: ["SEO", "Audit", "Competitor Analysis", "AI Content", "Rank Tracker"],
  authors: [{ name: "RankBoast Team" }],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rankboast.com",
    siteName: "RankBoast",
    title: "RankBoast - Boost Your Search Rankings",
    description: "The ultimate tool for SEO professionals to analyze competitors and generate optimized content.",
    images: [
      {
        url: "/icon.png",
        width: 800,
        height: 800,
        alt: "RankBoast Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankBoast - AI-Powered SEO Analysis",
    description: "Advanced SEO competitor analysis and audit tool.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans antialiased`}>
        <NextTopLoader color="#2632b0ff" height={2} />
        <Providers>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
