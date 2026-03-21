import { Search, FolderOpen, Users, AlertCircle, Settings, History as HistoryIcon, Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen bg-[#050508] relative overflow-hidden bg-grid">
      {/* Animated Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 animate-data-pulse bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

      {/* Sidebar */}
      <aside className="w-72 glass-panel flex flex-col p-6 z-10 shrink-0 border-r border-white/5">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-black text-white shadow-[0_0_25px_rgba(59,130,246,0.4)] border border-white/10">CG</div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-gradient leading-none">CASEGRAPH</span>
            <span className="text-[10px] font-bold text-primary/60 tracking-[0.2em] uppercase">Intelligence OS</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<Search size={20} />} label="Global Search" active />
          <NavItem icon={<FolderOpen size={20} />} label="Case Queue" />
          <NavItem icon={<Users size={20} />} label="Entities" />
          <NavItem icon={<AlertCircle size={20} />} label="Alerts" />
          <Link href="/admin/rules" className="block">
            <NavItem icon={<Activity size={20} />} label="Rules Engine" />
          </Link>
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
          <NavItem icon={<Settings size={20} />} label="Settings" />
          <NavItem icon={<HistoryIcon size={20} />} label="Audit Log" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-10">
          <div className="flex flex-col">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Current Sector</div>
            <div className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Gotham Global Inc.
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Operator</div>
              <div className="text-sm font-bold text-zinc-200">Bruce Wayne</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-primary/30 p-0.5 bg-primary/10">
              <div className="w-full h-full rounded-full bg-zinc-800" />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-auto p-12">
          <div className="max-w-6xl mx-auto">
            <header className="mb-16 animate-fade-in">
              <h1 className="text-5xl font-black text-gradient mb-4 tracking-tighter">Welcome, Investigator</h1>
              <p className="text-zinc-400 text-lg max-w-2xl font-medium leading-relaxed">
                CaseGraph Neural Engine is active. System integrity verified at 99.8%. 
                All investigative threads are synchronized across the Gotham Grid.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatsCard title="Pending Cases" value="24" color="text-amber-400" subtitle="+3 since last sync" />
              <StatsCard title="Open Alerts" value="156" color="text-rose-500" subtitle="12 Critical priority" />
              <StatsCard title="Action Items" value="12" color="text-blue-400" subtitle="Awaiting human triage" />
            </div>

            <div className="mt-20 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3 text-zinc-100">
                  <Activity className="text-primary animate-pulse" size={28} /> Intelligence Stream
                </h2>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 bg-primary/5 px-4 py-2 rounded hover:bg-primary/10 transition-colors">
                  View Full Audit Log
                </button>
              </div>

              <div className="glass-panel rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5">Intel Category</th>
                      <th className="px-8 py-5">Source Node</th>
                      <th className="px-8 py-5">Current Status</th>
                      <th className="px-8 py-5">Sync Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <ActivityRow 
                      action="Case Initialization" 
                      resource="#CS-2026-0032" 
                      status="Pending Triage" 
                      time="12m ago" 
                      dotColor="bg-blue-500"
                    />
                    <ActivityRow 
                      action="Entity Correlation" 
                      resource="Selina Kyle / Cat" 
                      status="Conflict Resolved" 
                      time="2h ago" 
                      dotColor="bg-green-500"
                    />
                    <ActivityRow 
                      action="Alert Escalation" 
                      resource="Financial Node X-09" 
                      status="Critical Warning" 
                      time="5h ago" 
                      dotColor="bg-red-500"
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${active ? "bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"}`}>
      <div className={`${active ? "neon-glow" : "group-hover:text-primary transition-colors"}`}>{icon}</div>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </div>
  );
}

function StatsCard({ title, value, color, subtitle }: { title: string; value: string; color: string; subtitle: string }) {
  return (
    <div className="p-8 glass-card rounded-2xl flex flex-col justify-between group cursor-pointer relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Activity size={80} />
      </div>
      <div>
        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-zinc-300 transition-colors">{title}</div>
        <div className={`text-5xl font-black tracking-tighter ${color} group-hover:scale-105 transform origin-left transition-transform duration-300 mb-2`}>{value}</div>
      </div>
      <div className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase tracking-wider">{subtitle}</div>
    </div>
  );
}

function ActivityRow({ action, resource, status, time, dotColor }: { action: string; resource: string; status: string; time: string; dotColor: string }) {
  return (
    <tr className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
      <td className="px-8 py-6 flex items-center gap-3 font-bold text-zinc-300 group-hover:text-white">
        <div className={`w-2 h-2 rounded-full ${dotColor} group-hover:scale-125 transition-transform`} /> {action}
      </td>
      <td className="px-8 py-6 text-sm font-medium text-zinc-500 group-hover:text-zinc-400">{resource}</td>
      <td className="px-8 py-6"><StatusBadge label={status} /></td>
      <td className="px-8 py-6 text-zinc-600 text-xs font-bold tracking-widest uppercase">{time}</td>
    </tr>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-md bg-white/[0.03] border border-white/5 text-zinc-400 group-hover:border-primary/30 group-hover:text-zinc-200 transition-colors">
      {label}
    </span>
  );
}
