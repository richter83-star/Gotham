"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useCases } from "@/lib/queries";
import { useCaseFilters } from "@/lib/store";
import { TopBar } from "@/components/layout/top-bar";
import { cn, STATUS_COLORS, PRIORITY_COLORS, formatStatus } from "@/lib/utils";

const STATUSES = [
  "new", "triage", "active_investigation", "awaiting_evidence",
  "pending_approval", "closed_confirmed", "closed_unsubstantiated", "escalated",
];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function CaseQueuePage() {
  const { status, priority, setFilter } = useCaseFilters();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useCases({
    page,
    page_size: 25,
    status: status ?? undefined,
    priority: priority ?? undefined,
  });

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Case Queue" />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={status ?? ""}
            onChange={(e) => setFilter("status", e.target.value || null)}
            className="text-sm border rounded-md px-3 py-1.5 bg-white"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>

          <select
            value={priority ?? ""}
            onChange={(e) => setFilter("priority", e.target.value || null)}
            className="text-sm border rounded-md px-3 py-1.5 bg-white"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p} className="capitalize">{p}</option>
            ))}
          </select>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 text-sm border rounded-md px-3 py-1.5 hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              href="/cases/new"
              className="flex items-center gap-1.5 text-sm bg-slate-900 text-white rounded-md px-3 py-1.5 hover:bg-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              New Case
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Case #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Risk</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No cases found
                  </td>
                </tr>
              )}
              {data?.items.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.case_number}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/cases/${c.id}`}
                      className="font-medium hover:text-blue-600 hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[c.status])}>
                      {formatStatus(c.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", PRIORITY_COLORS[c.priority])}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.risk_score != null ? c.risk_score.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {format(new Date(c.updated_at), "MMM d, yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{data.total} cases</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-slate-500">
                {page} / {data.pages}
              </span>
              <button
                disabled={page === data.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
