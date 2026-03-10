"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/layout/top-bar";
import type { Core, ElementDefinition } from "cytoscape";

// CytoscapeComponent is a browser-only library
const CytoscapeComponent = dynamic(() => import("react-cytoscapejs"), { ssr: false });

const SAMPLE_ELEMENTS: ElementDefinition[] = [
  { data: { id: "p1", label: "John Smith", type: "person" } },
  { data: { id: "p2", label: "Jane Doe", type: "person" } },
  { data: { id: "org1", label: "Acme Corp", type: "organization" } },
  { data: { id: "acc1", label: "ACC-99123", type: "account" } },
  { data: { id: "acc2", label: "ACC-55432", type: "account" } },
  { data: { source: "p1", target: "org1", label: "WORKS_FOR" } },
  { data: { source: "p1", target: "acc1", label: "OWNS" } },
  { data: { source: "p2", target: "acc2", label: "OWNS" } },
  { data: { source: "acc1", target: "acc2", label: "SENT_TRANSACTION" } },
];

const STYLE: cytoscape.Stylesheet[] = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "font-size": 11,
      "text-valign": "bottom",
      "text-margin-y": 4,
      "background-color": "#64748b",
      width: 40,
      height: 40,
      color: "#1e293b",
    },
  },
  {
    selector: "node[type='person']",
    style: { "background-color": "#3b82f6" },
  },
  {
    selector: "node[type='organization']",
    style: { "background-color": "#8b5cf6" },
  },
  {
    selector: "node[type='account']",
    style: { "background-color": "#22c55e" },
  },
  {
    selector: "edge",
    style: {
      "line-color": "#cbd5e1",
      "target-arrow-color": "#cbd5e1",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      label: "data(label)",
      "font-size": 9,
      color: "#94a3b8",
      "text-rotation": "autorotate",
    },
  },
];

export default function GraphViewPage() {
  const cyRef = useRef<Core | null>(null);

  const handleFitGraph = useCallback(() => {
    cyRef.current?.fit(undefined, 30);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="Graph View" />

      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleFitGraph}
            className="text-xs bg-white border rounded-md px-3 py-1.5 shadow-sm hover:bg-slate-50"
          >
            Fit Graph
          </button>
        </div>

        <CytoscapeComponent
          elements={SAMPLE_ELEMENTS}
          style={{ width: "100%", height: "100%" }}
          stylesheet={STYLE}
          layout={{ name: "cose", animate: false }}
          cy={(cy) => { cyRef.current = cy; }}
        />
      </div>

      <div className="border-t bg-white px-4 py-2 text-xs text-slate-400">
        Graph view — real data wired in Sprint 3 via Graph Service (Neo4j sync)
      </div>
    </div>
  );
}
