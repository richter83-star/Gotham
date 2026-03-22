"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FolderOpen, Users, Activity, ChevronRight, Share2, MoreHorizontal, FileText, Plus, Search, Clock } from "lucide-react";
import Link from "next/link";
import { AIAssistPanel } from "@/features/ai/AIAssistPanel";
import { CaseGraphViewer } from "@/features/graph/CaseGraphViewer";
import { GeospatialViewer } from "@/features/map/GeospatialViewer";

export default function CaseDetail() {
  const params = useParams();
  const caseId = params.id as string;
  const [activeTab, setActiveTab ] = useState<"overview" | "graph" | "map" | "discovery">("overview");
  const [uploadJob, setUploadJob] = useState<{id: string, progress: number, status: string, filename: string} | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!uploadJob || uploadJob.status === "COMPLETED" || uploadJob.status === "FAILED") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/ingestion/jobs/${uploadJob.id}`);
        if (res.ok) {
          const data = await res.json();
          setUploadJob(prev => prev ? { ...prev, progress: data.progress_percent, status: data.status } : null);
        }
      } catch(err) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [uploadJob, API_URL]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", new File(["mock binary data"], "suspect_device_dump.zip"));
    formData.append("case_id", caseId);

    try {
      const res = await fetch(`${API_URL}/api/v1/ingestion/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUploadJob({ id: data.job_id, progress: 0, status: data.status, filename: data.filename });
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#050508] text-[#f4f4f9] relative overflow-hidden bg-grid">
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-data-pulse bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]" />

      {/* Sidebar Mockup */}
      <aside className="w-20 glass-panel flex flex-col items-center py-8 z-10 border-r border-white/5 shrink-0">
        <Link href="/">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-12">CG</div>
        </Link>
        <FolderOpen className="text-primary mb-6" size={24} />
        <Link href="/entities"><Users className="text-zinc-600 hover:text-zinc-300 transition-colors mb-6" size={24} /></Link>
        <Activity className="text-zinc-600 hover:text-zinc-300 transition-colors" size={24} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        {/* Header */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-10 bg-white/[0.02]">
          <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Link href="/cases" className="hover:text-primary transition-colors">Case Queue</Link>
            <ChevronRight size={14} />
            <span className="text-zinc-100">#{caseId}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-6">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Classification</span>
                <span className="text-xs font-black text-rose-500 tracking-tighter">TOP SECRET // SI</span>
             </div>
            <button className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-white/[0.05] border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
              <Share2 size={14} /> Export Report
            </button>
            <button className="p-2.5 border border-white/10 rounded-lg hover:bg-white/10 transition-all">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </header>

        {/* Tabs Bar */}
        <div className="h-14 flex items-center px-10 gap-8 border-b border-white/5 bg-white/[0.01]">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
          <TabButton active={activeTab === "graph"} onClick={() => setActiveTab("graph")} label="Graph View" />
          <TabButton active={activeTab === "map"} onClick={() => setActiveTab("map")} label="Geospatial" />
          <TabButton active={activeTab === "discovery"} onClick={() => setActiveTab("discovery")} label="OSINT Discovery" highlight />
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "overview" ? (
             <OverviewView caseId={caseId} handleUpload={handleUpload} uploadJob={uploadJob} />
          ) : activeTab === "discovery" ? (
             <DiscoveryView caseId={caseId} />
          ) : activeTab === "graph" ? (
            <div className="flex-1 p-8 animate-fade-in"><CaseGraphViewer caseId={caseId} /></div>
          ) : (
            <div className="flex-1 p-8 animate-fade-in"><GeospatialViewer caseId={caseId} /></div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, highlight = false }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative h-full px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${active ? (highlight ? "text-accent border-accent shadow-[0_4px_20px_rgba(99,102,241,0.2)]" : "text-primary border-primary") : "text-zinc-600 border-transparent hover:text-zinc-400"}`}
    >
      {label}
      {highlight && <div className="absolute top-1 right-0 w-1 h-1 rounded-full bg-accent animate-pulse" />}
    </button>
  );
}

function OverviewView({ caseId, handleUpload, uploadJob }: any) {
  return (
    <div className="flex-1 flex overflow-hidden animate-fade-in">
      <section className="w-1/3 border-r border-white/5 p-12 overflow-auto bg-white/[0.01]">
        <h2 className="text-4xl font-black text-gradient tracking-tighter mb-4">Operation Midnight Prowl</h2>
        <div className="flex gap-3 mb-12">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-primary/10 text-primary border border-primary/20">Active Discovery</span>
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">Critical</span>
        </div>

        <div className="mb-12">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4">Case Briefing</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                Comprehensive investigation into digital asset exfiltration from Wayne Enterprises. 
                Initial breach confirmed via Server Node HUB-4. Correlation patterns suggest a 
                sophisticated actor with internal infrastructure knowledge.
            </p>
        </div>

        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Correlated Entities (3)</h3>
                <Plus size={14} className="text-primary cursor-pointer" />
            </div>
            <div className="space-y-4">
                <EntityCard name="Selina Kyle" type="Person" risk="0.85" />
                <EntityCard name="The Iceberg Lounge" type="Organization" risk="0.65" />
                <EntityCard name="Modified Laptop X-1" type="Device" risk="0.92" />
            </div>
        </div>
      </section>

      <section className="flex-1 border-r border-white/5 p-12 overflow-auto bg-white/[0.02]">
        <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Activity size={16} className="text-primary" /> Investigative Timeline
        </h3>
        <div className="space-y-10 relative pl-4 border-l border-white/10 ml-2">
            <TimelineEvent time="12m ago" title="New Intel Scouted" content="OSINT Engine found matching LinkedIn record for 'S. Kyle' at suspected shell corp." user="System" highlight />
            <TimelineEvent time="3h ago" title="Evidence Extraction" content="Successfully extracted 1,200 unique metadata IDents from Device X-1." user="Bruce Wayne" />
            <TimelineEvent time="Yesterday" title="Case Initialized" content="Automated trigger from Alert #AL-0034." user="System" />
        </div>
      </section>

      <section className="w-1/4 p-8 overflow-auto space-y-8 bg-white/[0.03]">
        <AIAssistPanel />
        <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Evidence Vault</h3>
                <button onClick={handleUpload} className="p-2 border border-primary/30 rounded-lg text-primary hover:bg-primary/10 transition-all"><Plus size={16} /></button>
            </div>
            {uploadJob && (
                <div className="glass-card p-4 rounded-xl border border-primary/20 mb-4 animate-fade-in">
                    <div className="flex justify-between text-[10px] font-black text-zinc-200 uppercase mb-2">
                        <span className="truncate">{uploadJob.filename}</span>
                        <span className="text-primary">{uploadJob.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${uploadJob.progress}%` }} />
                    </div>
                </div>
            )}
            <div className="space-y-3">
                <EvidenceItem name="Security_Feed_A.mp4" size="1.2 GB" />
                <EvidenceItem name="Employee_Logs.xlsx" size="450 KB" />
            </div>
        </div>
      </section>
    </div>
  );
}

