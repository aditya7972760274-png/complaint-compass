import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent complaints (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: complaints } = await supabase
      .from("complaints")
      .select("*")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false });

    if (!complaints || complaints.length === 0) {
      return new Response(JSON.stringify({
        incidents: [],
        crisis_forecast: { risk_level: "low", message: "No significant complaint activity detected." },
        cascades: [],
        fraud_signals: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const complaintsSummary = complaints.map(c =>
      `[${c.id.slice(0,8)}] Category:${c.category||"Unknown"} Product:${c.product_type} Location:${c.location} Frustration:${c.frustration_score||"N/A"} Priority:${c.priority_score||"N/A"} Escalation:${c.escalation_risk||"N/A"} Status:${c.status} Text:"${c.complaint_text.slice(0,150)}"`
    ).join("\n");

    const systemPrompt = `You are an AI Incident Commander for a banking operations center. Analyze the complaint data and generate a comprehensive crisis intelligence report.

Return your analysis using the provided tool.`;

    const userPrompt = `Analyze these ${complaints.length} complaints from the last 7 days:\n\n${complaintsSummary}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_crisis_report",
            description: "Generate a comprehensive crisis management and intelligence report",
            parameters: {
              type: "object",
              properties: {
                incidents: {
                  type: "array",
                  description: "Active incidents detected from complaint patterns",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Brief incident title e.g. 'ATM Network Failure'" },
                      severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      cities_affected: { type: "array", items: { type: "string" } },
                      complaint_count: { type: "integer" },
                      root_cause_probability: { type: "number", minimum: 0, maximum: 100 },
                      root_cause_description: { type: "string" },
                      recommended_actions: { type: "array", items: { type: "string" } },
                      affected_products: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "severity", "cities_affected", "complaint_count", "root_cause_probability", "root_cause_description", "recommended_actions", "affected_products"],
                  },
                },
                crisis_forecast: {
                  type: "object",
                  description: "24-48 hour crisis prediction",
                  properties: {
                    risk_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    message: { type: "string" },
                    predicted_volume: { type: "string", description: "Predicted complaint volume trend" },
                    potential_triggers: { type: "array", items: { type: "string" } },
                  },
                  required: ["risk_level", "message", "predicted_volume", "potential_triggers"],
                },
                cascades: {
                  type: "array",
                  description: "Complaint cascade chains detected (one issue causing others)",
                  items: {
                    type: "object",
                    properties: {
                      trigger_issue: { type: "string" },
                      downstream_effects: { type: "array", items: { type: "string" } },
                      total_affected: { type: "integer" },
                    },
                    required: ["trigger_issue", "downstream_effects", "total_affected"],
                  },
                },
                root_cause_scores: {
                  type: "array",
                  description: "Root causes ranked by confidence",
                  items: {
                    type: "object",
                    properties: {
                      cause: { type: "string" },
                      confidence: { type: "number", minimum: 0, maximum: 100 },
                      evidence_count: { type: "integer" },
                    },
                    required: ["cause", "confidence", "evidence_count"],
                  },
                },
                resolution_recommendations: {
                  type: "array",
                  description: "Prioritized resolution actions",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string", enum: ["immediate", "high", "medium", "low"] },
                      impact_estimate: { type: "string" },
                      owner: { type: "string", description: "Suggested team/department" },
                    },
                    required: ["action", "priority", "impact_estimate", "owner"],
                  },
                },
                fraud_signals: {
                  type: "array",
                  description: "Potential fraud patterns detected",
                  items: {
                    type: "object",
                    properties: {
                      signal: { type: "string" },
                      risk_level: { type: "string", enum: ["high", "medium", "low"] },
                      affected_count: { type: "integer" },
                      recommendation: { type: "string" },
                    },
                    required: ["signal", "risk_level", "affected_count", "recommendation"],
                  },
                },
              },
              required: ["incidents", "crisis_forecast", "cascades", "root_cause_scores", "resolution_recommendations", "fraud_signals"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_crisis_report" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let report;
    if (toolCall?.function?.arguments) {
      report = JSON.parse(toolCall.function.arguments);
    } else {
      throw new Error("Failed to generate structured report");
    }

    report.generated_at = new Date().toISOString();
    report.total_complaints_analyzed = complaints.length;

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("incident-commander error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
