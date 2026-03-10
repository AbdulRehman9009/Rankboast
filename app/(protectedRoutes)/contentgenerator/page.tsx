"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  Globe, 
  Layout, 
  AlertCircle 
} from "lucide-react";

interface ContentFormData {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
  wordcount: number;
}

interface GeneratedContentResponse {
  id?: string;
  seoTitle: string;
  metaDescription: string;
  articleBody: string;
  keywordsUsed: string[];
}

export default function ContentGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GeneratedContentResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentFormData>({
    defaultValues: {
      topic: "",
      keywords: "",
      tone: "professional",
      audience: "general",
      wordcount: 800,
    },
  });

  const onSubmit = async (formData: ContentFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/contentgenerator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate content");
      }

      setData(result.content ? result.content : result); // Handle wrapped or direct JSON
    } catch (err: any) {
      console.error("Generation Error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!data?.articleBody) return;
    navigator.clipboard.writeText(data.articleBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-10 min-h-screen">
      
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <Sparkles className="text-brand h-10 w-10" />
          AI Content Studio
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Generate production-ready, SEO-optimized articles in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-4 glass-card p-6 lg:p-8 rounded-2xl border border-border shadow-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-semibold">Focus Topic</Label>
              <Input 
                id="topic"
                {...register("topic", { required: "Topic is required" })} 
                placeholder="e.g. The Future of Web Development" 
                className="h-12 bg-background/50" 
              />
              {errors.topic && <span className="text-destructive text-sm">{errors.topic.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords" className="text-sm font-semibold">LSI Keywords (comma separated)</Label>
              <Input 
                id="keywords"
                {...register("keywords", { required: "Keywords are required" })} 
                placeholder="Next.js, Tailwind, Server Components" 
                className="h-12 bg-background/50" 
              />
              {errors.keywords && <span className="text-destructive text-sm">{errors.keywords.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone" className="text-sm font-semibold">Tone</Label>
                <select 
                  id="tone"
                  {...register("tone")} 
                  className="w-full h-12 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-semibold">Audience</Label>
                <select 
                  id="audience"
                  {...register("audience")} 
                  className="w-full h-12 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="general">General</option>
                  <option value="expert">Expert/Developers</option>
                  <option value="beginner">Beginners</option>
                  <option value="business">Business Owners</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordcount" className="text-sm font-semibold">Target Word Count</Label>
              <Input 
                id="wordcount"
                type="number" 
                {...register("wordcount", { 
                  required: true, 
                  min: { value: 100, message: "Min 100 words" },
                  max: { value: 2000, message: "Max 2000 words" }
                })} 
                className="h-12 bg-background/50" 
              />
              {errors.wordcount && <span className="text-destructive text-sm">{errors.wordcount.message}</span>}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2 text-sm"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button 
              disabled={loading} 
              type="submit"
              className="w-full h-14 text-lg font-bold bg-brand hover:bg-brand/90 hover:scale-[1.02] transition-all shadow-glow text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Article
                </>
              )}
            </Button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-8 min-h-[600px] flex flex-col"
        >
          {data ? (
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl glass-card border border-border/50">
                  <div className="flex items-center gap-2 mb-3 text-brand font-bold text-xs tracking-wider uppercase">
                    <Globe className="h-4 w-4" /> Optimized Title
                  </div>
                  <h3 className="text-lg font-semibold text-foreground leading-snug">
                    {data.seoTitle}
                  </h3>
                </div>
                
                <div className="p-5 rounded-xl glass-card border border-border/50">
                  <div className="flex items-center gap-2 mb-3 text-brand font-bold text-xs tracking-wider uppercase">
                    <Layout className="h-4 w-4" /> Meta Description
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.metaDescription}
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 lg:p-10 rounded-2xl border border-border/50 shadow-lg bg-card/50">
                <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-brand h-6 w-6" /> Generated Draft
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard} 
                    className="gap-2 transition-colors hover:bg-brand hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Markdown"}
                  </Button>
                </div>

                {/* Markdown Renderer */}
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-a:text-brand prose-p:leading-relaxed">
                  <ReactMarkdown>
                    {data.articleBody}
                  </ReactMarkdown>
                </div>

                {data.keywordsUsed && data.keywordsUsed.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3 font-medium">Keywords Integrated:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.keywordsUsed.map((kw: string, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-brand/10 text-brand text-xs font-semibold rounded-full border border-brand/20"
                        >
                          #{kw.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 glass-card rounded-2xl border border-dashed border-border p-10">
              <div className="p-6 rounded-full bg-muted/50">
                <FileText className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="max-w-md">
                <p className="text-2xl font-semibold mb-2">Awaiting Instructions</p>
                <p className="text-sm text-muted-foreground">
                  Fill out the parameters on the left and click generate to watch the AI craft your SEO-optimized article.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}