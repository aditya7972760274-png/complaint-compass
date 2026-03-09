import { getDailyIntelligence } from "@/lib/mockData";
import { FileText, AlertTriangle, TrendingUp, Lightbulb, Shield } from "lucide-react";

const IntelligencePage = () => {
  const intel = getDailyIntelligence();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Daily Intelligence Summary
        </h1>
        <p className="text-sm text-muted-foreground">{intel.date}</p>
      </div>

      {/* Summary */}
      <div className="glass-card p-6 glow-primary">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Executive Summary</p>
        </div>
        <p className="text-foreground leading-relaxed">{intel.summary}</p>
      </div>

      {/* Crisis Alerts */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-medium text-foreground">Crisis Alerts</h3>
        </div>
        <div className="space-y-3">
          {intel.crisisAlerts.map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-md ${alert.severity === "high" ? "bg-destructive/10 border border-destructive/20" : "bg-warning/10 border border-warning/20"}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 ${alert.severity === "high" ? "bg-destructive animate-pulse-glow" : "bg-warning"}`} />
              <p className="text-sm text-foreground">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Most Affected Products */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Most Affected Products</h3>
        </div>
        <div className="space-y-2">
          {intel.topProducts.map(p => (
            <div key={p.product} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
              <span className="text-sm text-foreground">{p.product}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-primary">{p.complaints} complaints</span>
                <span className={`text-xs ${p.trend === "up" ? "text-destructive" : "text-muted-foreground"}`}>
                  {p.trend === "up" ? "↑ Rising" : "→ Stable"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-medium text-foreground">Recommended Actions</h3>
        </div>
        <ol className="space-y-2">
          {intel.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-primary shrink-0">{String(i + 1).padStart(2, "0")}</span>
              {action}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default IntelligencePage;