function DiscoveryView({ caseId }: any) {
  const [results, setResults] = useState([
    { source: "Google", title: "Selina Kyle - Professional Summary", snippet: "Ex-employee of Wayne Tech with expertise in encryption systems...", url: "#" },
    { source: "LinkedIn", title: "S. Kyle | Associate Consultant", snippet: "Consulting for various financial nodes in the Gotham Diamond district.", url: "#" },
    { source: "Public Records", title: "Business License: S.K. Solutions", snippet: "Registered business entity at 42nd Ave, Gotham City.", url: "#" },
  ]);

  return (
    <div className="flex-1 p-12 overflow-auto animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <header className="mb-12">
                <h2 className="text-4xl font-black text-accent tracking-tighter mb-2">OSINT Discovery Engine</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" /> Active Web Scouts scouring 12 source nodes
                </p>
            </header>

            <div className="space-y-6">
                {results.map((res, i) => (
                    <div key={i} className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Search size={60} />
                        </div>
                        <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3">{res.source} Match</div>
                        <h4 className="text-xl font-black text-zinc-100 group-hover:text-accent transition-colors mb-2">{res.title}</h4>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-4">{res.snippet}</p>
                        <div className="text-[10px] font-mono text-zinc-600 truncate">{res.url}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}

function EntityCard({ name, type, risk }: any) {
    return (
        <div className="p-4 glass-card rounded-xl border border-white/5 hover:border-primary/50 transition-all cursor-pointer group flex items-center justify-between">
            <div>
                <div className="text-sm font-black text-zinc-200 group-hover:text-primary transition-colors">{name}</div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{type}</div>
            </div>
            <div className="text-center">
                <div className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Risk</div>
                <div className="text-xs font-black text-rose-500">{risk}</div>
            </div>
        </div>
    );
}

function TimelineEvent({ time, title, content, user, highlight = false }: any) {
    return (
        <div className="relative group">
            <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border border-white/10 bg-zinc-900 z-10 ${highlight ? "border-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]" : ""}`} />
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex justify-between">
                <span>{time}</span> 
                <span className="text-zinc-600">BY {user}</span>
            </div>
            <div className={`text-sm font-black mb-1 ${highlight ? "text-accent" : "text-zinc-200"}`}>{title}</div>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">{content}</p>
        </div>
    );
}

function EvidenceItem({ name, size }: any) {
    return (
        <div className="p-4 glass-card rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <FileText size={16} className="text-zinc-500 group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors truncate w-32">{name}</span>
            </div>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{size}</span>
        </div>
    );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-md bg-white/[0.03] border border-white/5 text-zinc-400 group-hover:border-primary/30 group-hover:text-zinc-200 transition-colors">
      {label}
    </span>
  );
}

function TaskItem({ label, done = false }: any) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className={`w-4 h-4 rounded border border-white/10 flex items-center justify-center ${done ? "bg-green-500/20 border-green-500/40" : ""}`}>
        {done && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
      </div>
      <div className={`text-xs ${done ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-zinc-100 font-medium"}`}>{label}</div>
    </div>
  );
}
