import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchComplaintById } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Brain, MessageSquare, ShieldAlert } from "lucide-react";

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => fetchComplaintById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading complaint...</div>;
  if (error || !complaint) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Complaint not found</p>
        <Link to="/complaints" className="text-primary text-sm mt-2 inline-block">← Back to list</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/complaints" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to complaints
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground font-mono">{complaint.id.slice(0, 8)}</h1>
        <Badge variant="secondary">{complaint.category || "Pending"}</Badge>
        <span className={`text-xs px-2 py-1 rounded-full ${complaint.status === "escalated" ? "bg-destructive/20 text-destructive" : complaint.status === "new" ? "bg-chart-5/20 text-chart-5" : "bg-warning/20 text-warning"}`}>
          {complaint.status}
        </span>
      </div>

      <div className="glass-card p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Complaint Text</p>
        <p className="text-foreground leading-relaxed">{complaint.complaint_text}</p>
        <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
          <span>📅 {complaint.date}</span>
          <span>📦 {complaint.product_type}</span>
          <span>📡 {complaint.channel}</span>
          <span>📍 {complaint.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sentiment</p>
          </div>
          <p className={`text-lg font-bold capitalize ${complaint.sentiment === "negative" ? "text-destructive" : complaint.sentiment === "positive" ? "text-success" : "text-warning"}`}>
            {complaint.sentiment || "Pending"}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Frustration</p>
          </div>
          <p className="text-lg font-bold text-foreground">{complaint.frustration_score ?? "—"}<span className="text-sm text-muted-foreground">/10</span></p>
          {complaint.frustration_score != null && (
            <div className="w-full h-1.5 bg-secondary rounded-full mt-2">
              <div className="h-full rounded-full bg-warning" style={{ width: `${complaint.frustration_score * 10}%` }} />
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority Score</p>
          </div>
          <p className={`text-lg font-bold ${(complaint.priority_score || 0) >= 90 ? "text-destructive" : (complaint.priority_score || 0) >= 70 ? "text-warning" : "text-foreground"}`}>
            {complaint.priority_score ?? "—"}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-chart-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Escalation Risk</p>
          </div>
          <p className={`text-lg font-bold ${(complaint.escalation_risk || 0) >= 0.7 ? "text-destructive" : (complaint.escalation_risk || 0) >= 0.4 ? "text-warning" : "text-success"}`}>
            {complaint.escalation_risk != null ? `${(complaint.escalation_risk * 100).toFixed(0)}%` : "—"}
          </p>
        </div>
      </div>

      {complaint.ai_root_cause && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">AI Root Cause Analysis</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{complaint.ai_root_cause}</p>
        </div>
      )}

      {complaint.ai_response_draft && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">AI-Generated Response Draft</h3>
          </div>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed bg-secondary/50 rounded-md p-4">
            {complaint.ai_response_draft}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailPage;
