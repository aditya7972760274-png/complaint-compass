import { getClusterData } from "@/lib/mockData";
import { Brain, AlertTriangle, Lightbulb } from "lucide-react";

const ClustersPage = () => {
  const clusters = getClusterData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaint Clusters & Root Cause Analysis</h1>
        <p className="text-sm text-muted-foreground">AI-detected systemic issues and investigation reports</p>
      </div>

      <div className="space-y-4">
        {clusters.map(cluster => (
          <div key={cluster.id} className="glass-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">{cluster.id}</span>
                  <h3 className="text-lg font-semibold text-foreground">{cluster.name}</h3>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>{cluster.count} complaints</span>
                  <span>Avg frustration: {cluster.avgFrustration}/10</span>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Recommended Action</p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{cluster.recommendation}</p>
              </div>
            </div>

            {/* Investigation Summary */}
            <div className="bg-muted/50 rounded-md p-4 border-l-2 border-primary">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Auto-Generated Investigation Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Investigation initiated for cluster <span className="text-primary font-mono">{cluster.id}</span> — "{cluster.name}".
                {cluster.count} related complaints identified through semantic similarity analysis (cosine similarity &gt; 0.82).
                Root cause traced to infrastructure-level issues. Recommended priority: <span className="text-warning font-semibold">HIGH</span>.
                Estimated resolution timeline: 24-48 hours pending engineering team assessment.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClustersPage;
