import {
  loadPrintEstimatorPrompt,
  loadCompetitivePricerPrompt,
  loadFactoryProfile,
  loadMarketPricingDatabase,
} from "./knowledge-base";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4.5";

const QUOTE_RESPONSE_SCHEMA = {
  customer_quote: {
    quote_number: "string (QT-YYYYMMDD-NNN)",
    customer: { name: "string", company: "string", email: "string" },
    line_items: [
      {
        item_number: "number",
        product: "string",
        specs: {
          size: "string",
          pages: "number (optional)",
          colors: "string",
          stock: "string",
          finishing: ["string"],
          binding: "string (optional)",
        },
        quantities: [{ qty: "number", unit_price: "number", total: "number" }],
        lead_time_days: "number",
        notes: "string (optional)",
      },
    ],
    subtotal: "number",
    package_discount_pct: "number",
    package_discount_amt: "number",
    total: "number",
    valid_days: "number (usually 30)",
    notes: ["string"],
  },
  internal_costs: {
    line_items: [
      {
        item_number: "number",
        product: "string",
        cost_breakdown: {
          materials: "number",
          prepress: "number",
          press: "number",
          plates: "number",
          finishing: "number",
          shipping: "number",
        },
        total_cost: "number",
        sell_price: "number",
        margin_dollars: "number",
        margin_pct: "number",
        target_margin_pct: "number",
        margin_status: "on_target | below_target | below_minimum",
      },
    ],
    total_cost: "number",
    total_revenue: "number",
    total_margin: "number",
    blended_margin_pct: "number",
  },
  competitive_analysis: {
    line_items: [
      {
        item_number: "number",
        product: "string",
        our_price_unit: "number",
        market_low: "number",
        market_avg: "number",
        market_high: "number",
        position: "BELOW_MARKET | AT_MARKET | ABOVE_MARKET | WELL_ABOVE_MARKET",
        variance_pct: "number",
        competitors: [
          { name: "string", price: "number", threat: "string" },
        ],
        recommendation: "HOLD | ADJUST_DOWN | ADJUST_UP",
        adjusted_price: "number | null",
      },
    ],
    scorecard: {
      total_quote_value: "number",
      market_value_avg: "number",
      overall_position_pct: "number",
      items_at_below_market: "number",
      items_above_market: "number",
      total_items: "number",
      risk_level: "LOW | LOW_MEDIUM | MEDIUM | HIGH",
    },
  },
  win_strategy: {
    talking_points: ["string"],
    price_adjustments: [
      { item: "string", from: "number", to: "number", reason: "string" },
    ],
    package_discount_suggestion: "string",
  },
};

export function buildUserMessage(
  request: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
): string {
  return `Process this quote request and return your response as valid JSON matching this exact schema:

${JSON.stringify(QUOTE_RESPONSE_SCHEMA, null, 2)}

Important:
- Return ONLY the JSON object, no markdown fences, no extra text
- Every field must be populated
- All prices in USD
- margin_status: "on_target" | "below_target" | "below_minimum"
- position: "BELOW_MARKET" | "AT_MARKET" | "ABOVE_MARKET" | "WELL_ABOVE_MARKET"
- recommendation: "HOLD" | "ADJUST_DOWN" | "ADJUST_UP"
- For each line item, provide at least 2-3 quantity options where it makes sense (e.g. if customer asks for 1000, also quote 2500 and 5000)
- Include competitive analysis for the PRIMARY quantity option on each line item

Customer quote request:
${request}

${urgency !== "standard" ? `URGENCY: ${urgency.toUpperCase()} — apply ${urgency === "rush" ? "1.5x" : "2x"} rush pricing` : ""}
${customerInfo?.name ? `Customer: ${customerInfo.name}${customerInfo.company ? `, ${customerInfo.company}` : ""}${customerInfo.email ? `, ${customerInfo.email}` : ""}` : ""}`;
}

