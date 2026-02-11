"use client";

import { Printer, Sparkles } from "lucide-react";

export function Header({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Registration mark decoration */}
        <div className="hidden sm:flex items-center gap-1 opacity-20">
          <div className="h-3 w-3 rounded-full border border-foreground/40" />
          <div className="h-px w-4 bg-foreground/40" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">
          {title || "AccuPrint Estimator"}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-press-yellow" />
          <span className="text-xs font-medium text-muted-foreground">
            AI-Powered Estimates
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
          <Printer className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            AccuPrint
          </span>
        </div>
      </div>
    </header>
  );
}
