"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";

interface LineItem {
  id: string;
  productType: string;
  quantity: string;
  size: string;
  pages: string;
  stock: string;
  colorsFront: string;
  colorsBack: string;
  finishing: string[];
  artworkStatus: string;
  specialInstructions: string;
}

const PRODUCT_TYPES = [
  "Flyers / Sell Sheets",
  "Brochures (Tri-fold)",
  "Brochures (Bi-fold)",
  "Booklets (Saddle Stitch)",
  "Booklets (Perfect Bound)",
  "Postcards",
  "Business Cards",
  "Banners (Vinyl)",
  "Banner Stands (Retractable)",
  "Labels / Stickers",
  "Posters",
  "Folders (Pocket)",
  "Envelopes",
  "Letterhead",
  "NCR Forms",
  "Custom",
];

const COMMON_SIZES = [
  '8.5" x 11"',
  '11" x 17"',
  '4" x 6"',
  '6" x 9"',
  '5" x 7"',
  '3.5" x 2" (Business Card)',
  '9" x 12" (Folder)',
  '24" x 36" (Poster)',
  '33" x 80" (Banner Stand)',
  '3\' x 6\' (Banner)',
  '4\' x 8\' (Banner)',
  "Custom",
];

const PAPER_STOCKS = [
  "20# Bond (50# Offset)",
  "24# Bond (60# Offset)",
  "70# Text",
  "80# Text",
  "100# Text",
  "80# Gloss Text",
  "100# Gloss Text",
  "65# Cover",
  "80# Cover (10pt)",
  "100# Cover (12pt)",
  "80# Gloss Cover (10pt C1S)",
  "100# Gloss Cover (12pt C1S)",
  "12pt C2S",
  "14pt C2S (Postcards)",
  "Kraft 70# Text",
  "Kraft 80# Cover",
  "13oz Vinyl (Banners)",
  "White BOPP (Labels)",
  "Clear BOPP (Labels)",
  "Other / Custom",
];

const COLOR_OPTIONS = [
  "4-Color (CMYK)",
  "2-Color",
  "1-Color (Black)",
  "PMS Spot Color",
  "Blank",
];

const FINISHING_OPTIONS = [
  "Fold",
  "Saddle Stitch",
  "Perfect Bind",
  "Spiral / Coil Bind",
  "Laminate (Matte)",
  "Laminate (Gloss)",
  "Laminate (Soft Touch)",
  "UV Coating",
  "Aqueous Coating",
  "Spot UV",
  "Die Cut",
  "Foil Stamp",
  "Emboss",
  "Score / Crease",
  "Perforate",
  "Drill",
  "Numbering",
  "Shrink Wrap",
  "Round Corners",
  "Grommets (Banners)",
  "Hemming (Banners)",
];

const ARTWORK_OPTIONS = [
  "Print-Ready PDF",
  "Needs Minor Corrections",
  "Need Full Design",
];

function createEmptyItem(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    productType: "",
    quantity: "",
    size: "",
    pages: "",
    stock: "",
    colorsFront: "4-Color (CMYK)",
    colorsBack: "4-Color (CMYK)",
    finishing: [],
    artworkStatus: "Print-Ready PDF",
    specialInstructions: "",
  };
}

interface StructuredBuilderProps {
  onSubmit: (text: string) => void;
  isProcessing?: boolean;
}

