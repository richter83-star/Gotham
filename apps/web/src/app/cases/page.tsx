"use client";

import { useState } from "react";
import { Search, Filter, Plus, ChevronRight, Clock, Shield } from "lucide-react";
import Link from "next/link";

export default function CaseQueue() {
  const [search, setSearch] = useState("");
  
  const cases = [
    { id: "CS-2026-0032", title: "Operation Midnight Prowl", priority: "HIGH", status: "OPEN", category: "CYBER", lastUpdate: "12m ago" },
    { id: "CS-2026-0031", title: "Financial Node X-09 Breach", priority: "MEDIUM", status: "PENDING", category: "FINANCIAL", lastUpdate: "3h ago" },
    { id: "CS-2026-0028", title: "Subject: Oswald / Assoc Identification", priority: "LOW", status: "CLOSED", category: "FRAUD", lastUpdate: "1d ago" },
    { id: "CS-2026-0025", title: "Asset Recovery: Waynetech V3", priority: "HIGH", status: "OPEN", category: "THEFT", lastUpdate: "2d ago" },
  ];

  const filteredCases = cases.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="flex h-screen bg-[#050508] relative overflow-hidden bg-grid">
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-data-pulse bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]" />

      {/* Mini Sidebar */}
      <aside className="w-20 glass-panel flex flex-col items-center py-8 z-10 border-r border-white/5 shrink-0">
        <Link href="/">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-12">CG</div>
        </Link>
        <nav className="flex flex-col gap-6">
          <div className="p-3 bg-primary/15 text-primary rounded-xl border border-primary/20"><Shield size={24} /></div>
          <div className="p-3 text-zinc-600 hover:text-zinc-300 transition-colors"><Search size={24} /></div>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/5">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-gradient tracking-tighter">Case Queue</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gotham Central Investigative Division</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:scale-105 transition-all text-sm">
            <Plus size={18} /> INITIALIZE CASE
          </button>
        </header>

        <section className="flex-1 p-12 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Search & Filter Bar */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by title, ID, or entity..." 
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-4 glass-card rounded-xl text-zinc-400 hover:text-zinc-100 transition-colors font-bold text-xs uppercase tracking-widest">
                <Filter size={18} /> Filters
              </button>
            </div>

            {/* Case List */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <table className="w-full text-left">
                <thead className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Sector</th>
                    <th className="px-8 py-6">Priority</th>
                    <th className="px-8 py-6">Integrity</th>
                    <th className="px-8 py-6">Last Sync</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCases.map(caseRef => (
                    <tr key={caseRef.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-200 group-hover:text-primary transition-colors">{caseRef.title}</span>
                          <span className="text-[10px] font-mono text-zinc-500 mt-1">{caseRef.id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className="text-xs font-bold text-zinc-400 border border-white/5 px-3 py-1.5 rounded bg-white/[0.02]">{caseRef.category}</span>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${caseRef.priority === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className={`text-[10px] font-black tracking-widest ${caseRef.priority === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`}>{caseRef.priority}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] rounded-md bg-white/[0.03] border border-white/5 px-3 py-1.5 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          {caseRef.status}
                        </span>
                      </td>
                      <td className="px-8 py-8 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{caseRef.lastUpdate}</td>
                      <td className="px-8 py-8 text-right">
                        <Link href={`/cases/${caseRef.id}`}>
                          <div className="p-2 text-zinc-600 group-hover:text-primary group-hover:scale-125 transition-all">
                            <ChevronRight size={20} />
                          </div>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
