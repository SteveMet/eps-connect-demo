"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerQuoteTab } from "@/components/results/customer-quote-tab";
import { CostBreakdownTab } from "@/components/results/cost-breakdown-tab";
import { CompetitiveTab } from "@/components/results/competitive-tab";
import { WinStrategyTab } from "@/components/results/win-strategy-tab";
import {
  FileText,
  Calculator,
  BarChart3,
  Trophy,
  ArrowLeft,
  FilePlus2,
  Download,
  Mail,
} from "lucide-react";
import type { QuoteResponse } from "@/lib/types";

export default function QuoteResultsPage() {
  const router = useRouter();
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("quoteResult");
    if (stored) {
      try {
        setQuoteData(JSON.parse(stored));
      } catch {
        router.push("/quote/new");
      }
    } else {
      router.push("/quote/new");
    }
  }, [router]);

  if (!quoteData) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading results...
        </div>
      </div>
    );
  }

  const { customer_quote, internal_costs, competitive_analysis, win_strategy } =
    quoteData;

  return (
    <div className="px-6 py-6">
      {/* Results header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/quote/new")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                Quote Results
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold"
              >
                {customer_quote.quote_number}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer_quote.customer.name &&
                `${customer_quote.customer.name}`}
              {customer_quote.customer.company &&
                ` — ${customer_quote.customer.company}`}
              {!customer_quote.customer.name && "Customer Quote"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            PDF
            <Badge variant="secondary" className="ml-1.5 text-[9px]">
              Soon
            </Badge>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled
          >
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email
            <Badge variant="secondary" className="ml-1.5 text-[9px]">
              Soon
            </Badge>
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => router.push("/quote/new")}
          >
            <FilePlus2 className="mr-1.5 h-3.5 w-3.5" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickStat
          label="Total Value"
          value={`$${customer_quote.total.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          color="text-primary"
        />
        <QuickStat
          label="Line Items"
          value={String(customer_quote.line_items.length)}
          color="text-foreground"
        />
        <QuickStat
          label="Margin"
          value={`${internal_costs.blended_margin_pct.toFixed(1)}%`}
          color={
            internal_costs.blended_margin_pct >= 35
              ? "text-margin-green"
              : internal_costs.blended_margin_pct >= 25
                ? "text-margin-yellow"
                : "text-margin-red"
          }
        />
        <QuickStat
          label="Market Position"
          value={`${competitive_analysis.scorecard.overall_position_pct > 0 ? "+" : ""}${competitive_analysis.scorecard.overall_position_pct.toFixed(1)}%`}
          color={
            Math.abs(competitive_analysis.scorecard.overall_position_pct) <= 15
              ? "text-margin-green"
              : "text-margin-yellow"
          }
        />
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="quote" className="space-y-4">
        <TabsList className="flex w-full bg-secondary/50 p-1">
          <TabsTrigger
            value="quote"
            className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:retro-shadow-sm"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Customer Quote</span>
            <span className="sm:hidden">Quote</span>
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:retro-shadow-sm"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Internal Costs</span>
            <span className="sm:hidden">Costs</span>
          </TabsTrigger>
          <TabsTrigger
            value="competitive"
            className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:retro-shadow-sm"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Competitive</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:retro-shadow-sm"
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Win Strategy</span>
            <span className="sm:hidden">Strategy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quote">
          <CustomerQuoteTab
            quote={customer_quote}
            onUpdate={(updated) =>
              setQuoteData({ ...quoteData, customer_quote: updated })
            }
          />
        </TabsContent>

        <TabsContent value="costs">
          <CostBreakdownTab
            costs={internal_costs}
            onUpdate={(updated) =>
              setQuoteData({ ...quoteData, internal_costs: updated })
            }
          />
        </TabsContent>

        <TabsContent value="competitive">
          <CompetitiveTab analysis={competitive_analysis} />
        </TabsContent>

        <TabsContent value="strategy">
          <WinStrategyTab strategy={win_strategy} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuickStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border-2 border-border bg-card px-4 py-3 retro-shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
