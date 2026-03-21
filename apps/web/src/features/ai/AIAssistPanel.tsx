"use client";

import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

export function AIAssistPanel() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("Operation Midnight Prowl involves a suspected digital asset theft targeting Wayne Enterprises sub-level 4 servers. Primary suspect 'Selina Kyle' has been flagged due to signal intercepts at The Iceberg Lounge.");

  const generateSummary = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="bg-[#0c0c0d] border border-primary/20 rounded-lg overflow-hidden flex flex-col h-full shadow-[0_0_20px_rgba(59,130,246,0.05)]">
      <div className="p-4 border-b border-[#1a1a1b] bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles size={16} />
          <h2 className="text-xs font-bold uppercase tracking-wider">Investigator Assist</h2>
        </div>
        <button 
          onClick={generateSummary}
          className="p-1 hover:bg-primary/10 rounded transition-colors text-zinc-500 hover:text-primary"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <section>
          <h3 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-2">Executive Summary</h3>
          <p className="text-xs text-zinc-400 leading-relaxed italic">
            "{summary}"
          </p>
        </section>

        <section>
          <h3 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-3">Recommended Actions</h3>
          <div className="space-y-2">
            <RecommendationItem text="Verify MAC address against HUB-4 logs" priority="HIGH" />
            <RecommendationItem text="Cross-reference recent travels for S. Kyle" priority="MEDIUM" />
            <RecommendationItem text="Request The Penguin's associate registry" priority="LOW" />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest mb-3">Entity Alerts</h3>
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
             <div className="flex items-center gap-2 text-red-500 text-xs font-bold mb-1">
               <AlertCircle size={14} /> High-Risk Connection
             </div>
             <p className="text-[10px] text-zinc-500 italic leading-snug">
               Subject 'Selina Kyle' is within 500m of target infrastructure. Suggest escalation.
             </p>
          </div>
        </section>
      </div>

      <div className="p-3 border-t border-[#1a1a1b] bg-[#0c0c0d]">
        <button className="w-full py-2 bg-primary text-white text-[10px] font-bold uppercase rounded hover:bg-primary/90 transition-all flex items-center justify-center gap-2 tracking-widest">
          Generate Full Intel Report <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function RecommendationItem({ text, priority }: { text: string, priority: string }) {
  const color = priority === "HIGH" ? "text-red-400" : priority === "MEDIUM" ? "text-yellow-400" : "text-zinc-400";
  return (
    <div className="flex items-start gap-3 group cursor-pointer">
      <CheckCircle2 size={14} className="text-zinc-700 group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
      <div className="text-[11px] text-zinc-400 group-hover:text-zinc-200 leading-tight">
        {text} <span className={`text-[9px] font-bold ${color}`}>[{priority}]</span>
      </div>
    </div>
  );
}
