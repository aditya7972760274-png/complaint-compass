import { useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints, type Complaint } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-chart-5/20 text-chart-5",
  processing: "bg-warning/20 text-warning",
  resolved: "bg-success/20 text-success",
  escalated: "bg-destructive/20 text-destructive",
};

const ComplaintsListPage = () => {
  const [search, setSearch] = useState("");
  const complaints = getComplaints().filter(c =>
    c.text.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
          <p className="text-sm text-muted-foreground">{complaints.length} total complaints</p>
        </div>
        <Link to="/complaints/new" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          + New Complaint
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search complaints..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["ID", "Text", "Category", "Sentiment", "Frustration", "Priority", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/complaints/${c.id}`} className="font-mono text-primary hover:underline">{c.id}</Link>
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-foreground">{c.text}</td>
                <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{c.category}</Badge></td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{c.sentiment}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono ${c.frustrationScore >= 8 ? "text-destructive" : c.frustrationScore >= 5 ? "text-warning" : "text-success"}`}>{c.frustrationScore}/10</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono font-bold ${c.priorityScore >= 90 ? "text-destructive" : c.priorityScore >= 70 ? "text-warning" : "text-muted-foreground"}`}>{c.priorityScore}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintsListPage;
