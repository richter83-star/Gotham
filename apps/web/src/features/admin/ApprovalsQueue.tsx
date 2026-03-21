"use client";

import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Clock, Info } from "lucide-react";

export function ApprovalsQueue() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/approvals/?status=PENDING`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch approvals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const handleDecision = async (id: string, decision: "approve" | "deny") => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/approvals/${id}/${decision}`, {
        method: "POST"
      });
      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== id));
      }
    } catch (error) {
      console.error(`Failed to ${decision} request`, error);
    }
  };

  if (loading) return <div className="p-4 text-zinc-500 animate-pulse">Loading approvals queue...</div>;

  return (
    <div className="bg-[#0c0c0d] border border-[#1a1a1b] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#1a1a1b] flex items-center justify-between">
        <h2 className="font-bold text-zinc-100 flex items-center gap-2">
          <ShieldAlert size={16} className="text-yellow-500" />
          Pending Approvals
        </h2>
        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded font-bold">
          {requests.length} Actions Required
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 text-sm">
          No pending approvals at this time.
        </div>
      ) : (
        <div className="divide-y divide-[#1a1a1b]">
          {requests.map((req) => (
            <div key={req.id} className="p-4 hover:bg-[#1a1a1b]/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded uppercase">
                      {req.action_type}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDecision(req.id, "deny")}
                    className="p-1.5 rounded border border-[#27272a] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors"
                    title="Deny"
                  >
                    <X size={14} />
                  </button>
                  <button 
                    onClick={() => handleDecision(req.id, "approve")}
                    className="p-1.5 rounded border border-[#27272a] hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 transition-colors"
                    title="Approve"
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-300 font-medium mb-1">
                Target Resource: <span className="text-blue-400">{req.target_resource_id}</span>
              </p>
              {req.notes && (
                <div className="mt-3 p-3 bg-[#0a0a0b] border border-[#1a1a1b] rounded text-xs text-zinc-400 flex items-start gap-2">
                  <Info size={14} className="text-zinc-500 mt-0.5" />
                  <span className="italic">"{req.notes}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
