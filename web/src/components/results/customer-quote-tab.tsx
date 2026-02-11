"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  Clock,
  User,
  Building2,
  Mail,
  Printer,
} from "lucide-react";
import { EditableCell } from "./editable-cell";
import type { CustomerQuote, QuoteLineItem } from "@/lib/types";

interface CustomerQuoteTabProps {
  quote: CustomerQuote;
  onUpdate: (quote: CustomerQuote) => void;
}

export function CustomerQuoteTab({ quote, onUpdate }: CustomerQuoteTabProps) {
  const updateLineItemPrice = (
    itemIdx: number,
    qtyIdx: number,
    field: "unit_price" | "total",
    value: number | string
  ) => {
    const updated = { ...quote };
    const items = [...updated.line_items];
    const quantities = [...items[itemIdx].quantities];

    if (field === "unit_price" && typeof value === "number") {
      quantities[qtyIdx] = {
        ...quantities[qtyIdx],
        unit_price: value,
        total: +(value * quantities[qtyIdx].qty).toFixed(2),
      };
    } else if (field === "total" && typeof value === "number") {
      quantities[qtyIdx] = {
        ...quantities[qtyIdx],
        total: value,
        unit_price: +(value / quantities[qtyIdx].qty).toFixed(4),
      };
    }

    items[itemIdx] = { ...items[itemIdx], quantities };
    updated.line_items = items;

    // Recalculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + (item.quantities[0]?.total || 0),
      0
    );
    updated.subtotal = +subtotal.toFixed(2);
    updated.package_discount_amt = +(
      subtotal *
      (updated.package_discount_pct / 100)
    ).toFixed(2);
    updated.total = +(subtotal - updated.package_discount_amt).toFixed(2);

    onUpdate(updated);
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 animate-press-stamp">
      {/* Quote header */}
      <Card className="overflow-hidden retro-shadow">
        <div className="bg-primary px-6 py-5 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-wide">
                  ACCUPRINT COMMERCIAL PRINTING
                </h2>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
                  Estimate / Quote
                </p>
              </div>
            </div>
            {/* CMYK dots decoration */}
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#00bcd4]/60" />
              <div className="h-3 w-3 rounded-full bg-[#e91e63]/60" />
              <div className="h-3 w-3 rounded-full bg-[#ffc107]/60" />
              <div className="h-3 w-3 rounded-full bg-primary-foreground/30" />
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              {quote.customer.name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{quote.customer.name}</span>
                </div>
              )}
              {quote.customer.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.customer.company}</span>
                </div>
              )}
              {quote.customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.customer.email}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm sm:text-right">
              <div className="flex items-center gap-2 sm:justify-end">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono font-bold text-primary">
                  {quote.quote_number}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{today}</span>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Valid for {quote.valid_days} days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {quote.line_items.map((item, idx) => (
        <LineItemCard
          key={idx}
          item={item}
          onPriceChange={(qtyIdx, field, value) =>
            updateLineItemPrice(idx, qtyIdx, field, value)
          }
        />
      ))}

      {/* Totals */}
      <Card className="retro-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <EditableCell
                value={quote.subtotal}
                type="currency"
                readOnly
                className="text-base font-semibold"
              />
            </div>
            {quote.package_discount_pct > 0 && (
              <div className="flex items-center gap-8 text-sm">
                <span className="text-margin-green font-medium">
                  Package Discount ({quote.package_discount_pct}%):
                </span>
                <span className="font-mono text-base font-semibold text-margin-green">
                  -${quote.package_discount_amt.toFixed(2)}
                </span>
              </div>
            )}
            <Separator className="my-1 w-48" />
            <div className="flex items-center gap-8">
              <span className="text-lg font-bold">Total:</span>
              <span className="font-mono text-2xl font-bold text-primary">
                ${quote.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {quote.notes.length > 0 && (
        <Card className="retro-shadow-sm">
          <CardContent className="p-5">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Notes & Terms
            </h4>
            <ul className="space-y-1.5">
              {quote.notes.map((note, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LineItemCard({
  item,
  onPriceChange,
}: {
  item: QuoteLineItem;
  onPriceChange: (
    qtyIdx: number,
    field: "unit_price" | "total",
    value: number | string
  ) => void;
}) {
  return (
    <Card className="retro-shadow-sm">
      <CardContent className="p-5">
        {/* Item header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {item.item_number}
          </div>
          <h3 className="text-lg font-bold">{item.product}</h3>
          <Badge variant="secondary" className="ml-auto">
            {item.lead_time_days} day{item.lead_time_days !== 1 ? "s" : ""} lead time
          </Badge>
        </div>

        {/* Specs grid */}
        <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-secondary/50 p-4 sm:grid-cols-3">
          <SpecRow label="Size" value={item.specs.size} />
          {item.specs.pages && (
            <SpecRow label="Pages" value={`${item.specs.pages} pages`} />
          )}
          <SpecRow label="Colors" value={item.specs.colors} />
          <SpecRow label="Stock" value={item.specs.stock} />
          {item.specs.finishing.length > 0 && (
            <SpecRow
              label="Finishing"
              value={item.specs.finishing.join(", ")}
            />
          )}
          {item.specs.binding && (
            <SpecRow label="Binding" value={item.specs.binding} />
          )}
        </div>

        {/* Pricing table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quantity
                </th>
                <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Unit Price
                </th>
                <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {item.quantities.map((qty, qIdx) => (
                <tr
                  key={qIdx}
                  className={`border-b border-border/50 ${qIdx === 0 ? "bg-primary/[0.02]" : ""}`}
                >
                  <td className="py-3 font-medium">
                    {qty.qty.toLocaleString()}
                    {qIdx === 0 && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-[10px]"
                      >
                        Primary
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <EditableCell
                      value={qty.unit_price}
                      type="currency"
                      onChange={(v) =>
                        onPriceChange(qIdx, "unit_price", v)
                      }
                    />
                  </td>
                  <td className="py-3 text-right">
                    <EditableCell
                      value={qty.total}
                      type="currency"
                      onChange={(v) => onPriceChange(qIdx, "total", v)}
                      className="font-semibold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="mt-3 text-xs italic text-muted-foreground">
            {item.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
