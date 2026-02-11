# EPS Connect 2026 Demo — Print Estimating Agent

This project demonstrates a Claude Code agent system that acts as an expert commercial print estimator with built-in competitive intelligence.

## Project Structure

- `factory-profile.md` — Complete plant capabilities, equipment, pricing, materials, and lead times
- `market-pricing-database.md` — Current market pricing from 30+ US online print vendors (compiled Feb 2026)
- `.claude/agents/print-estimator.md` — The estimator agent (quotes, costing, production planning)
- `.claude/agents/competitive-pricer.md` — The competitive pricing analyst (market benchmarking)

## How It Works

The system has two integrated capabilities:

### 1. Print Estimator (`print-estimator`)
Takes inbound quote requests and produces professional estimates. Automatically checks market pricing on every quote.

### 2. Competitive Pricer (`competitive-pricer`)
Benchmarks any quote against real market data. Shows where we stand vs. online competitors, identifies who we're up against, and recommends pricing adjustments.

## How to Use

From this directory, invoke the estimator:

```
/agents print-estimator
```

Then paste in a customer quote request. The agent will:
1. Parse the customer specs
2. Select the best production method
3. Calculate costs from the ground up
4. **Check pricing against 30+ online competitors**
5. Produce a professional formatted quote
6. Show internal cost breakdown with margins
7. **Include competitive position analysis and competitor watchlist**

For a standalone competitive analysis on any quote:

```
/agents competitive-pricer
```

## Market Data Coverage

The market pricing database covers 6 product categories with data from real vendors:

| Category | Vendors Researched | Key Competitors |
|----------|-------------------|-----------------|
| Flyers & Sell Sheets | 10+ | ClubFlyers, GotPrint, NextDayFlyers, PrintPlace |
| Brochures & Booklets | 15+ | ClubFlyers, Summit Printing, Conquest Graphics |
| Postcards & Direct Mail | 10+ | PostcardMania, Modern Postcard, GotPrint |
| Wide Format & Banners | 10+ | Signs.com, Blue Wave, BannerBuzz, Elite Flyers |
| Labels & Stickers | 10+ | StickerMule, StickerGiant, Lightning Labels |
| Business Collateral | Pending | VistaPrint, Moo, GotPrint, PrintPlace |

## Demo Scenarios

1. **Simple digital job**: "I need 500 full-color flyers, 8.5x11, double-sided, 100# gloss text. Need them in 5 days."
2. **Offset with finishing**: "Quote me 10,000 tri-fold brochures, 8.5x11 flat, 4/4 on 80# gloss text, with aqueous coating. Also need 25,000."
3. **Wide format**: "We need 20 retractable banner stands, 33x80 inches, full color, for a trade show next week."
4. **Labels**: "I need pricing on 50,000 product labels, 3x2 inches, 4-color on white BOPP with matte lamination."
5. **Multi-SKU with competitive analysis**: "We have a product launch kit: 1,000 each of a sell sheet, a pocket folder, and business cards. What's the market rate and can you beat it?"
6. **Re-run Imagine AI Live quote**: Paste the original 6-item conference package and watch the agent catch pricing gaps vs. market.
