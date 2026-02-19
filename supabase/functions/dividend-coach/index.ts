import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- JWT validation ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // --- Service-role client for writes ---
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Rate limiting: count today's usage ---
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { count, error: countError } = await serviceClient
      .from("ai_coach_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    if (countError) {
      console.error("Usage count error:", countError);
      return new Response(
        JSON.stringify({ error: "Failed to check usage" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const usageCount = count ?? 0;
    if (usageCount >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: "limit_reached", remaining: 0 }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Parse request body ---
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Fetch portfolio context ---
    const { data: stocks } = await serviceClient
      .from("user_stocks")
      .select("symbol, shares, current_price, dividend_yield, annual_dividend, company_name, sector")
      .eq("user_id", userId);

    let portfolioContext = "The user has no stocks in their portfolio yet.";
    if (stocks && stocks.length > 0) {
      const totalValue = stocks.reduce((sum, s) => sum + (s.shares * (s.current_price || 0)), 0);
      const totalAnnualDiv = stocks.reduce((sum, s) => sum + ((s.annual_dividend || 0) * s.shares), 0);
      const avgYield = stocks.reduce((sum, s) => sum + (s.dividend_yield || 0), 0) / stocks.length;

      const holdingsList = stocks
        .map((s) => `${s.symbol}: ${s.shares} shares @ $${s.current_price?.toFixed(2) ?? "N/A"}, yield ${s.dividend_yield?.toFixed(2) ?? "N/A"}%, sector: ${s.sector ?? "Unknown"}`)
        .join("\n");

      portfolioContext = `The user's portfolio:\n- Total value: $${totalValue.toFixed(2)}\n- Annual dividends: $${totalAnnualDiv.toFixed(2)}\n- Average yield: ${avgYield.toFixed(2)}%\n- ${stocks.length} holdings:\n${holdingsList}`;
    }

    // --- System prompt ---
    const systemPrompt = `You are DividendCoach, a specialized AI assistant focused on dividend investing and FIRE (Financial Independence, Retire Early) planning.

${portfolioContext}

Guidelines:
- Keep responses under 300 words
- Be specific and actionable — reference the user's actual holdings when relevant
- Calculate real numbers using their portfolio data
- For FIRE calculations, use the 4% rule unless the user specifies otherwise
- Always mention that you're not a financial advisor and this is educational information only
- Use plain language, avoid jargon unless explaining it
- When recommending stocks, explain WHY based on their current portfolio composition

Disclaimer you must include when giving specific advice: "This is educational information only, not financial advice. Please consult a qualified financial advisor before making investment decisions."`;

    // --- Record usage ---
    const userMessage = messages[messages.length - 1]?.content ?? "";
    await serviceClient.from("ai_coach_usage").insert({
      user_id: userId,
      prompt_text: userMessage.substring(0, 500),
      tokens_estimated: Math.ceil(userMessage.length / 4),
      model: "google/gemini-3-flash-preview",
    });

    // --- Call Lovable AI Gateway ---
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Stream SSE back ---
    const remaining = DAILY_LIMIT - usageCount - 1;
    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Remaining-Questions": String(remaining),
      },
    });
  } catch (e) {
    console.error("dividend-coach error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
