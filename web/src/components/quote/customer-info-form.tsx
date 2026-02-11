"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import type { CustomerInfo } from "@/lib/types";

interface CustomerInfoFormProps {
  value: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
}

export function CustomerInfoForm({ value, onChange }: CustomerInfoFormProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (field: keyof CustomerInfo, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card retro-shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-secondary/50"
      >
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Customer Info
        </span>
        <span className="ml-1 text-xs text-muted-foreground/60">
          (optional)
        </span>
        <div className="flex-1" />
        {value.name && (
          <span className="text-xs text-primary font-medium mr-2">
            {value.name}
            {value.company ? ` — ${value.company}` : ""}
          </span>
        )}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-4 border-t border-border px-5 py-4 sm:grid-cols-2 animate-press-stamp">
          <div className="space-y-1.5">
            <Label htmlFor="customer-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <Input
              id="customer-name"
              value={value.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="John Smith"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-company" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </Label>
            <Input
              id="customer-company"
              value={value.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Acme Corp"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <Input
              id="customer-email"
              type="email"
              value={value.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="john@acme.com"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone
            </Label>
            <Input
              id="customer-phone"
              type="tel"
              value={value.phone || ""}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
