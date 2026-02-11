"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Shield,
  Target,
  AlertTriangle,
  TrendingDown,
  ArrowDownToLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompetitiveAnalysis, CompetitiveLineItem } from "@/lib/types";

interface CompetitiveTabProps {
  analysis: CompetitiveAnalysis;
  onAdjustToMarket?: () => void;
}

function positionColor(position: string): string {
  switch (position) {
    case "BELOW_MARKET":
      return "text-press-cyan";
    case "AT_MARKET":
      return "text-margin-green";
    case "ABOVE_MARKET":
      return "text-margin-yellow";
    case "WELL_ABOVE_MARKET":
      return "text-margin-red";
    default:
      return "text-foreground";
  }
}

function positionBg(position: string): string {
  switch (position) {
    case "BELOW_MARKET":
      return "bg-press-cyan/10 border-press-cyan/30";
    case "AT_MARKET":
      return "bg-margin-green/10 border-margin-green/30";
    case "ABOVE_MARKET":
      return "bg-margin-yellow/10 border-margin-yellow/30";
    case "WELL_ABOVE_MARKET":
      return "bg-margin-red/10 border-margin-red/30";
    default:
      return "bg-secondary";
  }
}

function positionLabel(position: string): string {
  switch (position) {
    case "BELOW_MARKET":
      return "BELOW";
    case "AT_MARKET":
      return "AT MARKET";
    case "ABOVE_MARKET":
      return "ABOVE";
    case "WELL_ABOVE_MARKET":
      return "WELL ABOVE";
    default:
      return position;
  }
}

function recommendationBadge(rec: string) {
  switch (rec) {
    case "HOLD":
      return (
        <Badge
          variant="outline"
          className="border-margin-green/30 bg-margin-green/10 text-margin-green font-bold text-[10px]"
        >
          <Shield className="mr-1 h-3 w-3" />
          HOLD
        </Badge>
      );
    case "ADJUST_DOWN":
      return (
        <Badge
          variant="outline"
          className="border-margin-yellow/30 bg-margin-yellow/10 text-margin-yellow font-bold text-[10px]"
        >
          <TrendingDown className="mr-1 h-3 w-3" />
          ADJUST DOWN
        </Badge>
      );
    case "ADJUST_UP":
      return (
        <Badge
          variant="outline"
          className="border-press-cyan/30 bg-press-cyan/10 text-press-cyan font-bold text-[10px]"
        >
          <Target className="mr-1 h-3 w-3" />
          ADJUST UP
        </Badge>
      );
    default:
      return <Badge variant="secondary">{rec}</Badge>;
  }
}

function riskBadge(risk: string) {
  const colors: Record<string, string> = {
    LOW: "border-margin-green/30 bg-margin-green/10 text-margin-green",
    LOW_MEDIUM: "border-margin-green/30 bg-margin-green/10 text-margin-green",
    MEDIUM: "border-margin-yellow/30 bg-margin-yellow/10 text-margin-yellow",
    HIGH: "border-margin-red/30 bg-margin-red/10 text-margin-red",
  };
  return (
    <Badge
      variant="outline"
      className={cn("font-bold text-xs", colors[risk] || "bg-secondary")}
    >
      {risk.replaceAll("_", " ")} RISK
    </Badge>
  );
}

