// ============================================
// AccuPrint Estimator — TypeScript Types
// ============================================

// --- Customer Info ---
export interface CustomerInfo {
  name: string;
  company: string;
  email: string;
  phone?: string;
}

// --- Quote Request ---
export interface QuoteRequest {
  request: string;
  customerInfo?: CustomerInfo;
  urgency: "standard" | "rush" | "emergency";
}

// --- Quote Response (top-level) ---
export interface QuoteResponse {
  customer_quote: CustomerQuote;
  internal_costs: InternalCosts;
  competitive_analysis: CompetitiveAnalysis;
  win_strategy: WinStrategy;
}

// --- Customer Quote ---
export interface CustomerQuote {
  quote_number: string;
  customer: {
    name: string;
    company: string;
    email: string;
  };
  line_items: QuoteLineItem[];
  subtotal: number;
  package_discount_pct: number;
  package_discount_amt: number;
  total: number;
  valid_days: number;
  notes: string[];
}

export interface QuoteLineItem {
  item_number: number;
  product: string;
  specs: {
    size: string;
    pages?: number;
    colors: string;
    stock: string;
    finishing: string[];
    binding?: string;
  };
  quantities: QuantityOption[];
  lead_time_days: number;
  notes?: string;
}

export interface QuantityOption {
  qty: number;
  unit_price: number;
  total: number;
}

// --- Internal Costs ---
export interface InternalCosts {
  line_items: CostLineItem[];
  total_cost: number;
  total_revenue: number;
  total_margin: number;
  blended_margin_pct: number;
  blended_margin_ex_postage_pct?: number;
}

export interface CostLineItem {
  item_number: number;
  product: string;
  cost_breakdown: CostBreakdown;
  total_cost: number;
  sell_price: number;
  margin_dollars: number;
  margin_pct: number;
  target_margin_pct: number;
  margin_status: "on_target" | "below_target" | "below_minimum";
}

export interface CostBreakdown {
  materials: number;
  prepress: number;
  press: number;
  plates: number;
  finishing: number;
  shipping: number;
}

// --- Competitive Analysis ---
export interface CompetitiveAnalysis {
  line_items: CompetitiveLineItem[];
  scorecard: CompetitiveScorecard;
}

export interface CompetitiveLineItem {
  item_number: number;
  product: string;
  our_price_unit: number;
  market_low: number;
  market_avg: number;
  market_high: number;
  position: "BELOW_MARKET" | "AT_MARKET" | "ABOVE_MARKET" | "WELL_ABOVE_MARKET";
  variance_pct: number;
  competitors: Competitor[];
  recommendation: "HOLD" | "ADJUST_DOWN" | "ADJUST_UP";
  adjusted_price: number | null;
}

export interface Competitor {
  name: string;
  price: number;
  threat: string;
}

export interface CompetitiveScorecard {
  total_quote_value: number;
  market_value_avg: number;
  overall_position_pct: number;
  items_at_below_market: number;
  items_above_market: number;
  total_items: number;
  risk_level: "LOW" | "LOW_MEDIUM" | "MEDIUM" | "HIGH";
}

// --- Win Strategy ---
export interface WinStrategy {
  talking_points: string[];
  price_adjustments: PriceAdjustment[];
  package_discount_suggestion: string;
}

export interface PriceAdjustment {
  item: string;
  from: number;
  to: number;
  reason: string;
}

// --- Processing State ---
export type ProcessingStep =
  | "parsing"
  | "selecting"
  | "calculating"
  | "checking"
  | "generating"
  | "complete"
  | "error";

export interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
}
