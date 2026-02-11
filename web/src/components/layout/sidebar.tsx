"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FilePlus2,
  LayoutDashboard,
  History,
  Settings,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "New Quote",
    href: "/quote/new",
    icon: FilePlus2,
    active: true,
  },
  {
    label: "Dashboard",
    href: "#",
    icon: LayoutDashboard,
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Quote History",
    href: "#",
    icon: History,
    disabled: true,
    badge: "Soon",
  },
  {
    label: "Settings",
    href: "#",
    icon: Settings,
    disabled: true,
    badge: "Soon",
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onNavigate?: () => void;
}

function ModelBadge() {
  const [model, setModel] = useState<string | null>(null);

  useEffect(() => {
    setModel(sessionStorage.getItem("quoteModel"));
  }, []);

  // Extract short name: "anthropic/claude-sonnet-4.5" → "Claude Sonnet 4.5"
  const shortName = model
    ? model
        .split("/")
        .pop()!
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="flex items-center gap-2 rounded-md bg-sidebar-accent/50 px-3 py-2">
      <div
        className={cn(
          "h-2 w-2 animate-pulse rounded-full",
          shortName ? "bg-margin-green" : "bg-press-yellow"
        )}
      />
      <span className="text-[11px] font-medium text-sidebar-foreground/60 truncate">
        {shortName || "Simulation Mode"}
      </span>
    </div>
  );
}

export function Sidebar({ collapsed, onCollapsedChange, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <Printer className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-press-stamp">
            <span className="text-sm font-bold tracking-wide text-sidebar-primary">
              ACCUPRINT
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">
              Estimator
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href !== "#" &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : item.disabled
                    ? "cursor-not-allowed text-sidebar-foreground/30"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                } else {
                  onNavigate?.();
                }
              }}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-sidebar-primary"
                    : item.disabled
                      ? "text-sidebar-foreground/20"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                )}
              />
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-sidebar-border px-2 py-0.5 text-[10px] font-medium text-sidebar-foreground/40">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Decorative CMYK dots */}
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 opacity-30">
            <div className="h-2 w-2 rounded-full bg-press-cyan" />
            <div className="h-2 w-2 rounded-full bg-press-red" />
            <div className="h-2 w-2 rounded-full bg-press-yellow" />
            <div className="h-2 w-2 rounded-full bg-sidebar-foreground" />
            <span className="ml-2 text-[9px] uppercase tracking-[0.3em] text-sidebar-foreground/30">
              CMYK
            </span>
          </div>
        </div>
      )}

      {/* Mode badge */}
      {!collapsed && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <ModelBadge />
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden md:flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
