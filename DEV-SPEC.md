# AccuPrint Estimator — Web App Development Specification

> **For**: Dev Team
> **From**: EPS Connect 2026 Demo — Steve Metcalf
> **Date**: February 11, 2026
> **Status**: Ready for development

---

## 1. WHAT WE BUILT

An AI-powered print estimating system with two integrated agents that work together to produce market-competitive quotes for a full-service commercial printing company. The system:

1. Takes inbound quote requests (free-form text describing what a customer needs printed)
2. Parses specs, selects production methods, and calculates costs from the ground up
3. Automatically benchmarks pricing against 30+ real US print vendors
4. Adjusts pricing to stay competitive while protecting margins
5. Outputs a professional customer-facing quote, internal cost breakdown, competitive analysis, and sales win strategy

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Core Data Files (the "brain")

| File | Purpose | Format | Update Frequency |
|------|---------|--------|-----------------|
| `factory-profile.md` | Plant capabilities, equipment, costs, materials, lead times, margins | Markdown with tables | Quarterly or when costs change |
| `market-pricing-database.md` | Competitive market pricing from 30+ US online print vendors | Markdown with tables | Monthly (via research swarm) |

### 2.2 Agent Definitions (the "skills")

| Agent | File | Role | When Used |
|-------|------|------|-----------|
| `print-estimator` | `.claude/agents/print-estimator.md` | Senior Estimator — parses requests, calculates costs, generates quotes with competitive analysis | Every inbound quote request |
| `competitive-pricer` | `.claude/agents/competitive-pricer.md` | Competitive Analyst — standalone market benchmarking for any quote or product | On-demand price checks, quote reviews |

### 2.3 Data Flow

```
Customer Quote Request (free-form text)
         │
         ▼
┌─────────────────────────┐
│   PRINT ESTIMATOR       │
│   Agent                 │
│                         │
│  Reads:                 │
│  ├─ factory-profile.md  │ ← Equipment, costs, materials, margins
│  └─ market-pricing-db   │ ← Competitor pricing data
│                         │
│  Step 1: Parse specs    │
│  Step 2: Select method  │ ← Offset vs digital vs wide-format
│  Step 3: Calculate cost │ ← Materials + press + finishing + markup
│  Step 4: Market check   │ ← Compare vs 30+ vendors
│  Step 5: Adjust pricing │ ← Target 5-15% above market avg
│  Step 6: Generate quote │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│              OUTPUT (4 sections)         │
│                                         │
│  1. Customer Quote (formatted, ready    │
│     to send to customer)                │
│                                         │
│  2. Internal Cost Breakdown (margins,   │
│     cost per component)                 │
│                                         │
│  3. Competitive Analysis (our price vs  │
│     market, competitor names, position) │
│                                         │
│  4. Win Strategy (sales talking points) │
└─────────────────────────────────────────┘
```

---

## 3. WEB APP REQUIREMENTS

### 3.1 User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Estimator** | Full access | Creates quotes, sees all sections including internal margins |
| **Sales Rep** | Customer quote + competitive analysis + win strategy | No raw cost data |
| **Manager** | Full access + analytics/reporting | Sees all quotes, margin trends, win rates |

### 3.2 Core Screens

#### Screen 1: New Quote Request
- **Input**: Free-form text area where the user pastes or types the customer's quote request (email, phone notes, RFQ form, etc.)
- **Customer Info**: Name, company, email, phone (auto-populated if existing customer)
- **Urgency**: Standard / Rush / Emergency radio buttons
- **Submit button**: "Generate Estimate"
- **Loading state**: Show progress while agent processes (typically 60-90 seconds)

#### Screen 2: Structured Quote Builder (Alternative Input)
For users who prefer a form-based approach:

