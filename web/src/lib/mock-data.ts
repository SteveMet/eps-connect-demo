import type { QuoteResponse } from "./types";

/**
 * Generate a realistic mock quote response for demo/simulation mode.
 * This uses data consistent with the factory profile and market pricing database.
 */
export function generateMockQuoteResponse(
  request: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
): QuoteResponse {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
  const quoteNum = `QT-${dateStr}-001`;

  const lowerReq = request.toLowerCase();

  // Detect what kind of job this is from the request text
  if (lowerReq.includes("banner stand") || lowerReq.includes("retractable")) {
    return generateBannerStandQuote(quoteNum, urgency, customerInfo, request);
  } else if (lowerReq.includes("brochure") || lowerReq.includes("tri-fold")) {
    return generateBrochureQuote(quoteNum, urgency, customerInfo, request);
  } else if (lowerReq.includes("postcard") || lowerReq.includes("direct mail")) {
    return generatePostcardQuote(quoteNum, urgency, customerInfo, request);
  } else if (lowerReq.includes("label") || lowerReq.includes("sticker")) {
    return generateLabelQuote(quoteNum, urgency, customerInfo, request);
  } else {
    // Default: flyer quote
    return generateFlyerQuote(quoteNum, urgency, customerInfo, request);
  }
}

function rushMultiplier(urgency: string): number {
  if (urgency === "rush") return 1.5;
  if (urgency === "emergency") return 2.0;
  return 1.0;
}

/** Round to 2 decimal places consistently */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Build a quantity option with consistent math */
function qty(q: number, baseUnitPrice: number, mult: number) {
  const unitPrice = r2(baseUnitPrice * mult);
  return { qty: q, unit_price: unitPrice, total: r2(unitPrice * q) };
}

function generateFlyerQuote(
  quoteNum: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string },
  _request?: string
): QuoteResponse {
  const mult = rushMultiplier(urgency);

  return {
    customer_quote: {
      quote_number: quoteNum,
      customer: {
        name: customerInfo?.name || "Valued Customer",
        company: customerInfo?.company || "",
        email: customerInfo?.email || "",
      },
      line_items: [
        {
          item_number: 1,
          product: "Full-Color Flyers",
          specs: {
            size: '8.5" x 11"',
            colors: "4/4 (Full Color Both Sides)",
            stock: "100# Gloss Text",
            finishing: ["Cut to size"],
          },
          quantities: [
            qty(500, 0.29, mult),
            qty(1000, 0.20, mult),
            qty(2500, 0.13, mult),
          ],
          lead_time_days: urgency === "emergency" ? 1 : urgency === "rush" ? 2 : 5,
          notes: "Digital press recommended at 500-1,000 qty. Offset becomes more economical at 2,500+.",
        },
      ],
      subtotal: qty(500, 0.29, mult).total,
      package_discount_pct: 0,
      package_discount_amt: 0,
      total: qty(500, 0.29, mult).total,
      valid_days: 30,
      notes: [
        "Prices based on print-ready PDF files",
        "Proof approval required before production",
        "Terms: Net 30 (approved accounts)",
        urgency !== "standard"
          ? `${urgency.toUpperCase()} pricing applied (${urgency === "rush" ? "1.5x" : "2x"} standard rate)`
          : "",
      ].filter(Boolean),
    },
    internal_costs: {
      line_items: [
        {
          item_number: 1,
          product: "Full-Color Flyers (500)",
          cost_breakdown: {
            materials: 18.5,
            prepress: 35.0,
            press: 30.0,
            plates: 0,
            finishing: 15.0,
            shipping: 0,
          },
          total_cost: 98.5,
          sell_price: qty(500, 0.29, mult).total,
          margin_dollars: r2(qty(500, 0.29, mult).total - 98.5),
          margin_pct: r2(((qty(500, 0.29, mult).total - 98.5) / qty(500, 0.29, mult).total) * 100),
          target_margin_pct: 45,
          margin_status: "below_target",
        },
      ],
      total_cost: 98.5,
      total_revenue: qty(500, 0.29, mult).total,
      total_margin: r2(qty(500, 0.29, mult).total - 98.5),
      blended_margin_pct: r2(((qty(500, 0.29, mult).total - 98.5) / qty(500, 0.29, mult).total) * 100),
    },
    competitive_analysis: {
      line_items: [
        {
          item_number: 1,
          product: "Full-Color Flyers (500)",
          our_price_unit: r2(0.29 * mult),
          market_low: 0.28,
          market_avg: 0.30,
          market_high: 0.43,
          position: "AT_MARKET",
          variance_pct: -3.3,
          competitors: [
            { name: "Printkeg", price: 0.28, threat: "Price match guarantee, fast shipping" },
            { name: "ClubFlyers", price: 0.29, threat: "Published pricing, consistent cheapest at 1K+" },
            { name: "NextDayFlyers", price: 0.35, threat: "Same-day printing, 99.8% on-time rate" },
          ],
          recommendation: "HOLD",
          adjusted_price: null,
        },
      ],
      scorecard: {
        total_quote_value: qty(500, 0.29, mult).total,
        market_value_avg: 150,
        overall_position_pct: -3.3,
        items_at_below_market: 1,
        items_above_market: 0,
        total_items: 1,
        risk_level: "LOW",
      },
    },
    win_strategy: {
      talking_points: [
        "Our price is right at market average — no price objection expected",
        "Emphasize our 5-day turnaround with local delivery included",
        "Digital press gives us flexibility for last-minute file changes",
        "Offer to quote 1,000 and 2,500 to show volume savings",
        "Free preflight included on orders over $500 — mention this for repeat business",
      ],
      price_adjustments: [],
      package_discount_suggestion: "Offer 5% discount if they commit to monthly recurring order of 1,000+",
    },
  };
}

