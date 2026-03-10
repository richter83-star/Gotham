import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  triage: "bg-yellow-100 text-yellow-800",
  active_investigation: "bg-blue-100 text-blue-800",
  awaiting_evidence: "bg-orange-100 text-orange-800",
  pending_approval: "bg-purple-100 text-purple-800",
  closed_confirmed: "bg-green-100 text-green-800",
  closed_unsubstantiated: "bg-slate-100 text-slate-600",
  escalated: "bg-red-100 text-red-800",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-800",
};

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