| Field | Type | Options/Notes |
|-------|------|---------------|
| Customer name | Text | Auto-complete from CRM |
| Company | Text | |
| Product type | Dropdown | Flyers, Brochures, Booklets, Postcards, Banners, Labels, Business Cards, Folders, Envelopes, Custom |
| Quantity | Number | Allow multiple quantities (e.g., "1000, 2500, 5000") |
| Finished size | Dropdown + custom | Common sizes pre-loaded (8.5x11, 11x17, 4x6, 6x9, etc.) |
| Pages/panels | Number | For booklets and brochures |
| Paper/substrate | Dropdown | Populated from factory-profile.md stock list |
| Colors front | Dropdown | 4-color (CMYK), 2-color, 1-color (black), PMS spot |
| Colors back | Dropdown | Same as front + "Blank" option |
| Finishing | Multi-select checkboxes | Fold, Saddle stitch, Perfect bind, Laminate (matte/gloss), UV coat, Die cut, Foil stamp, Score, Perforate, Drill, Numbering, Shrink wrap |
| Artwork status | Radio | Print-ready PDF, Needs corrections, Need design |
| Delivery date | Date picker | Auto-calculates if rush/emergency |
| Delivery method | Dropdown | Pickup, Local delivery, Ship (UPS/FedEx), Mailing services |
| Special instructions | Text area | Free-form notes |
| Add another item | Button | For multi-SKU jobs |

#### Screen 3: Quote Results Dashboard
Split into **tabs** or **accordion sections**:

**Tab 1: Customer Quote** (printable/exportable)
- Professional formatted quote matching the template in print-estimator.md
- "Send to Customer" button (email integration)
- "Download PDF" button
- "Edit Quote" button (manually adjust any line item)

**Tab 2: Internal Cost Breakdown** (estimator/manager only)
- Table: Item | Material Cost | Press Cost | Finishing Cost | Total Cost | Sell Price | Margin $ | Margin %
- Color-coded margins: Green (at/above target), Yellow (below target but above min), Red (below minimum)
- Editable — allow manual margin/price overrides

