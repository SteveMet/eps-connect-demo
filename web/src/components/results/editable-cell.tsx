"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: number | string;
  type?: "currency" | "percentage" | "number" | "text";
  onChange?: (value: number | string) => void;
  className?: string;
  readOnly?: boolean;
}

export function EditableCell({
  value,
  type = "text",
  onChange,
  className,
  readOnly = false,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when value prop changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value));
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatDisplay = (val: number | string): string => {
    if (typeof val === "string") return val;
    switch (type) {
      case "currency":
        return `$${val.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
        return val.toLocaleString("en-US");
      default:
        return String(val);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    if (!onChange) return;

    let parsedValue: number | string = editValue;
    if (type === "currency" || type === "percentage" || type === "number") {
      const cleaned = editValue.replace(/[$,%\s]/g, "");
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        parsedValue = num;
      } else {
        setEditValue(String(value));
        return;
      }
    }
    onChange(parsedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(String(value));
      setIsEditing(false);
    }
  };

  if (readOnly) {
    return (
      <span className={cn("font-mono text-sm", className)}>
        {formatDisplay(value)}
      </span>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded border border-primary/40 bg-background px-2 py-0.5 font-mono text-sm outline-none ring-1 ring-primary/20",
          className
        )}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setEditValue(
          typeof value === "number"
            ? type === "currency"
              ? value.toFixed(2)
              : type === "percentage"
                ? value.toFixed(1)
                : String(value)
            : String(value)
        );
        setIsEditing(true);
      }}
      className={cn(
        "group relative cursor-pointer rounded px-1 py-0.5 font-mono text-sm transition-colors hover:bg-primary/5",
        className
      )}
      title="Click to edit"
    >
      {formatDisplay(value)}
      <span className="absolute -right-1 -top-1 hidden h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:block" />
    </button>
  );
}
