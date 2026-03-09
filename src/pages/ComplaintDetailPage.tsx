import { useParams, Link } from "react-router-dom";
import { getComplaintById } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Brain, MessageSquare, ShieldAlert } from "lucide-react";

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const complaint = getComplaintById(id || "");

  if (!complaint) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Complaint not found</p>
        <Link to="/complaints" className="text-primary text-sm mt-2 inline-block">← Back to list</Link>
      </div>
    );
  }

  const draftResponse = `Dear Customer,

Thank you for reaching out regarding your concern about ${complaint.category.toLowerCase()} services. We sincerely apologize for the inconvenience you've experienced.

We have reviewed your complaint (Ref: ${complaint.id}) and our team is actively working on resolving this issue. Based on our initial assessment, we expect to have this resolved within 48-72 hours.

If you have any further questions, please don't hesitate to contact us at our priority helpline.

Best regards,
Customer Resolution Team`;

  return (
    <div className="space-y-6">
      <Link to="/complaints" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to complaints
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{complaint.id}</h1>
        <Badge variant="secondary">{complaint.category}</Badge>
        <span className={`text-xs px-2 py-1 rounded-full ${complaint.status === "escalated" ? "bg-destructive/20 text-destructive" : complaint.status === "new" ? "bg-chart-5/20 text-chart-5" : "bg-warning/20 text-warning"}`}>
          {complaint.status}
        </span>
      </div>

      {/* Complaint text */}
      <div className="glass-card p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Complaint Text</p>
        <p className="text-foreground leading-relaxed">{complaint.text}</p>
        <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
          <span>📅 {complaint.date}</span>
          <span>📦 {complaint.productType}</span>
          <span>📡 {complaint.channel}</span>
          <span>📍 {complaint.location}</span>
        </div>
      </div>

      {/* AI Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sentiment</p>
          </div>
          <p className={`text-lg font-bold capitalize ${complaint.sentiment === "negative" ? "text-destructive" : complaint.sentiment === "positive" ? "text-success" : "text-warning"}`}>
            {complaint.sentiment}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Frustration</p>
          </div>
          <p className="text-lg font-bold text-foreground">{complaint.frustrationScore}<span className="text-sm text-muted-foreground">/10</span></p>
          <div className="w-full h-1.5 bg-secondary rounded-full mt-2">
            <div className="h-full rounded-full bg-warning" style={{ width: `${complaint.frustrationScore * 10}%` }} />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority Score</p>
          </div>
          <p className={`text-lg font-bold ${complaint.priorityScore >= 90 ? "text-destructive" : complaint.priorityScore >= 70 ? "text-warning" : "text-foreground"}`}>
            {complaint.priorityScore}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-chart-2" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Escalation Risk</p>
          </div>
          <p className={`text-lg font-bold ${complaint.escalationRisk >= 0.7 ? "text-destructive" : complaint.escalationRisk >= 0.4 ? "text-warning" : "text-success"}`}>
            {(complaint.escalationRisk * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* AI Response Draft */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">AI-Generated Response Draft</h3>
        </div>
        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed bg-secondary/50 rounded-md p-4">
          {draftResponse}
        </pre>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
