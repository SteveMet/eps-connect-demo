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

    const useSimulation = !process.env.ANTHROPIC_API_KEY;

    if (useSimulation) {
      return handleSimulatedRequest(quoteRequest, urgency, customerInfo);
    }

    // Live mode with Claude API
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

async function handleLiveRequest(
  quoteRequest: string,
  urgency: string,
  customerInfo?: { name?: string; company?: string; email?: string }
) {
  // Dynamic import to avoid errors when SDK isn't configured
  const { streamQuoteGeneration } = await import("@/lib/claude");
  const { parseQuoteResponse } = await import("@/lib/parse-quote-response");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = "";
        let charCount = 0;

        for await (const event of streamQuoteGeneration(
          quoteRequest,
          urgency,
          customerInfo
        )) {
          if (event.type === "text") {
            charCount += event.content.length;
            // Send progress updates based on content length heuristics
            let step = 1;
            if (charCount > 500) step = 2;
            if (charCount > 2000) step = 3;
            if (charCount > 4000) step = 4;
            if (charCount > 6000) step = 5;

            const sseData = JSON.stringify({
              type: "progress",
              step,
              totalSteps: 5,
              message: [
                "Parsing your request...",
                "Selecting production method...",
                "Calculating costs...",
                "Checking market prices...",
                "Generating your quote...",
              ][step - 1],
            });
            controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
          } else if (event.type === "done") {
            fullResponse = event.content;
          }
        }

        try {
          const parsed = parseQuoteResponse(fullResponse);
          const sseData = JSON.stringify({
            type: "complete",
            data: parsed,
          });
          controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        } catch (parseError) {
          const sseData = JSON.stringify({
            type: "complete",
            data: null,
            raw: fullResponse,
            error:
              parseError instanceof Error
                ? parseError.message
                : "Failed to parse response",
          });
          controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
        }

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
