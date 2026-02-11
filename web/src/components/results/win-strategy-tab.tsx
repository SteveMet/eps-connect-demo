"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MessageCircle,
  DollarSign,
  Gift,
  ArrowRight,
  Lightbulb,
  Swords,
} from "lucide-react";
import type { WinStrategy } from "@/lib/types";

interface WinStrategyTabProps {
  strategy: WinStrategy;
}

export function WinStrategyTab({ strategy }: WinStrategyTabProps) {
  return (
    <div className="space-y-6 animate-press-stamp">
      {/* Battle card header */}
      <Card className="overflow-hidden retro-shadow">
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">
                WIN STRATEGY — BATTLE CARD
              </h2>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
                Sales talking points & recommendations
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Talking points */}
      <Card className="retro-shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-margin-green" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Key Talking Points
            </h3>
            <Badge
              variant="outline"
              className="ml-auto border-margin-green/30 bg-margin-green/10 text-margin-green text-[10px] font-bold"
            >
              <Trophy className="mr-1 h-3 w-3" />
              WIN POINTS
            </Badge>
          </div>
          <div className="space-y-3">
            {strategy.talking_points.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg bg-secondary/40 px-4 py-3 transition-colors hover:bg-secondary/60"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price adjustments */}
      {strategy.price_adjustments.length > 0 && (
        <Card className="retro-shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-margin-yellow" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Recommended Price Adjustments
              </h3>
            </div>
            <div className="space-y-3">
              {strategy.price_adjustments.map((adj, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-lg border-2 border-margin-yellow/20 bg-margin-yellow/5 px-4 py-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold">{adj.item}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {adj.reason}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-muted-foreground line-through">
                      ${adj.from.toFixed(2)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-margin-yellow" />
                    <span className="font-bold text-margin-green">
                      ${adj.to.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package discount */}
      {strategy.package_discount_suggestion && (
        <Card className="retro-shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-press-cyan" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Package Discount
              </h3>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-press-cyan/5 border border-press-cyan/20 px-4 py-3">
              <Lightbulb className="h-5 w-5 shrink-0 text-press-cyan mt-0.5" />
              <p className="text-sm leading-relaxed">
                {strategy.package_discount_suggestion}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print-friendly footer */}
      <div className="flex items-center justify-center gap-4 py-4 text-xs text-muted-foreground/40">
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-press-cyan/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-press-red/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-press-yellow/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/10" />
        </div>
        <span className="uppercase tracking-[0.3em]">
          AccuPrint Internal — Confidential
        </span>
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-press-cyan/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-press-red/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-press-yellow/30" />
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  );
}
