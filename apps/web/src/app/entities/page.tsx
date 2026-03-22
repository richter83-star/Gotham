"use client";

import { useState } from "react";
import { Search, Filter, Plus, ChevronRight, User, Hash, Zap } from "lucide-react";
import Link from "next/link";

export default function EntityExplorer() {
  const [search, setSearch] = useState("");
  
  const entities = [
    { id: "ENT-9912", name: "Selina Kyle", type: "PERSON", risk: 0.85, tags: ["Suspect", "High Value"], lastSeen: "Docklands B-4" },
    { id: "ENT-3304", name: "The Iceberg Lounge", type: "ORGANIZATION", risk: 0.62, tags: ["Front", "Financial"], lastSeen: "Diamond District" },
    { id: "ENT-1102", name: "Oswald Cobblepot", type: "PERSON", risk: 0.74, tags: ["Known Associate"], lastSeen: "Executive Sector" },
    { id: "ENT-8842", name: "Modified Laptop X-1", type: "DEVICE", risk: 0.95, tags: ["Evidence", "Technical"], lastSeen: "Encryption Lab" },
  ];

  const filtered = entities.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()));

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
          <div className="p-3 bg-accent/15 text-accent rounded-xl border border-accent/20"><User size={24} /></div>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/5">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-gradient tracking-tighter">Object Explorer</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Global Intelligence database</p>
          </div>
          <div className="flex gap-4">
             <button className="flex items-center gap-2 px-6 py-3 glass-card text-zinc-200 font-bold rounded-lg border border-white/5 transition-all text-sm">
                <Hash size={18} /> Schema
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:scale-105 transition-all text-sm">
                <Plus size={18} /> REGISTER OBJECT
             </button>
          </div>
        </header>

        <section className="flex-1 p-12 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Search */}
            <div className="flex gap-4 mb-12">
              <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-accent transition-colors" size={24} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Query entities by name, handle, or digital footprint..." 
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-6 pl-16 pr-6 text-lg font-medium focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Entity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(entity => (
                <Link href={`/entities/${entity.id}`} key={entity.id}>
                  <div className="p-8 glass-card rounded-2xl group relative overflow-hidden h-64 flex flex-col justify-between">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/20 transition-all" />
                    
                    <div className="z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-[10px] font-black text-accent uppercase tracking-widest border border-accent/20 px-3 py-1 rounded bg-accent/5">
                          {entity.type}
                        </div>
                        <div className="text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">{entity.id}</div>
                      </div>
                      <h3 className="text-2xl font-black text-zinc-100 group-hover:text-accent transition-colors mb-2">{entity.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {entity.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded italic">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="z-10 flex items-end justify-between border-t border-white/5 pt-6 mt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Risk Level</span>
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500" style={{ width: `${entity.risk * 100}%` }} />
                           </div>
                           <span className="text-xs font-bold text-rose-500">{entity.risk}</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-full border border-white/5 text-zinc-600 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
