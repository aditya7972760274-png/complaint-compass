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
import { Upload, FileText, Loader2, Download, Info } from "lucide-react";

const CSV_TEMPLATE = `complaint_text,date,product_type,channel,location
"ATM did not dispense cash but amount was debited from my account",2026-03-01,ATM,Phone,Mumbai
"Unable to complete UPI payment, transaction failed multiple times",2026-03-02,UPI,App,Delhi
"Credit card statement shows unauthorized transaction of Rs 5000",2026-03-03,Credit Card,Email,Bangalore
"Internet banking portal is not loading since yesterday",2026-03-04,Internet Banking,Web Portal,Chennai`;

const NewComplaintPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ text: "", date: new Date().toISOString().split("T")[0], productType: "", channel: "", location: "" });
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [csvProgress, setCsvProgress] = useState({ current: 0, total: 0 });

  const submitMutation = useMutation({
    mutationFn: async (data: { text: string; date: string; productType: string; channel: string; location: string }) => {
      if (!user) throw new Error("Not authenticated");
      const analysis = await analyzeComplaint(data.text, data.productType, data.channel, data.location);
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
        duplicate_of: analysis.duplicate_of || null,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      if (data?.duplicate_of) {
        toast.warning("Possible duplicate detected! Complaint submitted and linked to existing one.");
      } else {
        toast.success("Complaint submitted with AI analysis!");
      }
      navigate("/admin/complaints");
    },
    onError: (e) => toast.error(e.message || "Failed to submit complaint"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) { toast.error("Complaint text is required"); return; }
    submitMutation.mutate(form);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setCsvProcessing(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = (results.data as any[]).filter(row => row.complaint_text || row.text);
        setCsvProgress({ current: 0, total: rows.length });
        let count = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const text = row.complaint_text || row.text;
          if (!text) continue;
          // Add delay between rows to avoid rate limiting (3s between each)
          if (i > 0) await new Promise(r => setTimeout(r, 3000));
          let retries = 0;
          while (retries < 3) {
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
              setCsvProgress({ current: count, total: rows.length });
              break;
            } catch (err: any) {
              retries++;
              if (retries < 3) {
                console.warn(`Row ${i + 1} failed, retrying in ${retries * 5}s...`);
                await new Promise(r => setTimeout(r, retries * 5000));
              } else {
                console.error("Failed to process row after retries:", err);
              }
            }
          }
        }
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        toast.success(`Imported ${count} of ${rows.length} complaints with AI analysis`);
        setCsvProcessing(false);
        navigate("/admin/complaints");
      },
      error: () => { toast.error("Failed to parse CSV"); setCsvProcessing(false); },
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit Complaint</h1>
        <p className="text-sm text-muted-foreground">AI will automatically categorize, score, and generate responses</p>
      </div>

      {/* CSV Upload Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" /> Bulk CSV Upload
          </h3>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-3 h-3 mr-1" /> Download Template
          </Button>
        </div>

        <div className="bg-secondary/50 rounded-md p-3 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">CSV File Format:</p>
              <p className="text-muted-foreground">Your CSV must have a header row. Required column: <span className="text-primary font-mono">complaint_text</span></p>
              <p className="text-muted-foreground mt-1">Optional columns: <span className="font-mono text-muted-foreground">date, product_type, channel, location</span></p>
            </div>
          </div>
          <div className="bg-background/50 rounded p-2 font-mono text-[10px] text-muted-foreground overflow-x-auto">
            complaint_text,date,product_type,channel,location<br />
            "ATM did not dispense cash...",2026-03-01,ATM,Phone,Mumbai<br />
            "UPI payment failed...",2026-03-02,UPI,App,Delhi
          </div>
        </div>

        {csvProcessing ? (
          <div className="text-center py-4 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-sm text-foreground">Processing {csvProgress.current} of {csvProgress.total} complaints...</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: csvProgress.total > 0 ? `${(csvProgress.current / csvProgress.total) * 100}%` : "0%" }}
              />
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer text-center rounded-md p-6"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-foreground">Click to select CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">Each row will be analyzed by AI automatically</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          </div>
        )}
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