function generateBrochureQuote(
  quoteNum: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string },
  _request?: string
): QuoteResponse {
  const mult = rushMultiplier(urgency);

  return {
    customer_quote: {
      quote_number: quoteNum,
      customer: {
        name: customerInfo?.name || "Valued Customer",
        company: customerInfo?.company || "",
        email: customerInfo?.email || "",
      },
      line_items: [
        {
          item_number: 1,
          product: "Tri-Fold Brochures",
          specs: {
            size: '8.5" x 11" flat (folds to 3.67" x 8.5")',
            colors: "4/4 (Full Color Both Sides)",
            stock: "100# Gloss Text",
            finishing: ["Tri-fold", "Aqueous coating"],
          },
          quantities: [
            { qty: 1000, unit_price: r2(0.27 * mult), total: r2(270 * mult) },
            { qty: 2500, unit_price: r2(0.16 * mult), total: r2(400 * mult) },
            { qty: 5000, unit_price: r2(0.11 * mult), total: r2(550 * mult) },
          ],
          lead_time_days: urgency === "emergency" ? 3 : urgency === "rush" ? 4 : 7,
          notes: "Offset on SM 74. Aqueous coating included for scuff resistance. 80# gloss text also available at ~8% savings.",
        },
      ],
      subtotal: r2(270 * mult),
      package_discount_pct: 0,
      package_discount_amt: 0,
      total: r2(270 * mult),
      valid_days: 30,
      notes: [
        "Prices based on print-ready PDF files",
        "Proof approval required before production",
        "Aqueous coating included at no extra charge on offset runs",
        "Terms: Net 30 (approved accounts)",
      ],
    },
    internal_costs: {
      line_items: [
        {
          item_number: 1,
          product: "Tri-Fold Brochures (1,000)",
          cost_breakdown: {
            materials: 32.0,
            prepress: 25.0,
            press: 62.5,
            plates: 100.0,
            finishing: 40.0,
            shipping: 0,
          },
          total_cost: 159.5,
          sell_price: r2(270 * mult),
          margin_dollars: r2(270 * mult - 159.5),
          margin_pct: r2(((270 * mult - 159.5) / (270 * mult)) * 100),
          target_margin_pct: 40,
          margin_status: "on_target",
        },
      ],
      total_cost: 159.5,
      total_revenue: r2(270 * mult),
      total_margin: r2(270 * mult - 159.5),
      blended_margin_pct: r2(((270 * mult - 159.5) / (270 * mult)) * 100),
    },
    competitive_analysis: {
      line_items: [
        {
          item_number: 1,
          product: "Tri-Fold Brochures (1,000)",
          our_price_unit: r2(0.27 * mult),
          market_low: 0.22,
          market_avg: 0.25,
          market_high: 0.28,
          position: "ABOVE_MARKET",
          variance_pct: 8.0,
          competitors: [
            { name: "ClubFlyers", price: 0.22, threat: "Cheapest at 1K+, published pricing" },
            { name: "Overnight Grafix", price: 0.26, threat: "AQ coating included, design services" },
            { name: "48HourPrint", price: 0.25, threat: "Fast turnaround, heavy promos" },
          ],
          recommendation: "HOLD",
          adjusted_price: null,
        },
      ],
      scorecard: {
        total_quote_value: r2(270 * mult),
        market_value_avg: 250,
        overall_position_pct: 8.0,
        items_at_below_market: 0,
        items_above_market: 1,
        total_items: 1,
        risk_level: "LOW",
      },
    },
    win_strategy: {
      talking_points: [
        "8% above market average — well within our service premium zone",
        "Aqueous coating included at no extra charge (competitors charge extra)",
        "Local delivery and hands-on account management vs. online self-service",
        "Show 2,500 and 5,000 pricing to demonstrate significant volume savings",
        "Offer free hard copy proof — online vendors charge for this",
      ],
      price_adjustments: [],
      package_discount_suggestion: "3% discount if ordered with another print item (business cards, flyers, etc.)",
    },
  };
}

