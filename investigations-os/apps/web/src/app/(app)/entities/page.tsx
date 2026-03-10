"use client";

import { useState } from "react";
import Link from "next/link";
import { useEntities } from "@/lib/queries";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";
import { AlertTriangle, Snowflake } from "lucide-react";

const ENTITY_TYPES = ["person", "organization", "account", "device", "location", "transaction", "event"];

const TYPE_COLORS: Record<string, string> = {
  person: "bg-blue-50 text-blue-700",
  organization: "bg-purple-50 text-purple-700",
  account: "bg-green-50 text-green-700",
  device: "bg-orange-50 text-orange-700",
  location: "bg-teal-50 text-teal-700",
  transaction: "bg-yellow-50 text-yellow-700",
  event: "bg-slate-50 text-slate-700",
};

export default function EntitiesPage() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEntities({
    page,
    page_size: 25,
    entity_type: typeFilter ?? undefined,
    q: search || undefined,
    is_flagged: flaggedOnly ? true : undefined,
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Entities" />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name…"
            className="text-sm border rounded-md px-3 py-1.5 w-56"
          />
          <select
            value={typeFilter ?? ""}
            onChange={(e) => { setTypeFilter(e.target.value || null); setPage(1); }}
            className="text-sm border rounded-md px-3 py-1.5 bg-white"
          >
            <option value="">All Types</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="rounded"
            />
            Flagged only
          </label>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Risk</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Flags</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Tags</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td>
                </tr>
              )}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No entities found</td>
                </tr>
              )}
              {data?.items.map((e) => (
                <tr key={e.id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/entities/${e.id}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      {e.canonical_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", TYPE_COLORS[e.entity_type])}>
                      {e.entity_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {e.risk_score != null ? e.risk_score.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {e.is_flagged && (
                        <span title="Flagged" className="text-orange-500">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      )}
                      {e.is_frozen && (
                        <span title="Frozen" className="text-blue-400">
                          <Snowflake className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {e.tags.join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
