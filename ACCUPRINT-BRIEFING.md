# AccuPrint Estimator: AI-Powered Print Quoting

## Prototype Briefing — EPS Connect 2026

---

## Overview

AccuPrint Estimator is a prototype web application that demonstrates how AI can transform the commercial print estimating workflow. Built live during a session at the **EPS Connect 2026** conference for printing industry leaders, the app shows how a senior estimator's domain knowledge — production methods, cost structures, competitive market pricing — can be encoded into an AI system that generates professional, competitively-benchmarked quotes in under two minutes.

The prototype takes a customer's quote request in plain English and returns:

- A **customer-facing quote** with line items, quantity options, and lead times
- An **internal cost breakdown** with margin analysis by component
- A **competitive analysis** benchmarked against 30+ real online print vendors
- A **win strategy battle card** with talking points and pricing recommendations

---

## The Problem It Solves

Print estimating is a bottleneck. A skilled estimator typically spends 20–45 minutes per quote — selecting the right production method, calculating material costs, factoring in finishing, checking competitive pricing, and formatting the output. Many shops lose deals simply because they can't turn quotes around fast enough, or because they price blind without market context.

AccuPrint Estimator compresses that entire workflow into a single AI-driven interaction. The estimator pastes or types a customer request, and the system handles the rest — from production method selection through competitive positioning.

---

## How It Works

### Input

The app accepts quote requests in two modes:

1. **Free-form text** — Paste a customer email, phone notes, or RFQ directly. The AI parses natural language into structured specs.
2. **Structured form** — Select product type, quantity, paper stock, finishing, and other parameters from dropdowns. Supports multi-item quotes.

The user optionally provides customer info (name, company, email) and selects urgency: Standard, Rush (1.5x), or Emergency (2x).

### AI Processing

When the user submits, the request is sent to **Claude Sonnet 4.5** (via OpenRouter) with three blocks of context:

| Context Block | Purpose | Size |
|---|---|---|
| **Agent instructions** | How to behave as a senior estimator — workflow steps, pricing guardrails, output format | ~8,000 chars |
| **Factory profile** | Complete plant capabilities: presses, finishing equipment, material costs, labor rates, quantity breaks, margin targets | ~12,000 chars |
| **Market pricing database** | Current pricing from 30+ US online print vendors across 6 product categories, compiled February 2026 | ~19,000 chars |

The model uses **extended thinking** (up to 8,000 reasoning tokens) to work through the problem step by step — selecting production methods, running cost calculations, cross-referencing market pricing — before generating a structured JSON response.

### Streaming Progress

While the AI works, the app streams real-time progress updates to the user via Server-Sent Events (SSE):

1. Parsing your request...
2. Analyzing job specifications...
3. Selecting production method...
4. Loading factory cost tables...
5. AI is reasoning through your request...
6. Cross-referencing market pricing...
7. Building competitive position...
8. Computing press time & labor...
9. Benchmarking competitive position...
10. Assembling your quote...

The progress bar advances based on actual token generation, not timers — so it reflects real processing state.

### Output

The AI returns a single structured JSON response that populates a four-tab results dashboard:

**Tab 1: Customer Quote**
Professional formatted quote with company branding, customer details, line items with full specs (size, stock, colors, finishing), multiple quantity options per item, lead times, and terms. All prices are inline-editable — the estimator can adjust any number and totals recalculate automatically.

**Tab 2: Internal Cost Breakdown**
Component-level costs for each line item: materials, prepress, press time, plates, finishing, and shipping. Margin dollars and percentages are calculated and color-coded — green for on-target, yellow for below-target, red for below-minimum. All costs are editable with automatic margin recalculation.

**Tab 3: Competitive Analysis**
Each line item benchmarked against market low, average, and high pricing. Position classified as Below Market, At Market, Above Market, or Well Above Market. Top 3 competitor vendors identified per product with threat assessments. An overall scorecard shows total quote value vs. market average and risk level.

**Tab 4: Win Strategy**
A sales battle card with numbered talking points for customer conversations, specific price adjustment recommendations (with dollar amounts and reasoning), and package discount suggestions for multi-item quotes.

---

## Skills and Technology Leveraged

### Claude Code Agent Architecture

The prototype was built using **Claude Code**, Anthropic's CLI-based coding agent. The entire application — from initial scaffolding through production deployment — was developed through conversational interaction with the agent. This includes:

- **Full-stack code generation** — React components, API routes, TypeScript types, CSS styling, and streaming infrastructure were all authored by the agent
- **Custom agent definitions** — Two specialized AI agents (Print Estimator and Competitive Pricer) were designed with detailed prompt engineering, encoded as markdown files that the system loads at runtime
- **Knowledge base integration** — The factory profile and market pricing database were structured as markdown documents that get injected into the AI's system context, giving it domain expertise without fine-tuning
- **Iterative refinement** — The prototype was built incrementally during the live demo, with features added, tested, and adjusted through natural conversation

