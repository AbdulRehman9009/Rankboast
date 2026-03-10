"use client";
import {
  Link2,
  Search,
  ChartNoAxesColumnIncreasing,
  MirrorRectangular,
  BrainCircuit,
  HeartHandshake,
  BookOpenCheck,
} from "lucide-react";

import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [url, setURL] = useState("");

  const capabilities = [
    {
      title: "Keyword Research",
      description:
        "Discover high-impact keywords to target for maximum SEO performance.",
      icon: Search,
    },
    {
      title: "Content Optimization",
      description:
        "Get AI-driven recommendations to optimize your content for better rankings.",
      icon: MirrorRectangular,
    },
    {
      title: "Competitor Analysis",
      description:
        "Analyze your competitors' SEO strategies and identify opportunities to outrank them.",
      icon: ChartNoAxesColumnIncreasing,
    },
  ];

  const whyChooseUs = [
    {
      title: "AI-Powered Insights",
      description:
        "Leverage advanced AI algorithms to gain actionable insights and boost your SEO performance.",
      icon: BrainCircuit,
    },
    {
      title: "User-Friendly Interface",
      description:
        "Our intuitive dashboard makes it easy for anyone to optimize their website SEO.",
      icon: HeartHandshake,
    },
    {
      title: "Proven Results",
      description:
        "Join thousands of satisfied users who improved rankings using our AI SEO platform.",
      icon: BookOpenCheck,
    },
  ];

  const submitURL = () => {
    console.log("URL submitted:", url);
  };

  return (
    <div className="min-h-screen w-full">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center">

        <div className="px-6 py-2 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mb-6">
          Powered by Advanced AI
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
          Elevate Your Rankings with AI-Powered SEO
        </h1>

        <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
          Experience the future of SEO with our AI platform designed to boost
          rankings and drive organic traffic.
        </p>

        {/* URL INPUT */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-xl">

          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter your website URL"
              onChange={(e) => setURL(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          <Button
            onClick={submitURL}
            className="h-11 px-8"
          >
            Boost Now
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          Trusted by thousands of websites improving their SEO.
        </p>
      </section>

      {/* CAPABILITIES */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >

        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">
            Core Capabilities
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful AI-driven tools designed to improve rankings and drive
            organic traffic.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {capabilities.map((capability) => (
            <motion.div
              key={capability.title}
              whileHover={{ y: -6 }}
              className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg transition"
            >
              <capability.icon className="h-10 w-10 text-blue-500 mb-4" />

              <h3 className="font-semibold text-lg mb-2">
                {capability.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {capability.description}
              </p>
            </motion.div>
          ))}

        </div>
      </motion.section>

      {/* WHY CHOOSE US */}
      <motion.section className="bg-muted/40 py-20">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">
              Why Choose RankBoost AI
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced AI insights combined with a powerful yet simple platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {whyChooseUs.map((reason) => (
              <motion.div
                key={reason.title}
                whileHover={{ y: -6 }}
                className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-lg transition"
              >
                <reason.icon className="h-10 w-10 text-blue-500 mb-4" />

                <h3 className="font-semibold text-lg mb-2">
                  {reason.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {reason.description}
                </p>
              </motion.div>
            ))}

          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-24 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Search Presence?
          </h2>
          <p className="text-muted-foreground mb-10">
            Join thousands of websites already improving their SEO performance
            with AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}