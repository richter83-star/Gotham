"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { FileText, CheckSquare, MessageSquare, Network, AlertTriangle } from "lucide-react";
import { useCase, useAddCaseNote } from "@/lib/queries";
import { TopBar } from "@/components/layout/top-bar";
import { cn, STATUS_COLORS, PRIORITY_COLORS, formatStatus } from "@/lib/utils";

type Tab = "overview" | "entities" | "evidence" | "notes" | "tasks" | "timeline";

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [noteBody, setNoteBody] = useState("");

  const { data: caseData, isLoading } = useCase(id);
  const addNote = useAddCaseNote(id);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "entities", label: "Entities", icon: Network },
    { id: "evidence", label: "Evidence", icon: AlertTriangle },
    { id: "notes", label: "Notes", icon: MessageSquare },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "timeline", label: "Timeline", icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Loading case…
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <div className="flex flex-col h-full">
      <TopBar title={caseData.case_number} />

      <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{caseData.title}</h2>
            {caseData.description && (
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">{caseData.description}</p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", STATUS_COLORS[caseData.status])}>
              {formatStatus(caseData.status)}
            </span>
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize", PRIORITY_COLORS[caseData.priority])}>
              {caseData.priority}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Risk Score", value: caseData.risk_score != null ? caseData.risk_score.toFixed(1) : "—" },
            { label: "Created", value: format(new Date(caseData.created_at), "MMM d, yyyy") },
            { label: "Updated", value: format(new Date(caseData.updated_at), "MMM d, yyyy HH:mm") },
            { label: "Tags", value: caseData.tags.join(", ") || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border rounded-lg p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-medium mt-1 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-1">
            {TABS.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px",
                  activeTab === tabId
                    ? "border-slate-900 text-slate-900 font-medium"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-white border rounded-lg p-6 min-h-64">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-700">Case Summary</h3>
              <p className="text-sm text-slate-500">
                {caseData.description ?? "No description provided."}
              </p>
              <div className="pt-4 border-t">
                <p className="text-xs text-slate-400">
                  AI-generated summary available after Sprint 4 AI service integration.
                </p>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-700">Case Notes</h3>
              <div className="space-y-2">
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  placeholder="Add a note…"
                />
                <button
                  onClick={async () => {
                    if (!noteBody.trim()) return;
                    await addNote.mutateAsync(noteBody);
                    setNoteBody("");
                  }}
                  disabled={addNote.isPending || !noteBody.trim()}
                  className="text-sm bg-slate-900 text-white rounded-md px-4 py-2 hover:bg-slate-700 disabled:opacity-50"
                >
                  {addNote.isPending ? "Saving…" : "Add Note"}
                </button>
              </div>
            </div>
          )}

          {(activeTab === "entities" ||
            activeTab === "evidence" ||
            activeTab === "tasks" ||
            activeTab === "timeline") && (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel — Sprint 2 / 3
            </div>
          )}
        </div>

        {/* Decision buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Close — Confirmed", type: "close_confirmed", variant: "green" },
            { label: "Close — Unsubstantiated", type: "close_unsubstantiated", variant: "slate" },
            { label: "Escalate", type: "escalate", variant: "red" },
            { label: "Request Evidence", type: "request_more_evidence", variant: "blue" },
          ].map(({ label, type, variant }) => (
            <button
              key={type}
              className={cn(
                "text-sm rounded-md px-4 py-2 border font-medium transition-colors",
                variant === "green" && "border-green-300 text-green-700 hover:bg-green-50",
                variant === "slate" && "border-slate-300 text-slate-600 hover:bg-slate-50",
                variant === "red" && "border-red-300 text-red-700 hover:bg-red-50",
                variant === "blue" && "border-blue-300 text-blue-700 hover:bg-blue-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
