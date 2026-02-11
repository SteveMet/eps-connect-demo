"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FreeFormInput } from "@/components/quote/free-form-input";
import { StructuredBuilder } from "@/components/quote/structured-builder";
import { CustomerInfoForm } from "@/components/quote/customer-info-form";
import { UrgencySelector } from "@/components/quote/urgency-selector";
import { ProcessingLoader } from "@/components/quote/processing-loader";
import { useQuoteGenerator } from "@/hooks/use-quote-generator";
import {
  MessageSquareText,
  ListChecks,
  Sparkles,
  Send,
  Printer,
  RotateCcw,
} from "lucide-react";
import type { CustomerInfo } from "@/lib/types";

export default function NewQuotePage() {
  const router = useRouter();
  const [freeFormText, setFreeFormText] = useState("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    company: "",
    email: "",
    phone: "",
  });
  const [urgency, setUrgency] = useState<"standard" | "rush" | "emergency">(
    "standard"
  );

  const {
    isProcessing,
    currentStep,
    stepMessage,
    progress,
    totalSteps,
    result,
    error,
    generateQuote,
    reset,
  } = useQuoteGenerator();

  const handleFreeFormSubmit = async () => {
    if (!freeFormText.trim()) return;
    await generateQuote(freeFormText, urgency, customerInfo);
  };

  const handleStructuredSubmit = async (text: string) => {
    await generateQuote(text, urgency, customerInfo);
  };

  // Navigate to results when we have data
  useEffect(() => {
    if (result && currentStep === "complete") {
      sessionStorage.setItem("quoteResult", JSON.stringify(result));
      router.push("/quote/results");
    }
  }, [result, currentStep, router]);

  // Processing state
  if (isProcessing) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
        <ProcessingLoader
          currentStep={progress}
          totalSteps={totalSteps}
          message={stepMessage || "Warming up the press..."}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
        <div className="mx-auto max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <Printer className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Press Jam!</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={reset} variant="outline" className="mt-4">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              New Estimate
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste a customer request or build one from scratch
            </p>
          </div>
        </div>
      </div>

      {/* Input mode tabs */}
      <Tabs defaultValue="freeform" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
          <TabsTrigger
            value="freeform"
            className="flex items-center gap-2 data-[state=active]:retro-shadow-sm"
          >
            <MessageSquareText className="h-4 w-4" />
            <span className="hidden sm:inline">Free-Form</span>
            <span className="sm:hidden">Paste</span>
          </TabsTrigger>
          <TabsTrigger
            value="structured"
            className="flex items-center gap-2 data-[state=active]:retro-shadow-sm"
          >
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">Structured Builder</span>
            <span className="sm:hidden">Builder</span>
          </TabsTrigger>
        </TabsList>

        {/* Free-form tab */}
        <TabsContent value="freeform" className="space-y-5">
          <FreeFormInput value={freeFormText} onChange={setFreeFormText} />

          <CustomerInfoForm value={customerInfo} onChange={setCustomerInfo} />

          <UrgencySelector value={urgency} onChange={setUrgency} />

          {/* Submit button */}
          <Button
            size="lg"
            onClick={handleFreeFormSubmit}
            disabled={!freeFormText.trim() || isProcessing}
            className="w-full bg-primary text-lg font-bold retro-shadow hover:retro-shadow-sm transition-all disabled:opacity-50 disabled:retro-shadow-sm"
          >
            <Send className="mr-2 h-5 w-5" />
            Generate Estimate
          </Button>

          {/* Demo hints */}
          <div className="rounded-xl bg-secondary/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Try these examples
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_PROMPTS.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => setFreeFormText(demo.text)}
                  className="text-left rounded-lg border border-border bg-card px-3 py-2.5 text-xs transition-all hover:border-primary/30 hover:bg-primary/5 retro-shadow-sm hover:retro-shadow"
                >
                  <span className="font-bold text-primary">
                    {demo.label}
                  </span>
                  <p className="mt-0.5 text-muted-foreground line-clamp-2">
                    {demo.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Structured tab */}
        <TabsContent value="structured" className="space-y-5">
          <CustomerInfoForm value={customerInfo} onChange={setCustomerInfo} />

          <UrgencySelector value={urgency} onChange={setUrgency} />

          <StructuredBuilder onSubmit={handleStructuredSubmit} isProcessing={isProcessing} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const DEMO_PROMPTS = [
  {
    label: "Simple Flyer",
    text: "500 full-color flyers, 8.5x11, double-sided, 100# gloss text, 5-day turnaround",
  },
  {
    label: "Tri-Fold Brochures",
    text: "Quote 1,000, 2,500, and 5,000 tri-fold brochures, 8.5x11 flat, 4/4, 100# gloss text, with aqueous coating",
  },
  {
    label: "Rush Banner Stands",
    text: "12 retractable banner stands, 33x80, 12 different designs, need them in 3 days",
  },
  {
    label: "Direct Mail Postcards",
    text: "25,000 postcards, 6x9, 4/4, 14pt C2S with UV coating, need full mailing services",
  },
];
