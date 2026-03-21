"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FolderOpen, Users, FileText, Activity, Clock, ChevronRight, Share2, MoreHorizontal } from "lucide-react";
import { AIAssistPanel } from "@/features/ai/AIAssistPanel";
import { CaseGraphViewer } from "@/features/graph/CaseGraphViewer";
import { GeospatialViewer } from "@/features/map/GeospatialViewer";

export default function CaseDetail() {
  const params = useParams();
  const caseId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "graph" | "map">("overview");
  const [uploadJob, setUploadJob] = useState<{id: string, progress: number, status: string, filename: string} | null>(null);

  useEffect(() => {
    if (!uploadJob || uploadJob.status === "COMPLETED" || uploadJob.status === "FAILED") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/ingestion/jobs/${uploadJob.id}`);
        if (res.ok) {
          const data = await res.json();
          setUploadJob(prev => prev ? { ...prev, progress: data.progress_percent, status: data.status } : null);
        }
      } catch(err) {}
    }, 1000);
    return () => clearInterval(interval);
  }, [uploadJob]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", new File(["mock binary data"], "suspect_device_dump.zip"));
    formData.append("case_id", caseId);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/ingestion/upload`, {
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
    <div className="flex h-screen bg-[#0a0a0b] text-[#f4f4f5]">
      {/* Sidebar Mockup (collapsed version or similar to home) */}
      <aside className="w-16 border-r border-[#1a1a1b] bg-[#0c0c0d] flex flex-col items-center py-4 gap-6">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white text-xs">CG</div>
        <FolderOpen className="text-primary" size={20} />
        <Users className="text-zinc-500" size={20} />
        <Activity className="text-zinc-500" size={20} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#1a1a1b] flex items-center justify-between px-8 bg-[#0c0c0d]">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span>Case Queue</span>
            <ChevronRight size={14} />
            <span className="text-zinc-100 font-medium">#{caseId}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 text-xs font-medium border border-[#27272a] rounded hover:bg-[#1a1a1b] transition-colors flex items-center gap-2">
              <Share2 size={14} /> Export Report
            </button>
            <button className="p-1.5 border border-[#27272a] rounded hover:bg-[#1a1a1b] transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex px-8 border-b border-[#1a1a1b] bg-[#0c0c0d] items-center gap-6">
          <div className="flex bg-[#1a1a1b] p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab("overview")} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "overview" ? "bg-[#27272a] text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("graph")} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "graph" ? "bg-[#27272a] text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Graph View
            </button>
            <button 
              onClick={() => setActiveTab("map")} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "map" ? "bg-[#27272a] text-white shadow" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "overview" ? (
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Summary & Entities */}
              <section className="w-1/3 border-r border-[#1a1a1b] p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Operation Midnight Prowl</h1>
                <div className="flex gap-2 mb-6">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">Active</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-500/10 text-red-500 border border-red-500/20">High Priority</span>
                </div>

                <div className="mb-8">
                  <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-3">Description</h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Coordinate theft of digital assets from Wayne Enterprises secondary accounts. Initial breach detected in Sub-level 4 servers. Pattern suggests internal knowledge.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-4 flex justify-between items-center">
                    <span>Involved Entities (3)</span>
                    <button className="text-primary hover:underline lowercase font-normal">Add Entity</button>
                  </h3>
                  <div className="space-y-3">
                    <EntityCard name="Selina Kyle" type="Person" risk="0.85" />
                    <EntityCard name="The Iceberg Lounge" type="Organization" risk="0.65" />
                    <EntityCard name="Modified Laptop X-1" type="Device" risk="0.92" />
                  </div>
                </div>
              </section>

              {/* Middle: Timeline */}
              <section className="flex-1 border-r border-[#1a1a1b] p-6 overflow-auto">
                <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-6 flex items-center gap-2">
                  <Clock size={14} /> Investigation Timeline
                </h2>
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-[#1a1a1b]">
                  <TimelineEvent 
                    time="2 hours ago" 
                    title="Case Escalated" 
                    user="System" 
                    content="Case priority changed from MEDIUM to HIGH based on 'Selina Kyle' proximity query." 
                  />
                  <TimelineEvent 
                    time="6 hours ago" 
                    title="New Evidence Attached" 
                    user="Bruce Wayne" 
                    content="Attached 'Docklands_Security_Log.csv' with 3 matches for modified device MAC address." 
                    isEvidence
                  />
                  <TimelineEvent 
                    time="Yesterday" 
                    title="Investigation Started" 
                    user="System" 
                    content="Case initialized from Alert #AL-0034 (Unauthorized API Access)." 
                  />
                </div>
              </section>

              {/* Right: Evidence & AI Assist */}
              <section className="w-1/4 p-6 overflow-auto bg-[#0c0c0d] space-y-8">
                <div className="h-1/2">
                  <AIAssistPanel />
                </div>
                
                <div className="h-1/2 overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider flex items-center gap-2">
                      <FileText size={14} /> Evidence Panel
                    </h2>
                    <button onClick={handleUpload} className="text-[10px] font-bold uppercase text-primary border border-primary/20 px-2 py-1 rounded hover:bg-primary/10 transition-colors">
                      Upload
                    </button>
                  </div>

                  {uploadJob && (
                    <div className="mb-4 p-3 bg-[#1a1a1b] rounded border border-[#27272a]">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-zinc-300 truncate mr-2">{uploadJob.filename}</span>
                        <span className="text-primary font-bold">{uploadJob.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0a0a0b] rounded overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${uploadJob.progress}%` }} />
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-2 uppercase font-bold tracking-wider flex items-center justify-between">
                        {uploadJob.status === "COMPLETED" ? "Extraction Finished" : "Processing Evidence..."}
                        {uploadJob.status !== "COMPLETED" && uploadJob.status !== "FAILED" && (
                          <div className="animate-spin w-2 h-2 border-2 border-primary border-t-transparent rounded-full" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <EvidenceItem name="Security_Feed_A.mp4" size="1.2 GB" />
                    <EvidenceItem name="Employee_Logs.xlsx" size="450 KB" />
                    <EvidenceItem name="Signal_Intercept.pdf" size="2.1 MB" />
                  </div>

                  <div className="mt-8">
                    <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-4">Pending Tasks</h2>
                    <div className="space-y-3">
                      <TaskItem label="Review security logs" done />
                      <TaskItem label="Verify entity address" />
                      <TaskItem label="Request server access" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : activeTab === "graph" ? (
            <div className="flex-1 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
              <CaseGraphViewer caseId={caseId} />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
              <GeospatialViewer caseId={caseId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EntityCard({ name, type, risk }: { name: string, type: string, risk: string }) {
  const riskFloat = parseFloat(risk);
  const riskColor = riskFloat > 0.8 ? "text-red-500" : riskFloat > 0.6 ? "text-yellow-500" : "text-green-500";
  
  return (
    <div className="p-3 border border-[#1a1a1b] rounded-lg bg-[#0c0c0d] hover:border-[#27272a] transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium group-hover:text-primary transition-colors">{name}</div>
        <div className={`text-xs font-bold ${riskColor}`}>{risk}</div>
      </div>
      <div className="text-xs text-zinc-500">{type}</div>
    </div>
  );
}

function TimelineEvent({ time, title, user, content, isEvidence = false }: any) {
  return (
    <div className="relative pl-8 group">
      <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border border-[#1a1a1b] bg-[#0a0a0b] flex items-center justify-center z-10 group-hover:border-primary transition-colors`}>
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-primary" />
      </div>
      <div className="text-[10px] text-zinc-500 mb-1 flex justify-between">
        <span>{time}</span>
        <span className="font-medium text-zinc-400">By {user}</span>
      </div>
      <div className="text-sm font-bold mb-1">{title}</div>
      <p className="text-xs text-zinc-400 leading-relaxed">{content}</p>
      {isEvidence && (
        <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10 text-[10px] text-primary flex items-center gap-2">
          <FileText size={12} /> View Associated Evidence
        </div>
      )}
    </div>
  );
}

function EvidenceItem({ name, size }: any) {
  return (
    <div className="p-2 border border-[#1a1a1b] rounded flex items-center justify-between hover:bg-[#1a1a1b]/30 cursor-pointer transition-colors group">
      <div className="flex items-center gap-2 min-w-0">
        <FileText size={14} className="text-zinc-500 group-hover:text-zinc-300" />
        <span className="text-xs text-zinc-400 truncate group-hover:text-zinc-200">{name}</span>
      </div>
      <span className="text-[10px] text-zinc-600 flex-shrink-0">{size}</span>
    </div>
  );
}

function TaskItem({ label, done = false }: any) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className={`w-4 h-4 rounded border border-[#1a1a1b] flex items-center justify-center ${done ? "bg-green-500/20 border-green-500/40" : ""}`}>
        {done && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
      </div>
      <div className={`text-xs ${done ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-zinc-100"}`}>{label}</div>
    </div>
  );
}
