"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BrainCircuit, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Convert reasoning text (which may contain markdown) into safe HTML.
 * Handles: headings, bold, italic, inline code, bullet/numbered lists,
 * horizontal rules, and paragraphs. No external dependency needed.
 */
function reasoningToHtml(text: string): string {
  const lines = text.split("\n");
  const htmlParts: string[] = [];
  let inList: "ul" | "ol" | null = null;

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inlineFormat = (s: string) => {
    let result = escapeHtml(s);
    // Bold: **text** or __text__
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
    // Italic: *text* or _text_
    result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
    result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, "<em>$1</em>");
    // Inline code: `text`
    result = result.replace(
      /`(.+?)`/g,
      '<code class="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-primary">$1</code>'
    );
    return result;
  };

  const closeList = () => {
    if (inList) {
      htmlParts.push(inList === "ul" ? "</ul>" : "</ol>");
      inList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      closeList();
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      closeList();
      htmlParts.push('<hr class="my-3 border-border/50" />');
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const content = inlineFormat(headingMatch[2]);
      const classes: Record<number, string> = {
        1: "text-sm font-bold text-foreground mt-4 mb-1",
        2: "text-sm font-bold text-foreground/90 mt-3 mb-1",
        3: "text-xs font-bold uppercase tracking-wider text-primary/70 mt-3 mb-1",
        4: "text-xs font-semibold text-muted-foreground mt-2 mb-1",
      };
      htmlParts.push(
        `<h${level} class="${classes[level]}">${content}</h${level}>`
      );
      continue;
    }

    // Unordered list: - item or * item
    const ulMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (ulMatch) {
      if (inList !== "ul") {
        closeList();
        htmlParts.push('<ul class="space-y-1 pl-4">');
        inList = "ul";
      }
      htmlParts.push(
        `<li class="text-sm leading-relaxed text-muted-foreground list-disc">${inlineFormat(ulMatch[1])}</li>`
      );
      continue;
    }

    // Ordered list: 1. item
    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (inList !== "ol") {
        closeList();
        htmlParts.push('<ol class="space-y-1 pl-4">');
        inList = "ol";
      }
      htmlParts.push(
        `<li class="text-sm leading-relaxed text-muted-foreground list-decimal">${inlineFormat(olMatch[1])}</li>`
      );
      continue;
    }

    // Regular paragraph
    closeList();
    htmlParts.push(
      `<p class="text-sm leading-relaxed text-muted-foreground">${inlineFormat(trimmed)}</p>`
    );
  }

  closeList();
  return htmlParts.join("\n");
}

export function ReasoningDrawer() {
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("quoteReasoning");
    if (stored) {
      setReasoning(stored);
    }
  }, []);

  const reasoningHtml = useMemo(
    () => (reasoning ? reasoningToHtml(reasoning) : ""),
    [reasoning]
  );

  if (!reasoning) return null;

  const handleOpen = () => {
    setOpen(true);
    setHasBeenSeen(true);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2.5 retro-shadow transition-all hover:retro-shadow-sm hover:scale-105 active:scale-95 group",
          !hasBeenSeen && "animate-bounce-subtle"
        )}
      >
        <div className="relative">
          <BrainCircuit className="h-4.5 w-4.5 text-primary" />
          {!hasBeenSeen && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-press-yellow opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-press-yellow" />
            </span>
          )}
        </div>
        <span className="text-xs font-bold text-foreground">
          AI Thinking
        </span>
      </button>

      {/* Reasoning dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-4">
            <DialogHeader className="gap-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                </div>
                AI Reasoning Trace
              </DialogTitle>
              <DialogDescription className="text-xs">
                How the estimator analyzed your quote request
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content — rendered as formatted HTML */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div
              className="space-y-2"
              dangerouslySetInnerHTML={{ __html: reasoningHtml }}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-secondary/20 px-6 py-3">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
              <Sparkles className="h-3 w-3" />
              <span>
                Reasoning by Grok 4.1 Fast via OpenRouter &mdash;{" "}
                {reasoning.length.toLocaleString()} characters of thought
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