function generateBannerStandQuote(
  quoteNum: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string },
  _request?: string
): QuoteResponse {
  const mult = rushMultiplier(urgency);

  return {
    customer_quote: {
      quote_number: quoteNum,
      customer: {
        name: customerInfo?.name || "Valued Customer",
        company: customerInfo?.company || "",
        email: customerInfo?.email || "",
      },
      line_items: [
        {
          item_number: 1,
          product: "Retractable Banner Stands",
          specs: {
            size: '33" x 80"',
            colors: "Full Color",
            stock: "Premium Photo Satin (8mil poly)",
            finishing: ["Retractable aluminum stand", "Padded carry bag"],
          },
          quantities: [
            { qty: 12, unit_price: r2(148 * mult), total: r2(1776 * mult) },
            { qty: 20, unit_price: r2(138 * mult), total: r2(2760 * mult) },
          ],
          lead_time_days: urgency === "emergency" ? 2 : urgency === "rush" ? 3 : 5,
          notes: "Includes mid-range retractable stand with chrome base and padded carry bag. 12 unique designs, no extra charge.",
        },
      ],
      subtotal: r2(1776 * mult),
      package_discount_pct: 0,
      package_discount_amt: 0,
      total: r2(1776 * mult),
      valid_days: 30,
      notes: [
        "Prices include print + hardware + carry bags",
        "12 unique designs at no additional charge",
        "Print-ready files required (300dpi, CMYK)",
        urgency !== "standard"
          ? `${urgency.toUpperCase()} pricing applied — ${urgency === "rush" ? "3" : "2"}-day turnaround`
          : "Standard 5 business day turnaround",
        "Terms: Net 30 (approved accounts)",
      ],
    },
    internal_costs: {
      line_items: [
        {
          item_number: 1,
          product: "Retractable Banner Stands (12)",
          cost_breakdown: {
            materials: 420.0,
            prepress: 50.0,
            press: 180.0,
            plates: 0,
            finishing: 96.0,
            shipping: 0,
          },
          total_cost: 746.0,
          sell_price: r2(1776 * mult),
          margin_dollars: r2(1776 * mult - 746),
          margin_pct: r2(((1776 * mult - 746) / (1776 * mult)) * 100),
          target_margin_pct: 50,
          margin_status: urgency === "standard" ? "on_target" : "on_target",
        },
      ],
      total_cost: 746.0,
      total_revenue: r2(1776 * mult),
      total_margin: r2(1776 * mult - 746),
      blended_margin_pct: r2(((1776 * mult - 746) / (1776 * mult)) * 100),
    },
    competitive_analysis: {
      line_items: [
        {
          item_number: 1,
          product: "Retractable Banner Stands (12)",
          our_price_unit: r2(148 * mult),
          market_low: 95,
          market_avg: 135,
          market_high: 185,
          position: urgency === "standard" ? "ABOVE_MARKET" : "WELL_ABOVE_MARKET",
          variance_pct: urgency === "standard" ? 9.6 : r2(((148 * mult - 135) / 135) * 100),
          competitors: [
            { name: "Elite Flyers", price: 103, threat: "Best volume pricing at 10+ stands" },
            { name: "BannerBuzz", price: 95, threat: "Lowest single-unit price from $59" },
            { name: "Signs.com", price: 145, threat: "Transparent pricing, same-day production" },
          ],
          recommendation: urgency === "standard" ? "HOLD" : "HOLD",
          adjusted_price: null,
        },
      ],
      scorecard: {
        total_quote_value: r2(1776 * mult),
        market_value_avg: 1620,
        overall_position_pct: urgency === "standard" ? 9.6 : r2(((1776 * mult - 1620) / 1620) * 100),
        items_at_below_market: 0,
        items_above_market: 1,
        total_items: 1,
        risk_level: urgency === "standard" ? "LOW" : "MEDIUM",
      },
    },
    win_strategy: {
      talking_points: [
        "All 12 unique designs included at one price — online vendors charge per design",
        "Mid-range chrome hardware included (not economy stands that break at events)",
        "We can handle last-minute design changes in-house",
        urgency !== "standard"
          ? "Rush turnaround is our advantage — online vendors can't match this speed"
          : "5-day turnaround competitive with online, but with local pickup/delivery option",
        "Padded carry bags included — most budget vendors charge extra",
        "Reprint individual graphics later without buying new hardware",
      ],
      price_adjustments:
        urgency !== "standard"
          ? [
              {
                item: "Banner Stands",
                from: r2(148 * mult),
                to: r2(140 * mult),
                reason: "Slight reduction to stay competitive on rush pricing",
              },
            ]
          : [],
      package_discount_suggestion:
        "Offer 5% discount if they also order event materials (flyers, programs, name badges)",
    },
  };
}

