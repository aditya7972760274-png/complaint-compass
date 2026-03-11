import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status === 429 && attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    return response;
  }
  throw new Error("Max retries exceeded");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { complaint_text, product_type, channel, location } = await req.json();
    if (!complaint_text) throw new Error("complaint_text is required");

    // --- Duplicate Detection ---
    let duplicate_of: string | null = null;
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: existing } = await supabase
        .from("complaints")
        .select("id, complaint_text")
        .order("created_at", { ascending: false })
        .limit(100);

      if (existing && existing.length > 0) {
        // Use AI to check for duplicates
        const dupCheckResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a duplicate complaint detector. Compare the NEW complaint against the list of EXISTING complaints. If the new complaint is substantially similar (same issue, same context) to any existing one, return the ID of the most similar existing complaint. Return ONLY a JSON object: {"duplicate_id": "uuid-here"} or {"duplicate_id": null} if no duplicate found. Return ONLY valid JSON.`
              },
              {
                role: "user",
                content: `NEW COMPLAINT:\n${complaint_text}\n\nEXISTING COMPLAINTS:\n${existing.slice(0, 20).map(c => `[${c.id}] ${c.complaint_text}`).join("\n")}`
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "check_duplicate",
                  description: "Return duplicate check result",
                  parameters: {
                    type: "object",
                    properties: {
                      duplicate_id: { type: ["string", "null"] },
                    },
                    required: ["duplicate_id"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "check_duplicate" } },
          }),
        });

        if (dupCheckResponse.ok) {
          const dupData = await dupCheckResponse.json();
          const toolCall = dupData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            const parsed = JSON.parse(toolCall.function.arguments);
            if (parsed.duplicate_id) {
              duplicate_of = parsed.duplicate_id;
            }
          }
        }
      }
    } catch (dupError) {
      console.error("Duplicate detection error (non-fatal):", dupError);
    }

    // --- Main Analysis ---
    const systemPrompt = `You are a banking complaint analysis AI. Analyze the following customer complaint and return a JSON object with these exact fields:
- category: one of "ATM", "UPI", "Credit Cards", "Loans", "Account Issues", "Internet Banking"
- sentiment: one of "positive", "negative", "neutral"
- frustration_score: integer 1-10
- priority_score: integer 1-100
- escalation_risk: decimal 0.00-1.00
- ai_response_draft: a professional 3-4 sentence response to the customer
- ai_root_cause: a brief technical root cause analysis (1-2 sentences)

Context: Product Type: ${product_type || "Unknown"}, Channel: ${channel || "Unknown"}, Location: ${location || "Unknown"}

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
          { role: "user", content: complaint_text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_complaint",
              description: "Return structured complaint analysis",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["ATM", "UPI", "Credit Cards", "Loans", "Account Issues", "Internet Banking"] },
                  sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                  frustration_score: { type: "integer", minimum: 1, maximum: 10 },
                  priority_score: { type: "integer", minimum: 1, maximum: 100 },
                  escalation_risk: { type: "number", minimum: 0, maximum: 1 },
                  ai_response_draft: { type: "string" },
                  ai_root_cause: { type: "string" },
                },
                required: ["category", "sentiment", "frustration_score", "priority_score", "escalation_risk", "ai_response_draft", "ai_root_cause"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_complaint" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    }

    // Include duplicate info
    if (duplicate_of) {
      analysis.duplicate_of = duplicate_of;
      analysis.is_duplicate = true;
    } else {
      analysis.is_duplicate = false;
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-complaint error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
