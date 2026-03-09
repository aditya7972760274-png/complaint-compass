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

    const { complaints_summary } = await req.json();
    if (!complaints_summary) throw new Error("complaints_summary is required");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a banking operations intelligence analyst. Generate a daily intelligence summary from complaint data. Return a JSON object with:
- summary: 2-3 sentence executive overview
- crisis_alerts: array of {severity: "high"|"medium"|"low", message: string}
- top_products: array of {product: string, complaints: number, trend: "up"|"down"|"stable"}
- actions: array of recommended action strings (4-6 items)
- clusters: array of {name: string, count: number, root_cause: string, recommendation: string}

Return ONLY valid JSON.`
          },
          { role: "user", content: complaints_summary },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_intelligence",
              description: "Return structured intelligence report",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  crisis_alerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        severity: { type: "string", enum: ["high", "medium", "low"] },
                        message: { type: "string" },
                      },
                      required: ["severity", "message"],
                    },
                  },
                  top_products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product: { type: "string" },
                        complaints: { type: "integer" },
                        trend: { type: "string", enum: ["up", "down", "stable"] },
                      },
                      required: ["product", "complaints", "trend"],
                    },
                  },
                  actions: { type: "array", items: { type: "string" } },
                  clusters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        count: { type: "integer" },
                        root_cause: { type: "string" },
                        recommendation: { type: "string" },
                      },
                      required: ["name", "count", "root_cause", "recommendation"],
                    },
                  },
                },
                required: ["summary", "crisis_alerts", "top_products", "actions", "clusters"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_intelligence" } },
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
    console.error("intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