function generatePostcardQuote(
  quoteNum: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string },
  _request?: string
): QuoteResponse {
  const mult = rushMultiplier(urgency);

  return {
    customer_quote: {
      quote_number: quoteNum,
      customer: {
        name: customerInfo?.name || "Valued Customer",
        company: customerInfo?.company || "",
        email: customerInfo?.email || "",
      },
      line_items: [
        {
          item_number: 1,
          product: "Postcards (Print Only)",
          specs: {
            size: '6" x 9"',
            colors: "4/4 (Full Color Both Sides)",
            stock: "14pt C2S with UV Coating",
            finishing: ["UV coating both sides", "Cut to size"],
          },
          quantities: [
            { qty: 5000, unit_price: r2(0.12 * mult), total: r2(600 * mult) },
            { qty: 10000, unit_price: r2(0.09 * mult), total: r2(900 * mult) },
            { qty: 25000, unit_price: r2(0.07 * mult), total: r2(1750 * mult) },
          ],
          lead_time_days: urgency === "emergency" ? 2 : urgency === "rush" ? 3 : 7,
          notes: "Offset on XL 106 for all quantities. UV coating included for professional finish.",
        },
      ],
      subtotal: r2(600 * mult),
      package_discount_pct: 0,
      package_discount_amt: 0,
      total: r2(600 * mult),
      valid_days: 30,
      notes: [
        "Prices based on print-ready PDF files",
        "UV coating included on both sides",
        "EDDM and mailing services available — ask for full-service direct mail pricing",
        "Terms: Net 30 (approved accounts)",
      ],
    },
    internal_costs: {
      line_items: [
        {
          item_number: 1,
          product: "Postcards 6x9 (5,000)",
          cost_breakdown: {
            materials: 85.0,
            prepress: 25.0,
            press: 95.0,
            plates: 100.0,
            finishing: 45.0,
            shipping: 0,
          },
          total_cost: 350.0,
          sell_price: r2(600 * mult),
          margin_dollars: r2(600 * mult - 350),
          margin_pct: r2(((600 * mult - 350) / (600 * mult)) * 100),
          target_margin_pct: 40,
          margin_status: "on_target",
        },
      ],
      total_cost: 350.0,
      total_revenue: r2(600 * mult),
      total_margin: r2(600 * mult - 350),
      blended_margin_pct: r2(((600 * mult - 350) / (600 * mult)) * 100),
    },
    competitive_analysis: {
      line_items: [
        {
          item_number: 1,
          product: "Postcards 6x9 (5,000)",
          our_price_unit: r2(0.12 * mult),
          market_low: 0.05,
          market_avg: 0.11,
          market_high: 0.18,
          position: "ABOVE_MARKET",
          variance_pct: 9.1,
          competitors: [
            { name: "PostcardMania", price: 0.10, threat: "Full-service DM specialist, campaigns from $289" },
            { name: "GotPrint", price: 0.08, threat: "Low print costs, EDDM available" },
            { name: "PrintPlace", price: 0.07, threat: "As low as $0.01/pc at extreme volume" },
          ],
          recommendation: "HOLD",
          adjusted_price: null,
        },
      ],
      scorecard: {
        total_quote_value: r2(600 * mult),
        market_value_avg: 550,
        overall_position_pct: 9.1,
        items_at_below_market: 0,
        items_above_market: 1,
        total_items: 1,
        risk_level: "LOW",
      },
    },
    win_strategy: {
      talking_points: [
        "9% above average — right in our target premium zone",
        "UV coating included (many budget vendors charge extra)",
        "We can do EDDM and full mailing services in-house — one vendor for everything",
        "Show 10K and 25K pricing to demonstrate significant volume savings",
        "Local delivery included on orders over $250",
      ],
      price_adjustments: [],
      package_discount_suggestion: "Bundle with mailing services for 5% print discount",
    },
  };
}