export function CompetitiveTab({
  analysis,
  onAdjustToMarket,
}: CompetitiveTabProps) {
  const { scorecard } = analysis;
  const hasAboveMarket = analysis.line_items.some(
    (i) => i.position === "WELL_ABOVE_MARKET"
  );

  return (
    <div className="space-y-6 animate-press-stamp">
      {/* Scorecard */}
      <Card className="overflow-hidden retro-shadow">
        <div className="bg-gradient-to-r from-primary/5 to-press-cyan/5 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              Competitive Position Scorecard
            </h3>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Quote Value
              </p>
              <p className="font-mono text-xl font-bold">
                $
                {scorecard.total_quote_value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Market Average
              </p>
              <p className="font-mono text-xl font-bold text-muted-foreground">
                $
                {scorecard.market_value_avg.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Position vs Market
              </p>
              <p
                className={cn(
                  "font-mono text-xl font-bold",
                  scorecard.overall_position_pct > 30
                    ? "text-margin-red"
                    : scorecard.overall_position_pct > 15
                      ? "text-margin-yellow"
                      : "text-margin-green"
                )}
              >
                {scorecard.overall_position_pct > 0 ? "+" : ""}
                {scorecard.overall_position_pct.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Risk Level
              </p>
              <div className="mt-1">{riskBadge(scorecard.risk_level)}</div>
            </div>
          </div>

          {/* Item position summary */}
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">
              <span className="font-bold text-margin-green">
                {scorecard.items_at_below_market}
              </span>{" "}
              items at/below market
            </span>
            <span className="text-muted-foreground">
              <span className="font-bold text-margin-yellow">
                {scorecard.items_above_market}
              </span>{" "}
              items above market
            </span>
            <span className="text-muted-foreground">
              <span className="font-bold">{scorecard.total_items}</span> total
              items
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Adjust to market button */}
      {hasAboveMarket && onAdjustToMarket && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onAdjustToMarket}
            className="border-margin-yellow/30 text-margin-yellow hover:bg-margin-yellow/10"
          >
            <ArrowDownToLine className="mr-2 h-4 w-4" />
            Adjust to Market
          </Button>
        </div>
      )}

      {/* Per-item analysis */}
      <Card className="overflow-hidden retro-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                    Item
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Our Price
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Mkt Low
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Mkt Avg
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Mkt High
                  </TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">
                    Position
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Variance
                  </TableHead>
                  <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.line_items.map((item, idx) => (
                  <CompetitorRow key={idx} item={item} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Position legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-press-cyan" />
          Below Market
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-margin-green" />
          At Market
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-margin-yellow" />
          Above Market
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-margin-red" />
          Well Above
        </div>
      </div>
    </div>
  );
}

function CompetitorRow({ item }: { item: CompetitiveLineItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow className="hover:bg-secondary/20 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <TableCell className="font-medium text-sm">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {item.product}
          </div>
        </TableCell>
        <TableCell className="text-right font-mono font-semibold text-sm">
          ${item.our_price_unit.toFixed(2)}
        </TableCell>
        <TableCell className="text-right font-mono text-sm text-muted-foreground">
          ${item.market_low.toFixed(2)}
        </TableCell>
        <TableCell className="text-right font-mono text-sm">
          ${item.market_avg.toFixed(2)}
        </TableCell>
        <TableCell className="text-right font-mono text-sm text-muted-foreground">
          ${item.market_high.toFixed(2)}
        </TableCell>
        <TableCell className="text-center">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold",
              positionBg(item.position),
              positionColor(item.position)
            )}
          >
            {positionLabel(item.position)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              positionColor(item.position)
            )}
          >
            {item.variance_pct > 0 ? "+" : ""}
            {item.variance_pct.toFixed(1)}%
          </span>
        </TableCell>
        <TableCell className="text-center">
          {recommendationBadge(item.recommendation)}
        </TableCell>
      </TableRow>

      {/* Expanded competitor details */}
      {expanded && (
        <TableRow className="bg-secondary/10">
          <TableCell colSpan={8} className="p-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Competitor Watchlist
              </h4>
              <div className="grid gap-2 sm:grid-cols-3">
                {item.competitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{comp.name}</span>
                      <span className="font-mono text-sm font-semibold text-press-red">
                        ${comp.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {comp.threat}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price position bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Low: ${item.market_low.toFixed(2)}</span>
                  <span>Avg: ${item.market_avg.toFixed(2)}</span>
                  <span>High: ${item.market_high.toFixed(2)}</span>
                </div>
                <div className="relative h-3 rounded-full bg-gradient-to-r from-press-cyan/20 via-margin-green/20 to-margin-red/20">
                  {/* Our position marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-primary bg-card shadow-md flex items-center justify-center"
                    style={{
                      left: `${Math.min(100, Math.max(0, ((item.our_price_unit - item.market_low) / (item.market_high - item.market_low)) * 100))}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
