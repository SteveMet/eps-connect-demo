import type { QuoteResponse } from "./types";

/**
 * Parse the Claude API response into a structured QuoteResponse.
 * Handles markdown code fences and extra text around the JSON.
 */
export function parseQuoteResponse(raw: string): QuoteResponse {
  // Try to extract JSON from markdown code fences first
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : raw;

  // Try to find a JSON object in the string
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!objectMatch) {
    throw new Error("No JSON object found in response");
  }

  let parsed: QuoteResponse;
  try {
    parsed = JSON.parse(objectMatch[0]);
  } catch (e) {
    throw new Error(
      `Failed to parse JSON: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }

  // Validate required top-level keys
  const requiredKeys: (keyof QuoteResponse)[] = [
    "customer_quote",
    "internal_costs",
    "competitive_analysis",
    "win_strategy",
  ];

  for (const key of requiredKeys) {
    if (!parsed[key]) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  // Validate customer_quote has line_items
  if (
    !parsed.customer_quote.line_items ||
    !Array.isArray(parsed.customer_quote.line_items)
  ) {
    throw new Error("customer_quote.line_items must be an array");
  }

  return parsed;
}
