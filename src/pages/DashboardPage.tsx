import { motion } from "framer-motion";
import { getComplaints, getCategoryDistribution, getSentimentDistribution, getTrendData, getHighPriorityComplaints } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { AlertTriangle, TrendingUp, MessageSquareWarning, ShieldAlert, Activity } from "lucide-react";

const COLORS = [
  "hsl(174, 72%, 46%)", "hsl(262, 72%, 58%)", "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)", "hsl(200, 72%, 52%)", "hsl(142, 71%, 45%)"
];

const StatCard = ({ title, value, subtitle, icon: Icon, accent }: { title: string; value: string | number; subtitle: string; icon: any; accent?: boolean }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`glass-card p-5 ${accent ? "glow-primary" : ""}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${accent ? "text-primary glow-text" : "text-foreground"}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ? "bg-primary/20" : "bg-secondary"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const complaints = getComplaints();
  const categoryData = getCategoryDistribution();
  const sentimentData = getSentimentDistribution();
  const trendData = getTrendData();
  const highPriority = getHighPriorityComplaints();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time complaint intelligence overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={complaints.length} subtitle="+25% vs last week" icon={MessageSquareWarning} accent />
        <StatCard title="High Priority" value={highPriority.length} subtitle="Requires attention" icon={AlertTriangle} />
        <StatCard title="Escalation Risk" value={`${complaints.filter(c => c.escalationRisk > 0.7).length}`} subtitle="Above 70% threshold" icon={ShieldAlert} />
        <StatCard title="Avg Frustration" value={(complaints.reduce((a, c) => a + c.frustrationScore, 0) / complaints.length).toFixed(1)} subtitle="Out of 10" icon={Activity} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Complaint Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="complaints" stroke="hsl(174, 72%, 46%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="resolved" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Pie */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                {sentimentData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {sentimentData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Bar + High Priority Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(174, 72%, 46%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            High Priority Complaints
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-auto">
            {highPriority.slice(0, 6).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-primary">{c.id}</p>
                  <p className="text-sm text-foreground truncate">{c.text.slice(0, 60)}...</p>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <span className={`text-sm font-bold ${c.priorityScore >= 90 ? "text-destructive" : c.priorityScore >= 75 ? "text-warning" : "text-foreground"}`}>
                    {c.priorityScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
