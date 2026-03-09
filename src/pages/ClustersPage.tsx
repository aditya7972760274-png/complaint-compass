import { useQuery } from "@tanstack/react-query";
import { fetchComplaints } from "@/lib/api";
import { Brain, AlertTriangle, Lightbulb } from "lucide-react";

const ClustersPage = () => {
  const { data: complaints = [] } = useQuery({ queryKey: ["complaints"], queryFn: fetchComplaints });

  // Group complaints by category to simulate clusters
  const clusters = Object.entries(
    complaints.reduce((acc: Record<string, typeof complaints>, c) => {
      const cat = c.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(c);
      return acc;
    }, {})
  ).filter(([, items]) => items.length >= 1)
   .map(([name, items]) => ({
     name,
     count: items.length,
     avgFrustration: items.reduce((a, c) => a + (c.frustration_score || 0), 0) / items.length,
     rootCause: items[0]?.ai_root_cause || "AI analysis pending for this cluster.",
     complaints: items,
   }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaint Clusters & Root Cause Analysis</h1>
        <p className="text-sm text-muted-foreground">AI-detected patterns grouped by category</p>
      </div>

      {clusters.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          Submit complaints to see AI-detected clusters.
        </div>
      ) : (
        <div className="space-y-4">
          {clusters.map(cluster => (
            <div key={cluster.name} className="glass-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{cluster.name}</h3>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{cluster.count} complaints</span>
                    <span>Avg frustration: {cluster.avgFrustration.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Root Cause Analysis</p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{cluster.rootCause}</p>
                </div>

                <div className="bg-secondary/50 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-warning" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Complaints in Cluster</p>
                  </div>
                  <div className="space-y-1">
                    {cluster.complaints.slice(0, 3).map(c => (
                      <p key={c.id} className="text-xs text-muted-foreground truncate">• {c.complaint_text}</p>
                    ))}
                    {cluster.complaints.length > 3 && (
                      <p className="text-xs text-primary">+{cluster.complaints.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClustersPage;
