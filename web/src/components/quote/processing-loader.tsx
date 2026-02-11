"use client";

import { useEffect, useState } from "react";
import {
  FileSearch,
  Cog,
  Calculator,
  BarChart3,
  FileText,
  Check,
  Loader2,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingLoaderProps {
  currentStep: number;
  totalSteps: number;
  message: string;
}

const STEPS = [
  { icon: FileSearch, label: "Parsing request", phase: "read" },
  { icon: FileSearch, label: "Analyzing specs", phase: "read" },
  { icon: Cog, label: "Selecting method", phase: "plan" },
  { icon: Calculator, label: "Calculating costs", phase: "calculate" },
  { icon: Calculator, label: "Computing labor", phase: "calculate" },
  { icon: Calculator, label: "Adding finishing", phase: "calculate" },
  { icon: BarChart3, label: "Market check", phase: "market" },
  { icon: BarChart3, label: "Benchmarking", phase: "market" },
  { icon: FileText, label: "Win strategy", phase: "strategy" },
  { icon: Printer, label: "Assembling quote", phase: "assemble" },
];

const TIPS = [
  "AccuPrint benchmarks against 30+ vendors on every quote",
  "Our AI estimator analyzes equipment, materials, and labor costs",
  "Market positioning helps you win deals at profitable margins",
  "Every quote includes a competitive battle card for your sales team",
  "We check offset, digital, and wide-format to find the best method",
  "Volume pricing is automatically calculated at multiple quantity tiers",
];

export function ProcessingLoader({
  currentStep,
  totalSteps,
  message,
}: ProcessingLoaderProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(true);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTip(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % TIPS.length);
        setShowTip(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const progressPct = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  // Group steps into phases for the visual display
  const phases = [
    { label: "Parsing", steps: [0, 1], icon: FileSearch },
    { label: "Planning", steps: [2], icon: Cog },
    { label: "Costing", steps: [3, 4, 5], icon: Calculator },
    { label: "Market", steps: [6, 7], icon: BarChart3 },
    { label: "Finishing", steps: [8, 9], icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-lg animate-ink-spread">
      {/* Main card */}
      <div className="rounded-2xl border-2 border-border bg-card p-8 retro-shadow">
        {/* Printer animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Printer className="h-10 w-10 text-primary animate-pulse" />
            </div>
            {/* Spinning roller decoration */}
            <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-press-yellow">
              <Loader2 className="h-4 w-4 text-ink animate-roller" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Processing
            </span>
            <span className="text-xs font-mono font-bold text-primary">
              {progressPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-press-cyan via-primary to-press-yellow transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Phase stepper */}
        <div className="mb-6 space-y-1">
          {phases.map((phase, phaseIdx) => {
            const phaseMaxStep = Math.max(...phase.steps) + 1;
            const phaseMinStep = Math.min(...phase.steps) + 1;
            const isComplete = currentStep > phaseMaxStep;
            const isActive =
              currentStep >= phaseMinStep && currentStep <= phaseMaxStep;
            const Icon = phase.icon;

            return (
              <div
                key={phase.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300",
                  isActive && "bg-primary/5",
                  isComplete && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
                    isComplete
                      ? "bg-margin-green/20"
                      : isActive
                        ? "bg-primary/15"
                        : "bg-secondary"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5 text-margin-green" />
                  ) : isActive ? (
                    <Icon className="h-3.5 w-3.5 text-primary animate-pulse" />
                  ) : (
                    <Icon className="h-3.5 w-3.5 text-muted-foreground/30" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isComplete
                      ? "text-muted-foreground line-through"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                  )}
                >
                  {phase.label}
                </span>
                {isActive && (
                  <Loader2 className="ml-auto h-3.5 w-3.5 text-primary/50 animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        {/* Current step message */}
        <div className="rounded-lg bg-secondary/60 px-4 py-3 text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      </div>

      {/* Tip carousel */}
      <div className="mt-4 text-center">
        <p
          className={cn(
            "text-xs text-muted-foreground/60 transition-opacity duration-300",
            showTip ? "opacity-100" : "opacity-0"
          )}
        >
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}
