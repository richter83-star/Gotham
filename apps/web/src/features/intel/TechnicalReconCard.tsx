"use client";

import { Cpu, Globe, Server, AlertCircle, ExternalLink, Activity } from "lucide-react";

interface TechnicalReconProps {
  data: {
    ports: number[];
    vulns: string[];
    org?: string;
    os?: string;
    ip?: string;
  };
}

export function TechnicalReconCard({ data }: TechnicalReconProps) {
  return (
    <div className="p-8 glass-panel rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden bg-white/[0.02] animate-fade-in">
      <div className="absolute top-0 right-0 p-6 opacity-5">
        <Server size={80} />
      </div>

      <header className="mb-8 relative z-10">
        <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <Activity size={14} className="animate-pulse" /> TECHNICAL RECONNAISSANCE // SOURCE: SHODAN
        </div>
        <h3 className="text-3xl font-black text-gradient tracking-tighter">Infrastructure Intelligence</h3>
      </header>

      <div className="grid grid-cols-2 gap-8 relative z-10">
        {/* Ports & Services */}
        <section className="space-y-4">
          <h4 className="text-[10px] uppercase font-black text-zinc-600 tracking-widest flex items-center gap-2">
            <Cpu size={14} /> EXPOSED NODES & PORTS
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.ports.map(port => (
              <div key={port} className="px-3 py-2 bg-white/[0.03] border border-white/5 rounded-lg group hover:border-accent/50 transition-all flex flex-col items-center min-w-[60px]">
                <span className="text-xs font-black text-zinc-100 group-hover:text-accent transition-colors">{port}</span>
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter italic">
                  {port === 80 || port === 443 ? 'WEB' : port === 22 ? 'SSH' : 'SRV'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Vulnerabilities */}
        <section className="space-y-4">
          <h4 className="text-[10px] uppercase font-black text-zinc-600 tracking-widest flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-500" /> VULNERABILITY TRACES
          </h4>
          <div className="space-y-2">
            {data.vulns.length > 0 ? data.vulns.map(vuln => (
              <div key={vuln} className="p-2.5 rounded bg-rose-500/5 border border-rose-500/20 text-rose-500 flex items-center justify-between group cursor-help">
                <span className="text-[10px] font-black tracking-widest uppercase">{vuln}</span>
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )) : (
                <div className="text-[10px] font-bold text-zinc-500 italic">No critical CVEs identified in current epoch.</div>
            )}
          </div>
        </section>

        {/* Org & OS Details */}
        <div className="col-span-2 pt-6 border-t border-white/5 grid grid-cols-3 gap-6">
            <AttribItem label="Carrier / Org" value={data.org || "Unknown"} icon={<Globe size={14} />} />
            <AttribItem label="Detected OS" value={data.os || "Linux/Unix"} icon={<Cpu size={14} />} />
            <AttribItem label="Last Scan" value="5m ago" icon={<Activity size={14} />} />
        </div>
      </div>
    </div>
  );
}

function AttribItem({ label, value, icon }: any) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1">
                {icon} {label}
            </span>
            <span className="text-xs font-black text-zinc-300 truncate">{value}</span>
        </div>
    );
}
