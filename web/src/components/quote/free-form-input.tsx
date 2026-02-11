"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardPaste, MessageSquareText } from "lucide-react";

const PLACEHOLDER = `Paste a customer email, phone notes, or type a quote request...

Example:
"Hi, I need a quote for 500 full-color flyers, 8.5x11, double-sided on 100# gloss text. Also need 1,000 tri-fold brochures on the same stock. Can you have them ready in 5 business days? Thanks!"`;

interface FreeFormInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FreeFormInput({ value, onChange }: FreeFormInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(200, textarea.scrollHeight) + "px";
    }
  }, [value]);

  const charCount = value.length;

  return (
    <div className="relative">
      {/* Decorative header strip */}
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareText className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
          Quote Request
        </h3>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-mono">
          {charCount > 0 ? `${charCount.toLocaleString()} chars` : ""}
        </span>
      </div>

      <div
        className={`relative rounded-xl transition-all duration-200 ${
          isFocused
            ? "retro-shadow ring-2 ring-primary/20"
            : "retro-shadow-sm hover:retro-shadow"
        }`}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={PLACEHOLDER}
          className="min-h-[200px] resize-none rounded-xl border-2 border-border bg-card p-5 text-[15px] leading-relaxed placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:border-primary/30"
        />

        {/* Paste hint */}
        {!value && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 opacity-60">
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">
              Paste or type
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
