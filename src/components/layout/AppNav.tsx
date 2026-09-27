"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/review", label: "복습" },
  { href: "/cards/new", label: "문장 추가" },
  { href: "/cards", label: "전체 관리" },
] as const;

export const AppNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 rounded-xl px-4 py-3 text-center text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "border border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};
