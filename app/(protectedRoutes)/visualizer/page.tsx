"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Loader2, Globe, Zap, History, RefreshCw, LayoutDashboard,
  AlertCircle, ChevronRight, Share2, Info, ArrowRight, Link2,
  PieChart as PieIcon, Sparkles, Users, FileText, Search
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// Dynamically import force graph for SSR compatibility
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-2xl border border-dashed">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
      <p className="text-muted-foreground font-medium">Initializing Link Visualizer...</p>
    </div>
  ),
});

interface VisualizerNode {
  id: string;
  name: string;
  val: number;
  isOrphan: boolean;
  aiSuggestion?: string | null;
}

interface VisualizerLink {
  source: string;
  target: string;
}

interface HistoryItem {
  id: string;
  domain: string;
  createdAt: string;
  totalPages: number;
  orphanPages: number;
}

interface MultiHistory {
  audit: any[];
  competitor: any[];
  content: any[];
}

export default function VisualizerPage() {
  const [url, setUrl] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [data, setData] = useState<{ nodes: VisualizerNode[]; links: VisualizerLink[] } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [multiHistory, setMultiHistory] = useState<MultiHistory>({ audit: [], competitor: [], content: [] });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isHistLoading, setIsHistLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeNode, setActiveNode] = useState<VisualizerNode | null>(null);
  const [userSiteUrl, setUserSiteUrl] = useState<string | null>(null);
  const fgRef = useRef<any>(null);

  // ── Fetch Initial Data ───────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        setLoadingHistory(true);
        const [profRes, analyticsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/analytics")
        ]);
        
        const profData = await profRes.json();
        const analyticsData = await analyticsRes.json();

        const savedUrl = profData?.user?.siteUrl;
        if (savedUrl) {
          setUserSiteUrl(savedUrl);
          if (!url) setUrl(savedUrl);
        }

        if (!analyticsData.error) {
          setMultiHistory({
            audit: analyticsData.auditHistory || [],
            competitor: analyticsData.competitorHistory || [],
            content: analyticsData.contentHistory || []
          });
        }

        await fetchHistory();
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    init();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/visualizer");
      const result = await res.json();
      if (result.data) setHistory(result.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // ── Auto-Center Graph ───────────────────────────────────────────────────
  useEffect(() => {
    if (data && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
        fgRef.current.centerAt(0, 0, 400);
      }, 100);
    }
  }, [data]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCrawl = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url) return;
    setIsCrawling(true);
    setErrorMsg("");
    setData(null);
    setActiveNode(null);
    try {
      const res = await fetch("/api/visualizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startUrl: url }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Crawl failed");
      setData(result);
      await fetchHistory();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleLoadHistory = async (projectId: string) => {
    setIsHistLoading(true);
    setErrorMsg("");
    setData(null);
    setActiveNode(null);
    try {
      const res = await fetch(`/api/visualizer?projectId=${projectId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to load history");
      setData(result);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsHistLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setUrl(userSiteUrl || "");
    setErrorMsg("");
    setActiveNode(null);
  };

  const stats = useMemo(() => {
    if (!data) return null;
    const orphans = data.nodes.filter(n => n.isOrphan).length;
    return [
      { name: "Orphans", value: orphans, color: "#f87171" },
      { name: "Connected", value: data.nodes.length - orphans, color: "#34d399" },
    ];
  }, [data]);

  const orphanNodes = useMemo(() => data?.nodes.filter(n => n.isOrphan) || [], [data]);

  const hasAnyHistory = useMemo(() => {
    return (
      history.length > 0 ||
      multiHistory.audit.length > 0 ||
      multiHistory.competitor.length > 0 ||
      multiHistory.content.length > 0
    );
  }, [history, multiHistory]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Link Visualizer</h1>
            <p className="text-muted-foreground max-w-2xl">
              Map your website's internal link architecture and discover orphan pages that need better connectivity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReset} className="h-11">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Crawl
            </Button>
            <Link href="/audit">
              <Button variant="outline" className="h-11 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Go to Audit
              </Button>
            </Link>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleCrawl} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="https://your-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-12 h-14 bg-background border-border focus:ring-2 focus:ring-indigo-500/20"
                disabled={isCrawling}
              />
            </div>
            <Button 
              type="submit" size="lg" 
              className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
              disabled={isCrawling || !url}
            >
              {isCrawling ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Zap className="mr-2 h-5 w-5 fill-current" /> Map Links</>
              )}
            </Button>
          </form>
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Recent Site Maps (Loadable) */}
        {!data && !isCrawling && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Visualizer History */}
            {history.length > 0 && (
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-bold">Recent Site Maps</h3>
                  </div>
                </div>
                <div className="p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleLoadHistory(item.id)}
                        disabled={isHistLoading}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group text-left disabled:opacity-50"
                      >
                        <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          {isHistLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Globe className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate uppercase tracking-tight">{item.domain}</p>
                          <p className="text-[10px] text-muted-foreground">{item.totalPages} pages • {item.orphanPages} orphans</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Multi-Histories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Competition History */}
              {multiHistory.competitor.length > 0 && (
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-5 border-b flex items-center gap-2 bg-muted/30">
                    <Users className="h-5 w-5 text-amber-500" />
                    <h3 className="font-bold">Competition History</h3>
                  </div>
                  <div className="p-2 flex-1">
                    <div className="space-y-1">
                      {multiHistory.competitor.slice(0, 5).map((comp, i) => (
                        <Link key={i} href="/competition" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group">
                          <div className="h-8 w-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white text-[10px] font-bold">VS</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate uppercase">{comp.competitorDomain}</p>
                            <p className="text-[10px] text-muted-foreground">Score: {comp.competitorScore}% vs You: {comp.userScore}%</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Generator History */}
              {multiHistory.content.length > 0 && (
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-5 border-b flex items-center gap-2 bg-muted/30">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-bold">Content History</h3>
                  </div>
                  <div className="p-2 flex-1">
                    <div className="space-y-1">
                      {multiHistory.content.slice(0, 5).map((content, i) => (
                        <Link key={i} href="/contentgenerator" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group">
                          <div className="h-8 w-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white"><Sparkles className="h-4 w-4" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{content.topic}</p>
                            <p className="text-[10px] text-muted-foreground">{content.wordCount} words • SEO Optimized</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Welcome - fallback if no site-map but other activity */}
            {!history.length && hasAnyHistory && (
              <div className="p-12 text-center bg-card border rounded-3xl animate-in fade-in zoom-in duration-1000">
                <div className="h-16 w-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to Map Your Links?</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">You've explored other features, but haven't visualized your architecture yet. Enter your URL above to start.</p>
              </div>
            )}
          </div>
        )}

        {/* Visualization & Main Content */}
        {data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative bg-card border rounded-2xl overflow-hidden shadow-sm h-[600px]">
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  <div className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interactive Map</div>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" /> Connected
                    </span>
                    <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 bg-red-500 rounded-full" /> Orphan
                    </span>
                  </div>
                </div>
                
                <ForceGraph2D
                  ref={fgRef}
                  graphData={data}
                  nodeLabel="name"
                  nodeColor={node => (node as any).isOrphan ? "#ef4444" : "#10b981"}
                  linkColor={() => "#94a3b8"}
                  onNodeClick={(node) => setActiveNode(node as any)}
                  backgroundColor="transparent"
                  cooldownTicks={100}
                />

                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md p-4 rounded-xl border max-w-xs transition-all animate-in slide-in-from-right-4">
                  {activeNode ? (
                    <div className="space-y-3 font-medium">
                      <h3 className="font-bold text-sm truncate">{activeNode.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${activeNode.isOrphan ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {activeNode.isOrphan ? 'Orphan' : 'Connected'}
                      </span>
                      {activeNode.aiSuggestion && (
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg text-xs italic">
                           <Zap className="h-3 w-3 inline mr-1 fill-current" /> {activeNode.aiSuggestion}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Click a node to view details.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><PieIcon className="h-5 w-5 text-indigo-500" /> Site Health</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie data={stats || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {stats?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip /><Legend verticalAlign="bottom" height={36}/>
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-4 justify-center items-center text-center">
                  <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"><AlertCircle className="h-8 w-8" /></div>
                  <h3 className="text-2xl font-bold">{orphanNodes.length} Orphans</h3>
                  <p className="text-muted-foreground text-sm">These pages have no incoming internal links, impacting their SEO visibility.</p>
                  <Button variant="outline" className="mt-2 w-full max-w-xs border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/5">Fix Now <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col h-fit">
                <div className="p-5 border-b flex items-center justify-between bg-muted/30 font-bold">
                  <h3 className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Orphan List</h3>
                  <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full">{orphanNodes.length}</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto divide-y">
                  {orphanNodes.length > 0 ? orphanNodes.map((node) => (
                    <div key={node.id} className="p-5 space-y-3 hover:bg-muted/30 transition-colors group">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold truncate pr-4">{node.name}</p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {node.aiSuggestion && (
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl text-xs font-medium">
                          <Zap className="h-3 w-3 inline mr-1.5 fill-current text-indigo-500" /> {node.aiSuggestion}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="p-10 text-center animate-pulse"><Share2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" /><p className="text-sm font-semibold text-emerald-500">All Connected!</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Blank State / Welcome - only show if NO history at all */
          !hasAnyHistory && !loadingHistory && (
            <div className="py-20 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-1000">
              <div className="h-24 w-24 bg-indigo-600 text-white rounded-4xl flex items-center justify-center shadow-2xl rotate-12 hover:rotate-0 transition-transform duration-500"><Link2 className="h-10 w-10" /></div>
              <div className="space-y-2 max-w-lg">
                <h2 className="text-2xl font-bold">Explore Your Architecture</h2>
                <p className="text-muted-foreground">Internal links are the backbone of SEO. Enter your URL to map your site and fix orphan pages.</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
