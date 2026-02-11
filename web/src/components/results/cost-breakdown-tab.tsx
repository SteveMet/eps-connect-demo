"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus, DollarSign } from "lucide-react";
import { EditableCell } from "./editable-cell";
import { cn } from "@/lib/utils";
import type { InternalCosts, CostLineItem } from "@/lib/types";

interface CostBreakdownTabProps {
  costs: InternalCosts;
  onUpdate: (costs: InternalCosts) => void;
}

function marginColor(status: string): string {
  switch (status) {
    case "on_target":
      return "text-margin-green";
    case "below_target":
      return "text-margin-yellow";
    case "below_minimum":
      return "text-margin-red";
    default:
      return "text-foreground";
  }
}

function marginBg(status: string): string {
  switch (status) {
    case "on_target":
      return "bg-margin-green/10";
    case "below_target":
      return "bg-margin-yellow/10";
    case "below_minimum":
      return "bg-margin-red/10";
    default:
      return "";
  }
}

function marginIcon(status: string) {
  switch (status) {
    case "on_target":
      return <TrendingUp className="h-3.5 w-3.5 text-margin-green" />;
    case "below_target":
      return <Minus className="h-3.5 w-3.5 text-margin-yellow" />;
    case "below_minimum":
      return <TrendingDown className="h-3.5 w-3.5 text-margin-red" />;
    default:
      return null;
  }
}

export function CostBreakdownTab({ costs, onUpdate }: CostBreakdownTabProps) {
  const updateCostItem = (
    idx: number,
    field: keyof CostLineItem | string,
    value: number | string
  ) => {
    const updated = { ...costs };
    const items = [...updated.line_items];
    const item = { ...items[idx] };

    if (field.startsWith("cost_breakdown.")) {
      const subField = field.split(".")[1] as keyof typeof item.cost_breakdown;
      item.cost_breakdown = { ...item.cost_breakdown, [subField]: value };
      // Recalculate total cost
      item.total_cost = Object.values(item.cost_breakdown).reduce(
        (sum, v) => sum + v,
        0
      );
    } else if (field === "sell_price" && typeof value === "number") {
      item.sell_price = value;
    }

    // Recalculate margins
    item.margin_dollars = +(item.sell_price - item.total_cost).toFixed(2);
    item.margin_pct = +(
      ((item.sell_price - item.total_cost) / item.sell_price) *
      100
    ).toFixed(1);

    // Update margin status
    if (item.margin_pct >= item.target_margin_pct) {
      item.margin_status = "on_target";
    } else if (item.margin_pct >= item.target_margin_pct - 10) {
      item.margin_status = "below_target";
    } else {
      item.margin_status = "below_minimum";
    }

    items[idx] = item;
    updated.line_items = items;

    // Recalculate totals
    updated.total_cost = items.reduce((sum, i) => sum + i.total_cost, 0);
    updated.total_revenue = items.reduce((sum, i) => sum + i.sell_price, 0);
    updated.total_margin = +(
      updated.total_revenue - updated.total_cost
    ).toFixed(2);
    updated.blended_margin_pct = +(
      ((updated.total_revenue - updated.total_cost) / updated.total_revenue) *
      100
    ).toFixed(1);

    onUpdate(updated);
  };

  return (
    <div className="space-y-6 animate-press-stamp">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard
          label="Total Cost"
          value={`$${costs.total_cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4" />}
          color="text-foreground"
        />
        <SummaryCard
          label="Total Revenue"
          value={`$${costs.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-primary"
        />
        <SummaryCard
          label="Total Margin"
          value={`$${costs.total_margin.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4" />}
          color="text-margin-green"
        />
        <SummaryCard
          label="Blended Margin"
          value={`${costs.blended_margin_pct.toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          color={
            costs.blended_margin_pct >= 35
              ? "text-margin-green"
              : costs.blended_margin_pct >= 25
                ? "text-margin-yellow"
                : "text-margin-red"
          }
        />
      </div>

      {/* Cost breakdown table */}
      <Card className="overflow-hidden retro-shadow">
        <div className="bg-primary/5 px-5 py-3 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Internal Cost Breakdown
          </h3>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Click any value to edit — margins recalculate automatically
          </p>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider">
                    Item
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Materials
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Prepress
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Press
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Plates
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Finishing
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Ship
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider border-l border-border">
                    Total Cost
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Sell Price
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Margin $
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                    Margin %
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.line_items.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-secondary/20">
                    <TableCell className="font-medium text-sm max-w-[180px] truncate">
                      {item.product}
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.cost_breakdown.materials}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "cost_breakdown.materials", v)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.cost_breakdown.prepress}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "cost_breakdown.prepress", v)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.cost_breakdown.press}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "cost_breakdown.press", v)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.cost_breakdown.plates}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "cost_breakdown.plates", v)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.cost_breakdown.finishing}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "cost_breakdown.finishing", v)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.cost_breakdown.shipping}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "cost_breakdown.shipping", v)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right border-l border-border font-semibold">
                      <EditableCell
                        value={item.total_cost}
                        type="currency"
                        readOnly
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.sell_price}
                        type="currency"
                        onChange={(v) =>
                          updateCostItem(idx, "sell_price", v)
                        }
                        className="font-semibold"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold",
                          marginColor(item.margin_status)
                        )}
                      >
                        ${item.margin_dollars.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                          marginBg(item.margin_status)
                        )}
                      >
                        {marginIcon(item.margin_status)}
                        <span
                          className={cn(
                            "font-mono text-sm font-bold",
                            marginColor(item.margin_status)
                          )}
                        >
                          {item.margin_pct.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Margin legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-margin-green" />
          On Target
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-margin-yellow" />
          Below Target
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-margin-red" />
          Below Minimum
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="retro-shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("opacity-60", color)}>{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className={cn("font-mono text-xl font-bold", color)}>{value}</p>
      </CardContent>
    </Card>
  );
}
