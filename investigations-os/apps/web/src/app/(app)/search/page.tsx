"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderOpen, Users } from "lucide-react";
import { useSearch } from "@/lib/queries";
import { TopBar } from "@/components/layout/top-bar";

export default function SearchPage() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const { data, isLoading } = useSearch(q);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Search" />

      <div className="p-6 max-w-3xl space-y-6">
        {q.length < 2 && (
          <p className="text-slate-400 text-sm">Enter at least 2 characters to search.</p>
        )}

        {isLoading && <p className="text-slate-400 text-sm">Searching…</p>}

        {data && data.length === 0 && q.length >= 2 && (
          <p className="text-slate-400 text-sm">No results for "{q}"</p>
        )}

        {data && data.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {data.length} result{data.length !== 1 && "s"} for "{q}"
            </p>
            {data.map((r) => (
              <div key={r.id} className="bg-white border rounded-lg p-4 hover:border-slate-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    {r.kind === "case" ? (
                      <FolderOpen className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${r.kind === "case" ? "cases" : "entities"}/${r.id}`}
                        className="font-medium hover:text-blue-600 hover:underline text-sm"
                      >
                        {r.title}
                      </Link>
                      <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded capitalize">
                        {r.kind}
                      </span>
                    </div>
                    {r.snippet && (
                      <p className="text-xs text-slate-500 mt-1 truncate">{r.snippet}</p>
                    )}
                    <div className="flex gap-3 mt-1">
                      {Object.entries(r.metadata).map(([k, v]) => (
                        <span key={k} className="text-xs text-slate-400">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
