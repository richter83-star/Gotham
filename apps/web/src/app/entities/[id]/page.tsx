"use client";

import { useParams } from "next/navigation";
import { Users, AlertTriangle, Briefcase, ChevronRight, ShieldCheck, Fingerprint, MapPin, Globe, Zap, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EntityProfile() {
  const params = useParams();
  const entityId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "analysis" | "osint">("overview");

  return (
    <main className="flex h-screen bg-[#050508] relative overflow-hidden bg-grid">
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-data-pulse bg-[radial-gradient(circle_at_0%_100%,rgba(99,102,241,0.1),transparent_70%)]" />

      {/* Mini Sidebar */}
      <aside className="w-20 glass-panel flex flex-col items-center py-8 z-10 border-r border-white/5 shrink-0">
        <Link href="/">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-12">CG</div>
        </Link>
        <nav className="flex flex-col gap-6 text-zinc-600">
          <Link href="/cases" className="hover:text-zinc-300 transition-colors"><Zap size={24} /></Link>
          <Link href="/entities" className="text-accent"><Users size={24} /></Link>
        </nav>
      </aside>

      {/* Profile Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="h-64 glass-panel border-b border-white/5 relative flex items-end p-12 bg-white/[0.02]">
           <div className="flex gap-10 items-center">
              <div className="w-32 h-32 rounded-2xl bg-white/[0.03] border-2 border-accent flex items-center justify-center text-4xl font-black text-gradient shadow-[0_0_40px_rgba(99,102,241,0.2)]">SK</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-5xl font-black text-gradient tracking-tighter">Selina Kyle</h1>
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md">High Risk</span>
                </div>
                <div className="flex gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Fingerprint size={14} className="text-accent" /> ID: {entityId}</span>
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-accent" /> Sector: Gotham B-4</span>
                  <span className="flex items-center gap-2"><Globe size={14} className="text-accent" /> Confidence: 0.98</span>
                </div>
              </div>
           </div>
           <div className="ml-auto flex gap-4">
              <button className="px-6 py-3 glass-card rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-300 border border-white/10 hover:bg-white/5 transition-all">Merge Object</button>
              <button className="px-6 py-3 bg-accent text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 transition-all">Initiate Scout</button>
           </div>
        </header>

        {/* Profile Tabs */}
        <div className="h-14 flex items-center px-12 gap-10 border-b border-white/5 bg-white/[0.01]">
           <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Intelligence Overview" />
           <TabButton active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")} label="Correlation Analysis" />
           <TabButton active={activeTab === "osint"} onClick={() => setActiveTab("osint")} label="OSINT Discovery" highlight />
        </div>

        <div className="flex-1 overflow-auto p-12">
           <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10">
              {/* Main Attributes */}
              <div className="col-span-8 space-y-12">
                 <section>
                    <h2 className="text-xs uppercase text-zinc-600 font-black tracking-[0.2em] mb-6">Neural Graph Links</h2>
                    <div className="grid grid-cols-2 gap-6">
                       <RelationCard name="The Iceberg Lounge" type="Organization" label="Infrastructure Associate" confidence="0.94" />
                       <RelationCard name="Modified Laptop X-1" type="Device" label="Digital Signature" confidence="1.00" />
                       <RelationCard name="Oswald Cobblepot" type="Person" label="Direct Correlation" confidence="0.72" />
                       <RelationCard name="Wayne Enterprises" type="Organization" label="Target Attribution" confidence="0.88" />
                    </div>
                 </section>

                 <section>
                    <h2 className="text-xs uppercase text-zinc-600 font-black tracking-[0.2em] mb-6">Investigation Logs</h2>
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5 shadow-2xl">
                       <IncidentRow id="CS-2026-0032" title="Operation Midnight Prowl" date="Mar 20, 2026" status="Active Discovery" role="Primary Suspect" />
                       <IncidentRow id="CS-2025-1102" title="Jewel Heist A-4" date="Nov 12, 2025" status="Closed // Unresolved" role="Subject Mentioned" />
                    </div>
                 </section>
              </div>

              {/* Side Intel */}
              <div className="col-span-4 space-y-8">
                 <section className="p-8 glass-panel rounded-2xl border border-white/5 shadow-xl">
                    <h2 className="text-xs uppercase text-zinc-600 font-black tracking-[0.2em] mb-6 flex items-center gap-2">
                       <AlertTriangle size={16} className="text-rose-500 animate-pulse" /> Anomalous Flags (3)
                    </h2>
                    <ul className="space-y-4">
                       <FlagItem label="Multi-Alias Fingerprint" />
                       <FlagItem label="High-Value Proximity Trace" high />
                       <FlagItem label="Standard Crypto Signature" />
                    </ul>
                 </section>

                 <section className="p-8 glass-panel rounded-2xl border border-white/5 shadow-xl bg-accent/[0.02]">
                    <h2 className="text-xs uppercase text-zinc-600 font-black tracking-[0.2em] mb-6 flex items-center gap-2">
                       <ShieldCheck size={16} className="text-green-500" /> Vetting Integrity
                    </h2>
                    <div className="space-y-6">
                        <IntegrityStat label="Trust Score" value="98%" />
                        <IntegrityStat label="Data Richness" value="84/100" />
                        <div className="pt-4 border-t border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Last Synced: 4h ago</div>
                    </div>
                 </section>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, label, highlight = false }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative h-full px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${active ? (highlight ? "text-accent border-accent" : "text-primary border-primary") : "text-zinc-600 border-transparent hover:text-zinc-400"}`}
    >
      {label}
      {highlight && <div className="absolute top-0 -right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
    </button>
  );
}

function RelationCard({ name, type, label, confidence }: any) {
  return (
    <div className="p-6 glass-card rounded-2xl border border-white/5 hover:border-accent/40 transition-all cursor-pointer group flex items-center justify-between overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Users size={40} />
      </div>
      <div className="z-10">
        <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{label}</div>
        <div className="text-lg font-black text-zinc-100 group-hover:text-accent transition-colors">{name}</div>
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{type}</div>
      </div>
      <div className="z-10 text-right">
        <div className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-widest">Confidence</div>
        <div className="text-sm font-black text-zinc-200">{confidence}</div>
      </div>
    </div>
  );
}

function IncidentRow({ id, title, date, status, role }: any) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all cursor-pointer group">
      <div className="flex gap-6 items-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-accent group-hover:border-accent/30 transition-all">
          <Briefcase size={20} />
        </div>
        <div>
          <div className="text-base font-black text-zinc-200 group-hover:text-accent transition-colors">{title}</div>
          <div className="text-[10px] font-bold text-zinc-500 flex gap-3 uppercase tracking-widest mt-1">
            <span className="flex items-center gap-1.5 text-zinc-600 tracking-normal"><FileText size={12} /> {id}</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-black text-zinc-300 mb-1">{role}</div>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">{status}</div>
      </div>
    </div>
  );
}

function FlagItem({ label, high = false }: { label: string, high?: boolean }) {
  return (
    <li className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-default">
      <div className={`w-2 h-2 rounded-full ${high ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"}`} />
      <span className="text-xs font-bold text-zinc-400">{label}</span>
      {high && <ChevronRight size={12} className="ml-auto text-rose-500" />}
    </li>
  );
}

function IntegrityStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black text-zinc-100">{value}</span>
        </div>
    );
}