**Tab 3: Competitive Analysis**
- Table: Item | Our Price | Market Low | Market Avg | Market High | Position | Variance
- Color-coded position: Green (AT MARKET), Yellow (ABOVE MARKET), Red (WELL ABOVE MARKET), Blue (BELOW MARKET)
- Competitor watchlist per item (vendor name, their price, why they're a threat)
- "Adjust to Market" button — one-click to move all WELL ABOVE items to target zone

**Tab 4: Win Strategy**
- Bullet-pointed sales talking points
- Competitor comparison highlights
- Suggested package discount if multi-item
- Printable "battle card" for sales meetings

#### Screen 4: Quote History / Dashboard
- Table of all quotes: Date, Customer, Total Value, Status (Draft/Sent/Won/Lost), Margin
- Filter by date range, customer, product type, status
- Analytics: Win rate, average margin, revenue by product type, market position trends

#### Screen 5: Settings / Data Management
- **Factory Profile Editor**: Form-based editor for factory-profile.md (equipment, costs, materials, margins)
- **Market Data Refresh**: Button to trigger a new research swarm to update market-pricing-database.md
- **User Management**: Role assignment
- **Email Templates**: Customize quote email templates

### 3.3 Key UX Requirements

1. **Speed matters**: The AI agent takes 60-90 seconds to generate a full quote. Show a clear loading state with progress indicators (e.g., "Parsing request...", "Calculating costs...", "Checking market prices...", "Generating quote...")

2. **The free-form input is the hero**: The #1 workflow is pasting a customer email and getting a complete quote back. Make this front and center.

3. **Editable outputs**: Every number in the quote should be manually editable after generation. Estimators need to tweak things.

4. **PDF export**: Customer quotes must export to clean, branded PDFs.

5. **Quote versioning**: Track revisions. When an estimator adjusts pricing, save both the original AI-generated version and the edited version.

6. **Mobile-friendly**: Sales reps will use this on phones during customer meetings to pull quick pricing.

---

## 4. API INTEGRATION

### 4.1 Claude API Integration

The web app calls the Claude API (Anthropic) with the agent system prompts and data files as context.

**API Call Structure:**

```javascript
// Pseudocode for the core API call
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929", // or claude-opus-4-6 for highest quality
  max_tokens: 8000,
  system: [
    // System prompt = print-estimator.md agent definition
    { type: "text", text: printEstimatorPrompt },
    // Factory profile as context
    { type: "text", text: factoryProfileContent },
    // Market pricing database as context
    { type: "text", text: marketPricingDatabaseContent }
  ],
  messages: [
    {
      role: "user",
      content: `Process this quote request:\n\n${customerRequest}`
    }
  ]
});
```

**Key implementation notes:**
- The factory profile and market database are loaded as system context on every call
- The agent definitions (print-estimator.md, competitive-pricer.md) become the system prompt
- No tool use or function calling needed for the basic flow — the agent does all calculations in-context
- For the "Market Data Refresh" feature, use tool_use with WebSearch to allow the agent to fetch live pricing

### 4.2 Structured Output

Ask the API to return JSON-structured output for easy parsing into the UI:

```json
{
  "customer_quote": {
    "quote_number": "QT-20260211-001",
    "customer": { "name": "", "company": "", "email": "" },
    "line_items": [
      {
        "item_number": 1,
        "product": "Event Program Brochure",
        "specs": {
          "size": "8.5\" x 11\"",
          "pages": 8,
          "colors": "4/4",
          "stock": "100# Gloss Text",
          "finishing": ["Saddle stitch"],
          "binding": "Saddle stitch"
        },
        "quantities": [
          { "qty": 5000, "unit_price": 0.36, "total": 1800.00 },
          { "qty": 10000, "unit_price": 0.27, "total": 2700.00 }
        ],
        "lead_time_days": 7,
        "notes": "Self-cover recommended for cost efficiency"
      }
    ],
    "subtotal": 17534.00,
    "package_discount_pct": 4,
    "package_discount_amt": 701.36,
    "total": 16832.64,
    "valid_days": 30,
    "notes": ["Print-ready PDFs required", "Proof approval before production"]
  },

  "internal_costs": {
    "line_items": [
      {
        "item_number": 1,
        "product": "Event Program Brochure",
        "cost_breakdown": {
          "materials": 313.00,
          "prepress": 50.00,
          "press": 488.00,
          "plates": 100.00,
          "finishing": 455.00,
          "shipping": 0.00
        },
        "total_cost": 1080.00,
        "sell_price": 1800.00,
        "margin_dollars": 720.00,
        "margin_pct": 40.0,
        "target_margin_pct": 40,
        "margin_status": "on_target"
      }
    ],
    "total_cost": 14200.00,
    "total_revenue": 17534.00,
    "total_margin": 3334.00,
    "blended_margin_pct": 19.0,
    "blended_margin_ex_postage_pct": 35.0
  },

  "competitive_analysis": {
    "line_items": [
      {
        "item_number": 1,
        "product": "Event Program Brochure (5K)",
        "our_price_unit": 0.36,
        "market_low": 0.33,
        "market_avg": 0.38,
        "market_high": 0.42,
        "position": "AT_MARKET",
        "variance_pct": -5.3,
        "competitors": [
          { "name": "ClubFlyers", "price": 0.33, "threat": "Cheapest published pricing" },
          { "name": "Summit Printing", "price": 0.42, "threat": "Competitive with full price grid" },
          { "name": "48HourPrint", "price": 0.40, "threat": "Fast turnaround, heavy promos" }
        ],
        "recommendation": "HOLD",
        "adjusted_price": null
      }
    ],
    "scorecard": {
      "total_quote_value": 17534,
      "market_value_avg": 16800,
      "overall_position_pct": 4.4,
      "items_at_below_market": 4,
      "items_above_market": 2,
      "total_items": 6,
      "risk_level": "LOW_MEDIUM"
    }
  },

  "win_strategy": {
    "talking_points": [
      "We're beating online vendors on brochures and flyers",
      "Banner stands are all-in pricing with 12 custom designs in 5 days",
      "Single vendor for all 6 items = consistent quality and coordinated delivery",
      "We hit your 2-week direct mail deadline because we control print and mail in-house",
      "4% package discount already applied for multi-item commitment"
    ],
    "price_adjustments": [
      { "item": "Postcards", "from": 0.08, "to": 0.06, "reason": "Match PostcardMania bundle rate" }
    ],
    "package_discount_suggestion": "4% for 6+ line items"
  }
}
```

### 4.3 Suggested Tech Stack

| Layer | Recommendation | Why |
|-------|---------------|-----|
| **Frontend** | Next.js + React + Tailwind CSS | Fast, modern, great for dashboards |
| **UI Components** | shadcn/ui | Clean, professional components |
| **Backend/API** | Next.js API routes or Express | Simple, handles Claude API calls |
| **AI** | Anthropic Claude API (claude-sonnet-4-5 or claude-opus-4-6) | Powers the estimator and competitive pricer |
| **Database** | Supabase (PostgreSQL) | Quote storage, customer CRM, user auth |
| **Auth** | Supabase Auth or Clerk | Role-based access (Estimator/Sales/Manager) |
| **PDF Generation** | @react-pdf/renderer or Puppeteer | Customer quote PDF export |
| **Email** | Resend or SendGrid | Send quotes to customers |
| **Hosting** | Vercel | Easy deploy, great with Next.js |
| **File Storage** | Supabase Storage | Store uploaded artwork/files |

---

## 5. DATA FILES — COMPLETE REFERENCE

### 5.1 factory-profile.md

This file defines AccuPrint's entire operation. Key sections:

| Section | What It Contains |
|---------|-----------------|
| Equipment — Offset Presses | 3 presses: XL 106 (40"), SM 74 (20"), SM 52 (15"). Speeds, rates, plate costs, makeready |
| Equipment — Digital Presses | HP Indigo 15K, Ricoh Pro C9500, Xerox Iridesse. Click charges per format |
| Equipment — Wide Format | HP Latex 800W, EFI VUTEk h5, Roland TrueVIS. Per-sq-ft pricing |
| Equipment — Label Presses | Mark Andy Digital Series (hybrid), Gallus ECS 340 (flexo) |
| Finishing & Bindery | Cutter, folder, perfect binder, saddle stitcher, die cutter, laminator, numbering, etc. |
| Paper Stock Pricing | Full table: bond, offset, text, cover, gloss, NCR. Cost per 1,000 parent sheets |
| Envelopes | #10, 6x9, 9x12, A7. Cost per 1,000 |
| Lead Times | Matrix: product type x standard/rush/emergency |
| Prepress Services | Rates for design, preflight, proofing, corrections |
| Shipping & Fulfillment | Local delivery, pallet, UPS/FedEx, mailing, kitting, warehousing |
| Quantity Breaks | Tier discounts from 1-249 through 25,000+ |
| Markup & Margins | Target and minimum margins by job type. Rush/emergency multipliers. Minimum job charges |

### 5.2 market-pricing-database.md

Compiled from live research across 30+ vendors. Key sections:

| Section | Products Covered | Data Points |
|---------|-----------------|-------------|
| Flyers & Sell Sheets | 8.5x11, 4/4, 100# gloss text | Qty 500–25K, 10+ vendors |
| Tri-Fold Brochures | 8.5x11 flat, 4/4, 100# gloss text | Qty 250–10K, 15+ vendors |
| Saddle-Stitched Booklets | 8.5x11, 4/4, 8pp and 16pp | Qty 250–10K, 8+ vendors |
| Postcards (print-only) | 4x6 and 6x9, 14pt, 4/4 | Qty 500–50K, 10+ vendors |
| Direct Mail (full-service) | Print + mail + postage | Qty 1K–50K, bundled pricing |
| USPS Postage Rates | 2026 rates | First-Class, Marketing Mail, EDDM |
| Vinyl Banners | 3x6 and 4x8, 13oz vinyl | Qty 1–50, 8+ vendors |
| Retractable Banner Stands | 33x80, print + hardware | Qty 1–25, economy/mid/premium tiers |
| Foam Board & Coroplast Signs | 24x36 | Qty 1–100, 6+ vendors |
| Posters | 24x36 various stocks | Qty 1–250, 6+ vendors |
| Die-Cut Vinyl Stickers | 3x3 glossy vinyl | Qty 50–10K, 8+ vendors |
| Product Labels (rolls) | 2x3 white BOPP | Qty 250–10K, 8+ vendors |
| Clear Labels | 2x3 clear BOPP | Qty 250–10K, 6+ vendors |
| Business Collateral | Cards, folders, letterhead | PENDING — to be added |

Each section includes:
- Per-unit pricing at Low / Average / High by quantity tier
- "Top Competitors" table with vendor name, positioning, and strengths
- Vendor URLs for reference

### 5.3 Agent Prompt Files

| File | Size | Purpose |
|------|------|---------|
| `.claude/agents/print-estimator.md` | ~240 lines | Full estimator system prompt with workflow, quote template, rules, communication style |
| `.claude/agents/competitive-pricer.md` | ~140 lines | Competitive analysis system prompt with report format, thresholds, adjustment rules |

---

## 6. FUTURE ENHANCEMENTS

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| **CRM Integration** | Pull customer history, past quotes, win/loss data | High |
| **Auto Market Refresh** | Monthly cron job that spawns research agents to update market-pricing-database.md | High |
| **Quote Follow-Up** | Automated email reminders for quotes pending approval | Medium |
| **Job Ticket Generation** | Convert won quotes into production job tickets | Medium |
| **Real-Time Inventory** | Connect to paper/substrate inventory for stock availability | Medium |
| **Artwork Upload** | Customers upload files directly through the quote interface | Medium |
| **Customer Portal** | Self-service portal where customers can request quotes and track orders | Low |
| **Analytics Dashboard** | Win rate, margin trends, competitive position over time, most-quoted products | Low |
| **Multi-Plant Support** | Extend factory-profile.md to support multiple plant locations | Low |
| **ERP Integration** | Connect to existing print MIS/ERP (Pace, PrintSmith, EFI Monarch, etc.) | Low |

---

## 7. DEMO SCENARIOS FOR TESTING

Use these to validate the web app produces correct output:

1. **Simple flyer**: "500 full-color flyers, 8.5x11, double-sided, 100# gloss text, 5-day turnaround"
   - Expected: Digital press, ~$140-160, AT MARKET

2. **Multi-quantity brochure**: "Quote 1,000, 2,500, and 5,000 tri-fold brochures, 8.5x11 flat, 4/4, 80# gloss text"
   - Expected: Offset on SM 74, quotes all 3 qtys, shows volume savings

3. **Rush wide format**: "12 retractable banner stands, 33x80, 12 different designs, need them in 3 days"
   - Expected: Rush surcharge applied, flags tight timeline

4. **Direct mail package**: "25,000 postcards, 6x9, 4/4, 14pt C2S, with full mailing services"
   - Expected: Offset on XL 106, includes mailing breakdown, compares to PostcardMania

5. **Multi-SKU conference kit**: The full Imagine AI Live 6-item request
   - Expected: Package discount, mixed production methods, full competitive analysis

6. **Edge case — below crossover**: "200 business cards" → should quote digital
7. **Edge case — specialty**: "1,000 labels on clear BOPP with matte lamination" → should quote digital label press
8. **Edge case — rush**: "5,000 flyers by tomorrow" → should quote emergency pricing at 2x

---

## 8. FILE LOCATIONS

All project files are at:

```
/Users/stephenmetcalf/Desktop/eps-connect-demo/
├── CLAUDE.md                              # Project overview
├── DEV-SPEC.md                            # THIS FILE
├── factory-profile.md                     # Plant data (~300 lines)
├── market-pricing-database.md             # Market data (~500 lines)
└── .claude/agents/
    ├── print-estimator.md                 # Estimator agent (~240 lines)
    └── competitive-pricer.md              # Competitive analyst (~140 lines)
```

All files are markdown — easy to read, edit, and load as context into the Claude API.