export function buildSystemMessages(): Array<{ type: "text"; text: string }> {
  const estimatorPrompt = loadPrintEstimatorPrompt();
  const competitivePricerPrompt = loadCompetitivePricerPrompt();
  const factoryProfile = loadFactoryProfile();
  const marketPricing = loadMarketPricingDatabase();

  return [
    {
      type: "text" as const,
      text: `${estimatorPrompt}\n\n---\n\nADDITIONAL ROLE — COMPETITIVE PRICING:\n${competitivePricerPrompt}`,
    },
    {
      type: "text" as const,
      text: `FACTORY PROFILE (your source of truth for costs and capabilities):\n\n${factoryProfile}`,
    },
    {
      type: "text" as const,
      text: `MARKET PRICING DATABASE (your source of truth for competitive positioning):\n\n${marketPricing}`,
    },
  ];
}

export type StreamEvent =
  | { type: "reasoning"; content: string }
  | { type: "text"; content: string }
  | { type: "done"; content: string; reasoning: string; model: string };

export async function* streamQuoteGeneration(
  request: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
): AsyncGenerator<StreamEvent> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const systemBlocks = buildSystemMessages();
  const systemMessage = systemBlocks.map((b) => b.text).join("\n\n---\n\n");
  const userMessage = buildUserMessage(request, urgency, customerInfo);

  const requestBody = {
    model: MODEL,
    max_tokens: 16000,
    stream: true,
    reasoning: {
      max_tokens: 8000,
    },
    provider: {
      order: ["anthropic"],
    },
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
  };

  console.log("\n========== OPENROUTER REQUEST ==========");
  console.log("Model:", MODEL);
  console.log("Reasoning: max_tokens=8000");
  console.log("System message length:", systemMessage.length, "chars");
  console.log("User message length:", userMessage.length, "chars");
  console.log("\n--- SYSTEM MESSAGE (first 2000 chars) ---");
  console.log(systemMessage.slice(0, 2000));
  console.log("\n--- USER MESSAGE ---");
  console.log(userMessage);
  console.log("========================================\n");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://eps-connect-demo.vercel.app",
      "X-Title": "AccuPrint Estimator",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter API error ${response.status}: ${errorBody}`
    );
  }

  if (!response.body) {
    throw new Error("No response body from OpenRouter");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let fullReasoning = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;

        // Log first few chunks to debug reasoning format
        if (fullText.length === 0 && fullReasoning.length === 0) {
          console.log("[SSE CHUNK] delta keys:", delta ? Object.keys(delta) : "no delta", "| raw:", JSON.stringify(parsed).slice(0, 300));
        }

        // Reasoning tokens arrive first (before content).
        // Prefer reasoning_details (structured) over delta.reasoning (string)
        // to avoid duplication — some models send both with the same text.
        let gotReasoningDetail = false;
        const reasoningDetails = delta?.reasoning_details;
        if (reasoningDetails && Array.isArray(reasoningDetails)) {
          for (const detail of reasoningDetails) {
            if (detail.text) {
              gotReasoningDetail = true;
              fullReasoning += detail.text;
              yield { type: "reasoning", content: detail.text };
            }
          }
        }

        // Only use the string field if we didn't get structured details
        if (!gotReasoningDetail && delta?.reasoning) {
          fullReasoning += delta.reasoning;
          yield { type: "reasoning", content: delta.reasoning };
        }

        // Content tokens follow reasoning
        const content = delta?.content;
        if (content) {
          fullText += content;
          yield { type: "text", content };
        }
      } catch {
        // Skip malformed SSE chunks
      }
    }
  }

  console.log("\n========== OPENROUTER RESPONSE ==========");
  console.log("Reasoning length:", fullReasoning.length, "chars");
  console.log("Response length:", fullText.length, "chars");
  if (fullReasoning) {
    console.log("\n--- MODEL REASONING ---");
    console.log(fullReasoning);
  }
  console.log("\n--- FULL MODEL OUTPUT ---");
  console.log(fullText);
  console.log("=========================================\n");

  yield { type: "done", content: fullText, reasoning: fullReasoning, model: MODEL };
}
