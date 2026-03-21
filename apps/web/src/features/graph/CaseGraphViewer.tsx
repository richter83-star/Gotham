"use client";

import { useEffect, useRef, useState } from "react";
// @ts-ignore
import cytoscape from "cytoscape";

export function CaseGraphViewer({ caseId }: { caseId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch graph data from our new endpoint
    const fetchGraph = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/graph/cases/${caseId}`);
        if (!response.ok) throw new Error("Graph fetch failed");
        
        const data = await response.json();
        setElements(data);
      } catch (error) {
        console.error("Failed to load graph:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGraph();
  }, [caseId]);

  useEffect(() => {
    if (!containerRef.current || loading || elements.length === 0) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#3b82f6', // primary blue
            'color': '#f4f4f5',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-outline-color': '#0c0c0d',
            'text-outline-width': 2,
            'font-size': '12px'
          }
        },
        {
          selector: 'node[type="Case"]',
          style: {
            'background-color': '#10b981', // green for cases
            'shape': 'hexagon',
            'width': 50,
            'height': 50
          }
        },
        {
          selector: 'node[type="Person"]',
          style: {
            'background-color': '#8b5cf6', // purple for people
            'shape': 'ellipse'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#27272a',
            'target-arrow-color': '#27272a',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'color': '#71717a',
            'text-rotation': 'autorotate',
            'text-margin-y': -10
          }
        }
      ],
      layout: {
        name: 'cose',
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        animate: true,
      }
    });

    return () => {
      cy.destroy();
    };
  }, [loading, elements]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-500">
        <div className="animate-pulse">Loading intelligence graph...</div>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-500">
        No graph data found for this case.
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#0c0c0d] border border-[#1a1a1b] rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 text-xs font-bold text-zinc-500 uppercase tracking-wider">
        Entity Network
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
