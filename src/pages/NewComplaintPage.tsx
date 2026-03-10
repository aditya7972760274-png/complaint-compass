import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeComplaint, insertComplaint } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Papa from "papaparse";
import { Upload, FileText, Loader2 } from "lucide-react";

const NewComplaintPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ text: "", date: new Date().toISOString().split("T")[0], productType: "", channel: "", location: "" });

  const submitMutation = useMutation({
    mutationFn: async (data: { text: string; date: string; productType: string; channel: string; location: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Run AI analysis
      const analysis = await analyzeComplaint(data.text, data.productType, data.channel, data.location);

      // Insert with AI results
      return insertComplaint({
        complaint_text: data.text,
        date: data.date,
        product_type: data.productType || "General",
        channel: data.channel || "Manual",
        location: data.location || "Unknown",
        user_id: user.id,
        category: analysis.category,
        sentiment: analysis.sentiment,
        frustration_score: analysis.frustration_score,
        priority_score: analysis.priority_score,
        escalation_risk: analysis.escalation_risk,
        ai_response_draft: analysis.ai_response_draft,
        ai_root_cause: analysis.ai_root_cause,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint submitted with AI analysis!");
      navigate("/admin/complaints");
    },
    onError: (e) => toast.error(e.message || "Failed to submit complaint"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) { toast.error("Complaint text is required"); return; }
    submitMutation.mutate(form);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        let count = 0;
        for (const row of results.data as any[]) {
          const text = row.text || row.complaint_text;
          if (!text) continue;
          try {
            const analysis = await analyzeComplaint(text, row.product_type || row.productType || "", row.channel || "", row.location || "");
            await insertComplaint({
              complaint_text: text,
              date: row.date || new Date().toISOString().split("T")[0],
              product_type: row.product_type || row.productType || "General",
              channel: row.channel || "CSV Import",
              location: row.location || "Unknown",
              user_id: user.id,
              ...analysis,
            });
            count++;
          } catch (err) {
            console.error("Failed to process row:", err);
          }
        }
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        toast.success(`Imported ${count} complaints with AI analysis`);
        navigate("/complaints");
      },
      error: () => toast.error("Failed to parse CSV"),
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Complaint</h1>
        <p className="text-sm text-muted-foreground">AI will automatically categorize, score, and generate responses</p>
      </div>

      <div
        className="glass-card p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-foreground">Drop CSV file or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">Columns: text, date, product_type, channel, location</p>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" />
        <span>OR ENTER MANUALLY</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Complaint Text *</Label>
          <Textarea
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            placeholder="Describe the customer complaint..."
            className="bg-secondary border-border min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Date</Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Product Type</Label>
            <Input value={form.productType} onChange={e => setForm(f => ({ ...f, productType: e.target.value }))} placeholder="e.g. ATM, UPI, Credit Card" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Channel</Label>
            <Input value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} placeholder="e.g. Email, Phone, App" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Location</Label>
            <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Mumbai, Delhi" className="bg-secondary border-border" />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running AI Analysis...</>
          ) : (
            <><FileText className="w-4 h-4 mr-2" /> Submit & Run AI Analysis</>
          )}
        </Button>
      </form>
    </div>
  );
};

export default NewComplaintPage;
