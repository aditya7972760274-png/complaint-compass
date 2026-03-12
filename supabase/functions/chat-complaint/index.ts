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

    const { complaint_id, message } = await req.json();
    if (!complaint_id || !message) throw new Error("complaint_id and message are required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get complaint context
    const { data: complaint } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", complaint_id)
      .single();

    if (!complaint) throw new Error("Complaint not found");

    // Get conversation history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("complaint_id", complaint_id)
      .order("created_at", { ascending: true });

    // Save user message
    await supabase.from("chat_messages").insert({
      complaint_id,
      role: "user",
      content: message,
    });

    // Build conversation for AI
    const conversationMessages = [
      {
        role: "system",
        content: `You are a helpful banking customer support AI assistant. You are handling a complaint about: "${complaint.complaint_text}".
Product: ${complaint.product_type}, Category: ${complaint.category || "Unknown"}, Status: ${complaint.status}.
Be empathetic, professional, and helpful. Provide clear next steps when possible. Keep responses concise (2-4 sentences).`,
      },
      ...(history || []).map((m: any) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const botReply = aiData.choices?.[0]?.message?.content || "I apologize, I'm unable to respond right now. Our team will follow up with you shortly.";

    // Save bot message
    await supabase.from("chat_messages").insert({
      complaint_id,
      role: "bot",
      content: botReply,
    });

    return new Response(JSON.stringify({ reply: botReply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-complaint error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
