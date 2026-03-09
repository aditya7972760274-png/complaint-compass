import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchComplaints } from "@/lib/api";
import { Network } from "lucide-react";

const KnowledgeGraphPage = () => {
  const { data: complaints = [] } = useQuery({ queryKey: ["complaints"], queryFn: fetchComplaints });

  const graphData = useMemo(() => {
    const nodes: { id: string; label: string; type: string; x: number; y: number }[] = [];
    const edges: { from: string; to: string }[] = [];

    nodes.push({ id: "center", label: "Complaints", type: "center", x: 400, y: 300 });

    const categories = [...new Set(complaints.map(c => c.category).filter(Boolean))];
    categories.forEach((cat, i) => {
      const angle = (i / categories.length) * Math.PI * 2;
      nodes.push({ id: `cat-${cat}`, label: cat!, type: "category", x: 400 + Math.cos(angle) * 180, y: 300 + Math.sin(angle) * 180 });
      edges.push({ from: "center", to: `cat-${cat}` });
    });

    const locations = [...new Set(complaints.map(c => c.location))];
    const seen = new Set<string>();
    locations.forEach((loc, i) => {
      const angle = (i / locations.length) * Math.PI * 2 + 0.3;
      if (!seen.has(loc)) {
        nodes.push({ id: `loc-${loc}`, label: loc, type: "location", x: 400 + Math.cos(angle) * 320, y: 300 + Math.sin(angle) * 280 });
        seen.add(loc);
      }
    });

    complaints.forEach(c => {
      if (c.category) edges.push({ from: `cat-${c.category}`, to: `loc-${c.location}` });
    });

    return { nodes, edges: [...new Map(edges.map(e => [`${e.from}-${e.to}`, e])).values()] };
  }, [complaints]);

  const typeColors: Record<string, string> = {
    center: "hsl(174, 72%, 46%)",
    category: "hsl(262, 72%, 58%)",
    location: "hsl(38, 92%, 50%)",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Network className="w-6 h-6 text-primary" /> Knowledge Graph
        </h1>
        <p className="text-sm text-muted-foreground">Relationships between complaints, products, and locations</p>
      </div>

      {complaints.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Submit complaints to see the knowledge graph.</div>
      ) : (
        <div className="glass-card p-4 overflow-hidden">
          <svg viewBox="0 0 800 600" className="w-full h-[500px]">
            {graphData.edges.map((edge, i) => {
              const from = graphData.nodes.find(n => n.id === edge.from);
              const to = graphData.nodes.find(n => n.id === edge.to);
              if (!from || !to) return null;
              return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(220, 14%, 22%)" strokeWidth={1} opacity={0.6} />;
            })}
            {graphData.nodes.map(node => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r={node.type === "center" ? 30 : node.type === "category" ? 22 : 16} fill={typeColors[node.type]} opacity={0.8} />
                <text x={node.x} y={node.y + (node.type === "center" ? 45 : 35)} textAnchor="middle" fill="hsl(215, 12%, 50%)" fontSize={node.type === "center" ? 12 : 10}>
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="flex justify-center gap-6 mt-4">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground capitalize">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {type}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphPage;