function generateLabelQuote(
  quoteNum: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string },
  _request?: string
): QuoteResponse {
  const mult = rushMultiplier(urgency);

  return {
    customer_quote: {
      quote_number: quoteNum,
      customer: {
        name: customerInfo?.name || "Valued Customer",
        company: customerInfo?.company || "",
        email: customerInfo?.email || "",
      },
      line_items: [
        {
          item_number: 1,
          product: "Product Labels on Rolls",
          specs: {
            size: '2" x 3"',
            colors: "Full Color (CMYK)",
            stock: "White BOPP with Matte Lamination",
            finishing: ["Matte lamination", "Die cut to shape", "Rolls of 500"],
          },
          quantities: [
            { qty: 1000, unit_price: r2(0.28 * mult), total: r2(280 * mult) },
            { qty: 2500, unit_price: r2(0.19 * mult), total: r2(475 * mult) },
            { qty: 5000, unit_price: r2(0.14 * mult), total: r2(700 * mult) },
          ],
          lead_time_days: urgency === "emergency" ? 2 : urgency === "rush" ? 3 : 5,
          notes: "Digital label press (Mark Andy). Matte lamination for durability and professional look. Wound on 3\" core, rolls of 500.",
        },
      ],
      subtotal: r2(280 * mult),
      package_discount_pct: 0,
      package_discount_amt: 0,
      total: r2(280 * mult),
      valid_days: 30,
      notes: [
        "Prices based on print-ready PDF files",
        "Existing die on file — no die charge",
        "Labels wound on 3\" core, rolls of 500",
        "Terms: Net 30 (approved accounts)",
      ],
    },
    internal_costs: {
      line_items: [
        {
          item_number: 1,
          product: "Product Labels 2x3 (1,000)",
          cost_breakdown: {
            materials: 35.0,
            prepress: 25.0,
            press: 60.0,
            plates: 0,
            finishing: 25.0,
            shipping: 0,
          },
          total_cost: 145.0,
          sell_price: r2(280 * mult),
          margin_dollars: r2(280 * mult - 145),
          margin_pct: r2(((280 * mult - 145) / (280 * mult)) * 100),
          target_margin_pct: 45,
          margin_status: "on_target",
        },
      ],
      total_cost: 145.0,
      total_revenue: r2(280 * mult),
      total_margin: r2(280 * mult - 145),
      blended_margin_pct: r2(((280 * mult - 145) / (280 * mult)) * 100),
    },
    competitive_analysis: {
      line_items: [
        {
          item_number: 1,
          product: "Product Labels 2x3 BOPP (1,000)",
          our_price_unit: r2(0.28 * mult),
          market_low: 0.15,
          market_avg: 0.26,
          market_high: 0.45,
          position: "ABOVE_MARKET",
          variance_pct: 7.7,
          competitors: [
            { name: "SheetLabels.com", price: 0.15, threat: "Lowest prices guaranteed, fast rush options" },
            { name: "StickerGiant", price: 0.20, threat: "Roll labels specialist, machine-apply options" },
            { name: "Lightning Labels", price: 0.28, threat: "No setup fees, digital specialist" },
          ],
          recommendation: "HOLD",
          adjusted_price: null,
        },
      ],
      scorecard: {
        total_quote_value: r2(280 * mult),
        market_value_avg: 260,
        overall_position_pct: 7.7,
        items_at_below_market: 0,
        items_above_market: 1,
        total_items: 1,
        risk_level: "LOW",
      },
    },
    win_strategy: {
      talking_points: [
        "7.7% above average — solidly within our service premium zone",
        "Matte lamination included — adds durability and professional feel",
        "Digital press means no plate charges and exact quantity (no minimum overrun)",
        "Show 2,500 and 5,000 pricing for significant volume savings",
        "We can do clear BOPP for a ~20% premium if they want a no-label look",
      ],
      price_adjustments: [],
      package_discount_suggestion: "5% off if they also order shipping boxes or marketing materials",
    },
  };
}
