import { NextRequest } from "next/server";
import { generateMockQuoteResponse } from "@/lib/mock-data";

export const maxDuration = 120;

const SIMULATION_STEPS = [
  { delay: 800, message: "Parsing your request..." },
  { delay: 2000, message: "Analyzing job specifications..." },
  { delay: 2500, message: "Selecting production method..." },
  { delay: 3000, message: "Calculating material costs..." },
  { delay: 2000, message: "Computing press time & labor..." },
  { delay: 2500, message: "Adding finishing operations..." },
  { delay: 2000, message: "Checking against 30+ market vendors..." },
  { delay: 1500, message: "Benchmarking competitive position..." },
  { delay: 1000, message: "Generating win strategy..." },
  { delay: 800, message: "Assembling your quote..." },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request: quoteRequest, customerInfo, urgency = "standard" } = body;

    if (!quoteRequest || typeof quoteRequest !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'request' field" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const useSimulation = !process.env.OPENROUTER_API_KEY;

    if (useSimulation) {
      return handleSimulatedRequest(quoteRequest, urgency, customerInfo);
    }

    // Live mode with OpenRouter API
    return handleLiveRequest(quoteRequest, urgency, customerInfo);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function handleSimulatedRequest(
  quoteRequest: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Simulate progressive processing steps
        for (let i = 0; i < SIMULATION_STEPS.length; i++) {
          const step = SIMULATION_STEPS[i];
          await new Promise((resolve) => setTimeout(resolve, step.delay));

          const sseData = JSON.stringify({
            type: "progress",
            step: i + 1,
            totalSteps: SIMULATION_STEPS.length,
            message: step.message,
          });
          controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        }

        // Generate mock response
        const mockResponse = generateMockQuoteResponse(
          quoteRequest,
          urgency,
          customerInfo
        );

        await new Promise((resolve) => setTimeout(resolve, 500));

        const sseData = JSON.stringify({
          type: "complete",
          data: mockResponse,
        });
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        controller.close();
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        const sseData = JSON.stringify({ type: "error", error: errorMsg });
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Timed steps sent while waiting for the first token from the AI model.
// These keep the progress bar moving during the TTFT delay (~20-30s).
const PREFLIGHT_STEPS = [
  { delay: 0,     step: 1,  message: "Parsing your request..." },
  { delay: 2000,  step: 2,  message: "Analyzing job specifications..." },
  { delay: 5000,  step: 3,  message: "Selecting production method..." },
  { delay: 9000,  step: 4,  message: "Loading factory cost tables..." },
  { delay: 14000, step: 5,  message: "Connecting to AI estimator..." },
  { delay: 20000, step: 6,  message: "Calculating material costs..." },
  { delay: 26000, step: 7,  message: "Running competitive analysis..." },
];

async function handleLiveRequest(
  quoteRequest: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
) {
  // Dynamic import to avoid errors when API key isn't configured
  const { streamQuoteGeneration } = await import("@/lib/openrouter");
  const { parseQuoteResponse } = await import("@/lib/parse-quote-response");

  const encoder = new TextEncoder();
  const totalSteps = 10;

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (step: number, message: string) => {
        const sseData = JSON.stringify({
          type: "progress",
          step,
          totalSteps,
          message,
        });
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
      };

      // Start timed preflight steps immediately
      let currentPreflightStep = 0;
      const preflightTimers: ReturnType<typeof setTimeout>[] = [];

      for (const pf of PREFLIGHT_STEPS) {
        const timer = setTimeout(() => {
          currentPreflightStep = pf.step;
          sendProgress(pf.step, pf.message);
        }, pf.delay);
        preflightTimers.push(timer);
      }

      try {
        let fullResponse = "";
        let fullReasoning = "";
        let modelUsed = "";
        let charCount = 0;
        let reasoningCharCount = 0;
        let firstContentToken = true;
        let reasoningStarted = false;

        for await (const event of streamQuoteGeneration(
          quoteRequest,
          urgency,
          customerInfo
        )) {
          if (event.type === "reasoning") {
            // Reasoning tokens stream first — model is "thinking"
            if (!reasoningStarted) {
              reasoningStarted = true;
              // Cancel preflight timers — real reasoning has started
              for (const t of preflightTimers) clearTimeout(t);
              sendProgress(3, "AI is reasoning through your request...");
            }

            reasoningCharCount += event.content.length;

            // Advance progress through steps 3-6 based on reasoning length
            let step = 3;
            if (reasoningCharCount > 500) step = 4;
            if (reasoningCharCount > 2000) step = 5;
            if (reasoningCharCount > 5000) step = 6;
            if (reasoningCharCount > 8000) step = 7;

            const messages: Record<number, string> = {
              3: "AI is reasoning through your request...",
              4: "Analyzing production methods & costs...",
              5: "Evaluating material options...",
              6: "Cross-referencing market pricing...",
              7: "Building competitive position...",
            };
            sendProgress(step, messages[step]);
          } else if (event.type === "text") {
            // Content tokens follow reasoning
            if (firstContentToken) {
              firstContentToken = false;
              // If we didn't get reasoning events, cancel preflight timers now
              if (!reasoningStarted) {
                for (const t of preflightTimers) clearTimeout(t);
              }
              if (currentPreflightStep < 7) {
                sendProgress(7, "Running competitive analysis...");
              }
            }

            charCount += event.content.length;

            // Content-based progress for the final steps (8-10)
            let step = 8;
            if (charCount > 1500) step = 9;
            if (charCount > 3000) step = 10;

            sendProgress(
              step,
              [
                "Computing press time & labor...",
                "Benchmarking competitive position...",
                "Assembling your quote...",
              ][step - 8]
            );
          } else if (event.type === "done") {
            fullResponse = event.content;
            fullReasoning = event.reasoning;
            modelUsed = event.model;
          }
        }

        try {
          const parsed = parseQuoteResponse(fullResponse);
          const sseData = JSON.stringify({
            type: "complete",
            data: parsed,
            ...(fullReasoning ? { reasoning: fullReasoning } : {}),
            ...(modelUsed ? { model: modelUsed } : {}),
          });
          controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        } catch (parseError) {
          const sseData = JSON.stringify({
            type: "complete",
            data: null,
            raw: fullResponse,
            ...(fullReasoning ? { reasoning: fullReasoning } : {}),
            error:
              parseError instanceof Error
                ? parseError.message
                : "Failed to parse response",
          });
          controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        }

        controller.close();
      } catch (err) {
        // Clean up timers on error
        for (const t of preflightTimers) clearTimeout(t);
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error";
        const sseData = JSON.stringify({ type: "error", error: errorMsg });
        controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
