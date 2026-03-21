import { Search, FolderOpen, Users, AlertCircle, Settings, History, Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex h-screen bg-[#0a0a0b]">
      {/* Sidebar */}
      <aside className="w-64 glass-panel flex flex-col p-4 z-10 shrink-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">CG</div>
          <span className="font-bold text-lg tracking-tight neon-text-primary">CaseGraph</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<Search size={18} />} label="Global Search" active />
          <NavItem icon={<FolderOpen size={18} />} label="Case Queue" />
          <NavItem icon={<Users size={18} />} label="Entities" />
          <NavItem icon={<AlertCircle size={18} />} label="Alerts" />
          <Link href="/admin/rules">
            <NavItem icon={<Activity size={18} />} label="Rules Engine" />
          </Link>
        </nav>

        <div className="mt-auto space-y-1">
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <NavItem icon={<History size={18} />} label="Audit Log" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-0">
        <header className="h-16 glass-panel border-b-0 border-r-0 border-t-0 flex items-center justify-between px-8">
          <div className="text-sm text-zinc-400 font-medium">Organization: <span className="text-zinc-200">Gotham Global Inc.</span></div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-zinc-400 font-normal">Investigator:</span> <span className="text-zinc-200">Bruce Wayne</span>
          </div>
        </header>

        <section className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-12">
              <h1 className="text-3xl font-bold mb-2">Welcome, Investigator</h1>
              <p className="text-zinc-500">CaseGraph is now online. Start by uploading evidence or browsing the case queue.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard title="Pending Cases" value="24" color="text-yellow-500" />
              <StatsCard title="Open Alerts" value="156" color="text-red-500" />
              <StatsCard title="Action Items" value="12" color="text-blue-500" />
            </div>

            <div className="mt-12 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="text-primary animate-pulse" /> Recent Activity
              </h2>
              <div className="glass-panel rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Resource</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a1a1b]">
                    <tr className="hover:bg-[#1a1a1b]/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-2 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Case Created
                      </td>
                      <td className="px-6 py-4 text-zinc-400">#CS-2026-0032</td>
                      <td className="px-6 py-4"><StatusBadge label="Pending Triage" /></td>
                      <td className="px-6 py-4 text-zinc-500 text-sm">2 hours ago</td>
                    </tr>
                    <tr className="hover:bg-[#1a1a1b]/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-2 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Entity Merged
                      </td>
                      <td className="px-6 py-4 text-zinc-400">Selina Kyle / Cat</td>
                      <td className="px-6 py-4"><StatusBadge label="Resolved" /></td>
                      <td className="px-6 py-4 text-zinc-500 text-sm">6 hours ago</td>
                    </tr>
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
    <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${active ? "bg-primary/20 text-primary border border-primary/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1b]"}`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function StatsCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="p-6 glass-card rounded-lg flex flex-col justify-between group cursor-pointer animate-fade-in-up">
      <div className="text-zinc-400 text-sm font-semibold mb-2 group-hover:text-zinc-200 transition-colors">{title}</div>
      <div className={`text-4xl font-black tracking-tight ${color} group-hover:scale-105 transform origin-left transition-transform`}>{value}</div>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-[#1a1a1b] border border-[#27272a] text-zinc-300">
      {label}
    </span>
  );
}
