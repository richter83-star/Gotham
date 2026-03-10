"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Users,
  Search,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/cases", label: "Case Queue", icon: FolderOpen },
  { href: "/entities", label: "Entities", icon: Users },
  { href: "/search", label: "Search", icon: Search },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/graph", label: "Graph View", icon: Network },
  { href: "/audit", label: "Audit Log", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  return (
    <aside className="w-60 flex flex-col h-screen bg-slate-900 text-slate-100 fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700">
        <Shield className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-sm tracking-wide">CaseGraph</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname.startsWith(href)
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName ?? "—"}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
          </div>
          <button
            onClick={clearAuth}
            className="text-slate-400 hover:text-white ml-2 shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
