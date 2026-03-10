"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function TopBar({ title }: { title: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 pr-4 py-1.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 w-64"
          placeholder="Search cases, entities…"
        />
      </form>
    </header>
  );
}
