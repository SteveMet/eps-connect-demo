"use client";

import { useState, useCallback } from "react";
import type {
  QuoteResponse,
  ProcessingStep,
  CustomerInfo,
} from "@/lib/types";

interface UseQuoteGeneratorReturn {
  isProcessing: boolean;
  currentStep: ProcessingStep;
  stepMessage: string;
  progress: number;
  totalSteps: number;
  result: QuoteResponse | null;
  reasoning: string | null;
  error: string | null;
  generateQuote: (
    request: string,
    urgency: string,
    customerInfo?: CustomerInfo
  ) => Promise<void>;
  reset: () => void;
}

const STEP_MAP: Record<number, ProcessingStep> = {
  1: "parsing",
  2: "parsing",
  3: "selecting",
  4: "calculating",
  5: "calculating",
  6: "calculating",
  7: "checking",
  8: "checking",
  9: "generating",
  10: "generating",
};

export function useQuoteGenerator(): UseQuoteGeneratorReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("parsing");
  const [stepMessage, setStepMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(10);
  const [result, setResult] = useState<QuoteResponse | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setCurrentStep("parsing");
    setStepMessage("");
    setProgress(0);
    setResult(null);
    setReasoning(null);
    setError(null);
  }, []);

  const generateQuote = useCallback(
    async (
      request: string,
      urgency: string,
      customerInfo?: CustomerInfo
    ) => {
      setIsProcessing(true);
      setCurrentStep("parsing");
      setStepMessage("Warming up the press...");
      setProgress(0);
      setResult(null);
      setReasoning(null);
      setError(null);

      try {
        const response = await fetch("/api/quote/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request, urgency, customerInfo }),
        });

        if (!response.ok) {
          let errorMessage = `Server error: ${response.status}`;
          try {
            const errData = await response.json();
            errorMessage = errData.error || errorMessage;
          } catch {
            // Response body wasn't JSON — use the status code message
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "progress") {
                setProgress(event.step);
                setTotalSteps(event.totalSteps);
                setStepMessage(event.message);
                setCurrentStep(
                  STEP_MAP[event.step] || "parsing"
                );
              } else if (event.type === "complete") {
                if (event.data) {
                  // Store to sessionStorage immediately before any
                  // state updates or navigation can occur
                  sessionStorage.setItem("quoteResult", JSON.stringify(event.data));
                  if (event.reasoning) {
                    sessionStorage.setItem("quoteReasoning", event.reasoning);
                  }
                  if (event.model) {
                    sessionStorage.setItem("quoteModel", event.model);
                  }
                  setResult(event.data);
                  if (event.reasoning) {
                    setReasoning(event.reasoning);
                  }
                  setCurrentStep("complete");
                  setProgress((event.totalSteps || 10) + 1);
                } else if (event.error) {
                  throw new Error(event.error);
                }
              } else if (event.type === "error") {
                throw new Error(event.error);
              }
            } catch (parseErr) {
              if (
                parseErr instanceof Error &&
                parseErr.message !== "Unexpected end of JSON input"
              ) {
                throw parseErr;
              }
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setCurrentStep("error");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    isProcessing,
    currentStep,
    stepMessage,
    progress,
    totalSteps,
    result,
    reasoning,
    error,
    generateQuote,
    reset,
  };
}
