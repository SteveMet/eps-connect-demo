"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless opened */}
      <div
        className={cn(
          "md:block",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          // Only add padding on desktop
          "md:pl-[240px]",
          sidebarCollapsed && "md:pl-[68px]"
        )}
      >
        {/* Mobile hamburger in header area */}
        <div className="md:hidden sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm font-bold tracking-wide text-primary">
            ACCUPRINT
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Estimator
          </span>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <Header />
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
