import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { complaints_texts } = await req.json();
    if (!complaints_texts || !Array.isArray(complaints_texts)) throw new Error("complaints_texts array is required");

    const systemPrompt = `You are a banking operations investigator. Analyze the provided complaint(s) and generate a detailed investigation report. Return a JSON object with:
- root_cause: detailed technical root cause analysis (2-3 sentences)
- investigation_summary: a brief investigation report suitable for management (3-4 sentences)
- recommended_actions: array of 3-5 specific actionable recommendations
- affected_systems: array of affected banking systems/components
- severity: "critical" | "high" | "medium" | "low"
- estimated_impact: brief description of customer/business impact

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: complaints_texts.join("\n---\n") },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_cluster",
              description: "Return structured cluster investigation report",
              parameters: {
                type: "object",
                properties: {
                  root_cause: { type: "string" },
                  investigation_summary: { type: "string" },
                  recommended_actions: { type: "array", items: { type: "string" } },
                  affected_systems: { type: "array", items: { type: "string" } },
                  severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  estimated_impact: { type: "string" },
                },
                required: ["root_cause", "investigation_summary", "recommended_actions", "affected_systems", "severity", "estimated_impact"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_cluster" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let report;
    if (toolCall?.function?.arguments) {
      report = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      report = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
    }

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-cluster error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
