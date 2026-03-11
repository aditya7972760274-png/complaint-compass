import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, Bot, User, MessageSquareWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

const PublicComplaintPage = () => {
  const [form, setForm] = useState({
    text: "",
    date: new Date().toISOString().split("T")[0],
    productType: "",
    channel: "",
    location: "",
    name: "",
    email: "",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaint, setComplaint] = useState<{ id: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) { toast.error("Please describe your complaint"); return; }

    setSubmitting(true);
    setMessages(prev => [...prev, { role: "user", content: form.text }]);

    try {
      // Call analyze-complaint to get AI analysis and response
      const { data: analysis, error: aiError } = await supabase.functions.invoke("analyze-complaint", {
        body: {
          complaint_text: form.text,
          product_type: form.productType || "General",
          channel: form.channel || "Web Portal",
          location: form.location || "Unknown",
        },
      });

      if (aiError) throw aiError;

      // Insert as public complaint (use a fixed public user id)
      const { error: insertError } = await supabase
        .from("complaints")
        .insert({
          complaint_text: form.text,
          date: form.date,
          product_type: form.productType || "General",
          channel: "Web Portal",
          location: form.location || "Unknown",
          user_id: "00000000-0000-0000-0000-000000000000",
          category: analysis?.category,
          sentiment: analysis?.sentiment,
          frustration_score: analysis?.frustration_score,
          priority_score: analysis?.priority_score,
          escalation_risk: analysis?.escalation_risk,
          ai_response_draft: analysis?.ai_response_draft,
          ai_root_cause: analysis?.ai_root_cause,
        });

      // Show AI response as chatbot message
      const botResponse = analysis?.ai_response_draft || "Thank you for your complaint. Our team will review it shortly.";
      setMessages(prev => [...prev, { role: "bot", content: botResponse }]);
      setSubmitted(true);
      toast.success("Complaint submitted successfully!");
    } catch (err: any) {
      const errorMsg = "We've received your complaint and will get back to you shortly. Thank you for your patience.";
      setMessages(prev => [...prev, { role: "bot", content: errorMsg }]);
      setSubmitted(true);
      console.error("Complaint submission error:", err);
    }

    setSubmitting(false);
  };

  const handleNewComplaint = () => {
    setForm({ text: "", date: new Date().toISOString().split("T")[0], productType: "", channel: "", location: "", name: "", email: "" });
    setMessages([]);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <MessageSquareWarning className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Raise a Complaint</h1>
              <p className="text-sm text-muted-foreground">Describe your issue and get an instant AI-powered response</p>
            </div>
          </div>

          {/* Chat messages */}
          {messages.length > 0 && (
            <div className="glass-card p-4 mb-6 space-y-4 max-h-[400px] overflow-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {msg.role === "bot" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-warning" />
                    </div>
                  )}
                </div>
              ))}
              {submitting && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}

          {submitted ? (
            <div className="glass-card p-8 text-center space-y-4">
              <p className="text-foreground">Your complaint has been registered and is being reviewed.</p>
              {complaint && (
                <div className="bg-secondary/50 rounded-md p-3 text-sm">
                  <p className="text-muted-foreground">Your Complaint ID:</p>
                  <p className="font-mono text-primary text-xs mt-1 select-all">{complaint.id}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Save this ID to track your complaint status</p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button onClick={handleNewComplaint} variant="outline">Submit Another</Button>
                <Button asChild><Link to="/track-complaint">Track Complaint</Link></Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Your Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" className="bg-secondary border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Describe Your Complaint *</Label>
                <Textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Please describe your issue in detail..."
                  className="bg-secondary border-border min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Product Type</Label>
                  <Input value={form.productType} onChange={e => setForm(f => ({ ...f, productType: e.target.value }))} placeholder="e.g. ATM, UPI, Credit Card" className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Location</Label>
                  <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Mumbai, Delhi" className="bg-secondary border-border" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing your complaint...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit Complaint</>
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PublicComplaintPage;
