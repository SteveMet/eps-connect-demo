import Anthropic from "@anthropic-ai/sdk";
import type { QuoteResponse } from "./types";
import {
  loadPrintEstimatorPrompt,
  loadCompetitivePricerPrompt,
  loadFactoryProfile,
  loadMarketPricingDatabase,
} from "./knowledge-base";

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

export async function* streamQuoteGeneration(
  request: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
): AsyncGenerator<{ type: "text" | "done"; content: string }> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemMessages = buildSystemMessages();
  const userMessage = buildUserMessage(request, urgency, customerInfo);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 16000,
    system: systemMessages,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  let fullText = "";

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      yield { type: "text", content: event.delta.text };
    }
  }

  yield { type: "done", content: fullText };
}
