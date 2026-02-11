"use client";

import { Clock, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgencySelectorProps {
  value: "standard" | "rush" | "emergency";
  onChange: (value: "standard" | "rush" | "emergency") => void;
}

const options = [
  {
    value: "standard" as const,
    label: "Standard",
    description: "5-7 business days",
    icon: Clock,
    color: "text-margin-green",
    bgActive: "bg-margin-green/10 border-margin-green/40",
    pricing: "Base price",
  },
  {
    value: "rush" as const,
    label: "Rush",
    description: "2-3 business days",
    icon: Zap,
    color: "text-press-yellow",
    bgActive: "bg-press-yellow/10 border-press-yellow/40",
    pricing: "1.5x pricing",
  },
  {
    value: "emergency" as const,
    label: "Emergency",
    description: "Same day — 1 day",
    icon: AlertTriangle,
    color: "text-press-red",
    bgActive: "bg-press-red/10 border-press-red/40",
    pricing: "2x pricing",
  },
];

export function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Turnaround
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center transition-all",
                isActive
                  ? `${opt.bgActive} retro-shadow-sm`
                  : "border-border bg-card hover:border-border/80 hover:bg-secondary/50"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? opt.color : "text-muted-foreground/50"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {opt.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {opt.description}
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono font-semibold",
                  isActive ? opt.color : "text-muted-foreground/40"
                )}
              >
                {opt.pricing}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