### Prompt Engineering as Domain Encoding

The core innovation is treating prompt engineering as a way to encode an entire professional discipline:

- **Factory profile** (`factory-profile.md`) — A 257-line document capturing everything a senior estimator knows about their plant: press capabilities, click charges, paper costs, finishing rates, waste factors, quantity break structures, and margin targets by job type.
- **Market pricing database** (`market-pricing-database.md`) — A 360+ line document with real competitive pricing from 30+ vendors across 6 product categories, compiled from actual market research. Includes vendor-specific pricing tiers, shipping thresholds, and positioning guidelines.
- **Estimator agent** (`print-estimator.md`) — A 240-line agent definition that encodes the workflow, decision logic, and guardrails of a senior estimator: how to select offset vs. digital, when to suggest alternative stocks, how to calculate imposition, and when to flag margin concerns.
- **Competitive pricer agent** (`competitive-pricer.md`) — A 140-line agent definition focused on market positioning: how to benchmark against competitors, when to recommend price adjustments, and how to build a win strategy.

None of this required model fine-tuning or training data. The domain knowledge is encoded in structured natural language and loaded at inference time.

### Extended Thinking for Complex Reasoning

The system uses Claude's **extended thinking** capability (up to 8,000 reasoning tokens) to work through multi-step estimation logic. For a typical quote, the model:

1. Parses ambiguous customer language into precise print specs
2. Decides between offset and digital production based on quantity crossover points
3. Selects specific presses from the equipment list based on sheet size and color requirements
4. Calculates material costs including waste factors and makeready
5. Applies finishing costs from the rate card
6. Checks every line item against the market pricing database
7. Adjusts pricing to hit the target zone (5–15% above market average)
8. Generates talking points based on where the quote sits competitively

This reasoning chain is captured and made available to the estimator through a "View AI Reasoning" drawer — providing full transparency into how the AI arrived at its numbers.

### Streaming Architecture

The app uses a custom SSE (Server-Sent Events) streaming pipeline to provide real-time feedback during generation:

- The Next.js API route opens a streaming connection to OpenRouter
- Reasoning tokens and content tokens are streamed separately
- Progress events are pushed to the frontend as the model works
- The frontend displays an animated progress bar tied to actual generation state
- On completion, the full response is parsed and the user is navigated to the results dashboard

This ensures the user never stares at a blank screen — they see the AI working through their request in real time.

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| AI Model | Claude Sonnet 4.5 via OpenRouter |
| Streaming | Server-Sent Events (SSE) |
| Fonts | Geist Sans & Geist Mono |
| Icons | Lucide React |
| Deployment | Vercel (Pro) |
| Development | Claude Code (Anthropic CLI agent) |

---

## What the Prototype Demonstrates

1. **AI can handle complex, multi-step professional workflows** — Print estimating requires production knowledge, cost accounting, and market awareness simultaneously. The system handles all three in a single pass.

2. **Domain knowledge can be encoded without fine-tuning** — By structuring plant capabilities and market data as context documents, the system gains expert-level knowledge at inference time. Updating pricing or adding equipment is as simple as editing a markdown file.

3. **Extended thinking improves accuracy on analytical tasks** — The reasoning capability lets the model show its work, making outputs auditable and building trust with professional users.

4. **Streaming UX keeps users engaged during long operations** — With generation times of 60–120 seconds, real-time progress feedback is essential. The SSE pipeline provides it without polling or WebSocket complexity.

5. **Competitive intelligence can be automated** — Manually checking competitor pricing is tedious and often skipped. By baking market data into every quote, the system ensures no estimate goes out without competitive context.

6. **The estimator stays in control** — Every number in the output is editable. The AI generates the first draft; the human refines it. This is augmentation, not replacement.

---

## Current Status and Next Steps

### Implemented

- Free-form and structured quote input
- Real-time AI estimation with streaming progress
- Competitive benchmarking against 30+ vendors
- Four-tab results dashboard (quote, costs, competitive, strategy)
- Inline price editing with automatic recalculation
- AI reasoning transparency
- Simulation mode for demos without API key
- Mobile-responsive design
- Production deployment on Vercel

### Planned

- **PDF export** — Download branded quotes for customer delivery
- **Email integration** — Send quotes directly from the app
- **Quote history** — Store and retrieve past quotes with versioning
- **CRM integration** — Pull customer context into the estimating workflow
- **Automated market refresh** — Scheduled updates to the pricing database
- **Job ticket generation** — Convert won quotes into production job tickets
- **ERP integration** — Connect to Pace, PrintSmith, or EFI Monarch

---

## About the Build

This prototype was developed entirely through conversation with Claude Code during a live demonstration at EPS Connect 2026. The full application — frontend components, API routes, streaming infrastructure, agent definitions, knowledge bases, and deployment configuration — was built iteratively through the agent, demonstrating how AI-assisted development can rapidly prototype production-grade tools for specialized industries.

---

*AccuPrint Estimator — Built at EPS Connect 2026*