export function StructuredBuilder({ onSubmit, isProcessing = false }: StructuredBuilderProps) {
  const [items, setItems] = useState<LineItem[]>([createEmptyItem()]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Local Delivery");

  const updateItem = (id: string, field: keyof LineItem, value: string | string[]) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const toggleFinishing = (id: string, finishing: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const has = item.finishing.includes(finishing);
        return {
          ...item,
          finishing: has
            ? item.finishing.filter((f) => f !== finishing)
            : [...item.finishing, finishing],
        };
      })
    );
  };

  const addItem = () => setItems([...items, createEmptyItem()]);
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const buildRequestText = (): string => {
    const parts: string[] = [];
    items.forEach((item, idx) => {
      if (!item.productType) return;
      const lines = [`Item ${idx + 1}: ${item.productType}`];
      if (item.quantity) lines.push(`  Quantity: ${item.quantity}`);
      if (item.size) lines.push(`  Size: ${item.size}`);
      if (item.pages) lines.push(`  Pages: ${item.pages}`);
      if (item.stock) lines.push(`  Stock: ${item.stock}`);
      lines.push(`  Colors: ${item.colorsFront} front / ${item.colorsBack} back`);
      if (item.finishing.length > 0) lines.push(`  Finishing: ${item.finishing.join(", ")}`);
      if (item.artworkStatus !== "Print-Ready PDF") lines.push(`  Artwork: ${item.artworkStatus}`);
      if (item.specialInstructions) lines.push(`  Notes: ${item.specialInstructions}`);
      parts.push(lines.join("\n"));
    });
    if (deliveryDate) parts.push(`\nDelivery date: ${deliveryDate}`);
    parts.push(`Delivery method: ${deliveryMethod}`);
    return parts.join("\n\n");
  };

  const hasValidItems = items.some((item) => item.productType !== "");

  const handleSubmit = () => {
    if (!hasValidItems) return;
    const text = buildRequestText();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  const showPages = (type: string) =>
    type.toLowerCase().includes("booklet") ||
    type.toLowerCase().includes("brochure");

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="rounded-xl border-2 border-border bg-card p-5 retro-shadow-sm animate-press-stamp"
        >
          {/* Item header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {idx + 1}
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Line Item
              </span>
            </div>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Product Type */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Type
              </Label>
              <Select
                value={item.productType}
                onValueChange={(v) => updateItem(item.id, "productType", v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity
              </Label>
              <Input
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                placeholder="1000, 2500, 5000"
                className="bg-background"
              />
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Finished Size
              </Label>
              <Select
                value={item.size}
                onValueChange={(v) => updateItem(item.id, "size", v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select size..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pages (conditional) */}
            {showPages(item.productType) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pages / Panels
                </Label>
                <Input
                  value={item.pages}
                  onChange={(e) =>
                    updateItem(item.id, "pages", e.target.value)
                  }
                  placeholder="8"
                  className="bg-background"
                />
              </div>
            )}

            {/* Paper Stock */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paper / Substrate
              </Label>
              <Select
                value={item.stock}
                onValueChange={(v) => updateItem(item.id, "stock", v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select stock..." />
                </SelectTrigger>
                <SelectContent>
                  {PAPER_STOCKS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Colors (Front)
              </Label>
              <Select
                value={item.colorsFront}
                onValueChange={(v) =>
                  updateItem(item.id, "colorsFront", v)
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Colors (Back)
              </Label>
              <Select
                value={item.colorsBack}
                onValueChange={(v) =>
                  updateItem(item.id, "colorsBack", v)
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Artwork Status */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Artwork Status
              </Label>
              <Select
                value={item.artworkStatus}
                onValueChange={(v) =>
                  updateItem(item.id, "artworkStatus", v)
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARTWORK_OPTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Finishing checkboxes */}
          <div className="mt-4">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Finishing Options
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {FINISHING_OPTIONS.map((f) => (
                <label
                  key={f}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                    item.finishing.includes(f)
                      ? "border-primary/30 bg-primary/5 text-foreground font-medium"
                      : "border-border bg-background text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <Checkbox
                    checked={item.finishing.includes(f)}
                    onCheckedChange={() => toggleFinishing(item.id, f)}
                    className="h-3.5 w-3.5"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Special instructions */}
          <div className="mt-4 space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Special Instructions
            </Label>
            <Textarea
              value={item.specialInstructions}
              onChange={(e) =>
                updateItem(item.id, "specialInstructions", e.target.value)
              }
              placeholder="Any special requirements..."
              className="h-20 resize-none bg-background"
            />
          </div>
        </div>
      ))}

      {/* Add item button */}
      <Button
        variant="outline"
        onClick={addItem}
        className="w-full border-dashed border-2 hover:border-primary/30 hover:bg-primary/5"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Another Item
      </Button>

      {/* Delivery options */}
      <div className="grid gap-4 sm:grid-cols-2 rounded-xl border-2 border-border bg-card p-5 retro-shadow-sm">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery Date
          </Label>
          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery Method
          </Label>
          <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pickup">Pickup</SelectItem>
              <SelectItem value="Local Delivery">Local Delivery</SelectItem>
              <SelectItem value="Ship (UPS/FedEx)">Ship (UPS/FedEx)</SelectItem>
              <SelectItem value="Mailing Services">Mailing Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit */}
      <Button
        size="lg"
        onClick={handleSubmit}
        disabled={!hasValidItems || isProcessing}
        className="w-full bg-primary text-lg font-bold retro-shadow hover:retro-shadow-sm transition-all disabled:opacity-50 disabled:retro-shadow-sm"
      >
        <Package className="mr-2 h-5 w-5" />
        Generate Estimate
      </Button>
    </div>
  );
}
