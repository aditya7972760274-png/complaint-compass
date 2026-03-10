import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Complaint = Tables<"complaints">;

export const fetchComplaints = async () => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const fetchComplaintById = async (id: string) => {
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const insertComplaint = async (complaint: {
  complaint_text: string;
  date: string;
  product_type: string;
  channel: string;
  location: string;
  user_id: string;
  category?: string;
  sentiment?: string;
  frustration_score?: number;
  priority_score?: number;
  escalation_risk?: number;
  ai_response_draft?: string;
  ai_root_cause?: string;
}) => {
  const { data, error } = await supabase
    .from("complaints")
    .insert(complaint)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const analyzeComplaint = async (complaint_text: string, product_type: string, channel: string, location: string) => {
  const { data, error } = await supabase.functions.invoke("analyze-complaint", {
    body: { complaint_text, product_type, channel, location },
  });
  if (error) throw error;
  return data;
};

export const updateComplaintStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from("complaints")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const generateIntelligenceReport = async (complaints: Complaint[]) => {
  const summary = complaints.map(c =>
    `[${c.category || "Unknown"}] ${c.complaint_text} (Frustration: ${c.frustration_score || "N/A"}, Priority: ${c.priority_score || "N/A"}, Location: ${c.location})`
  ).join("\n");

  const { data, error } = await supabase.functions.invoke("generate-intelligence", {
    body: { complaints_summary: `Total complaints: ${complaints.length}\n\n${summary}` },
  });
  if (error) throw error;
  return data;
};

export const generateClusterAnalysis = async (complaintsTexts: string[]) => {
  const { data, error } = await supabase.functions.invoke("analyze-cluster", {
    body: { complaints_texts: complaintsTexts },
  });
  if (error) throw error;
  return data;
};
