"use client";

import { useParams } from "next/navigation";
import { Users, Link2, AlertTriangle, Briefcase, ExternalLink, ShieldCheck, Fingerprint, MapPin } from "lucide-react";

export default function EntityProfile() {
  const params = useParams();
  const entityId = params.id as string;

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-[#f4f4f5]">
      {/* Mini Sidebar */}
      <aside className="w-16 border-r border-[#1a1a1b] bg-[#0c0c0d] flex flex-col items-center py-4 gap-6">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-white text-xs">CG</div>
        <Users className="text-primary" size={20} />
      </aside>

      {/* Profile Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-48 border-b border-[#1a1a1b] bg-[#0c0c0d] relative p-8 flex items-end">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-full bg-[#1a1a1b] border-2 border-primary flex items-center justify-center text-3xl font-bold">SK</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Selina Kyle</h1>
              <div className="flex gap-3 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5"><Fingerprint size={14} /> ID: {entityId}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> Gotham City</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex gap-3 text-sm">
            <div className="px-4 py-2 border border-[#1a1a1b] rounded bg-red-500/10 text-red-500 font-bold border-red-500/20">Risk: 0.85</div>
          </div>
        </header>

        <div className="p-8 grid grid-cols-12 gap-8">
          {/* Main Attributes */}
          <div className="col-span-8 space-y-8">
            <section>
              <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-4">Core Relationships</h2>
              <div className="grid grid-cols-2 gap-4">
                <RelationCard name="The Iceberg Lounge" type="Organization" label="Associated With" confidence="0.94" />
                <RelationCard name="Modified Laptop X-1" type="Device" label="Recently Used" confidence="1.00" />
                <RelationCard name="Oswald Cobblepot" type="Person" label="Business Associate" confidence="0.72" />
                <RelationCard name="Wayne Enterprises" type="Organization" label="Investigation Target" confidence="0.88" />
              </div>
            </section>

            <section>
              <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-4">Incident Involvement</h2>
              <div className="border border-[#1a1a1b] rounded-lg overflow-hidden bg-[#0c0c0d]">
                 <IncidentRow id="CS-2026-0032" title="Operation Midnight Prowl" date="Mar 20, 2026" status="Active" role="Primary Suspect" />
                 <IncidentRow id="CS-2025-1102" title="Jewel Heist A-4" date="Nov 12, 2025" status="Closed" role="Mentioned" />
              </div>
            </section>
          </div>

          {/* Side Info */}
          <div className="col-span-4 space-y-8">
            <section className="p-6 border border-[#1a1a1b] rounded-lg bg-[#0c0c0d]">
              <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" /> Intelligence Flags
              </h2>
              <ul className="space-y-3">
                <FlagItem label="Multi-alias usage detected" />
                <FlagItem label="Proximity to high-value infrastructure" high />
                <FlagItem label="Encryption signature match" />
              </ul>
            </section>

            <section className="p-6 border border-[#1a1a1b] rounded-lg bg-[#0c0c0d]">
              <h2 className="text-xs uppercase text-zinc-500 font-bold tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-500" /> Verification
              </h2>
              <div className="text-xs text-zinc-400 space-y-3">
                <div className="flex justify-between">
                  <span>Last KYC Refresh</span>
                  <span className="text-zinc-200">2 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Source Coverage</span>
                  <span className="text-zinc-200">12 datasets</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelationCard({ name, type, label, confidence }: any) {
  return (
    <div className="p-4 border border-[#1a1a1b] rounded-lg bg-[#111112] hover:bg-[#1a1a1b]/50 cursor-pointer transition-colors flex items-center justify-between group">
      <div>
        <div className="text-[10px] text-primary uppercase font-bold tracking-tight mb-0.5">{label}</div>
        <div className="font-medium group-hover:text-primary transition-colors">{name}</div>
        <div className="text-xs text-zinc-500">{type}</div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-zinc-500 mb-1">Confidence</div>
        <div className="text-xs font-mono">{confidence}</div>
      </div>
    </div>
  );
}

function IncidentRow({ id, title, date, status, role }: any) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#1a1a1b] last:border-0 hover:bg-[#1a1a1b]/20 cursor-pointer group">
      <div className="flex gap-4 items-center">
        <div className="w-10 h-10 rounded bg-[#1a1a1b] flex items-center justify-center">
          <Briefcase size={18} className="text-zinc-500 group-hover:text-zinc-300" />
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-zinc-500 flex gap-2">
            <span>{id}</span> • <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-medium text-zinc-300">{role}</div>
        <div className="text-[10px] uppercase text-zinc-500">{status}</div>
      </div>
    </div>
  );
}

function FlagItem({ label, high = false }: { label: string, high?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <div className={`w-1.5 h-1.5 rounded-full ${high ? "bg-red-500" : "bg-yellow-500"}`} />
      <span className="text-zinc-400">{label}</span>
      {high && <ExternalLink size={10} className="ml-auto text-zinc-600" />}
    </li>
  );
}
