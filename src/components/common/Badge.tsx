import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  className?: string;
  children: ReactNode;
};

/** 레퍼런스의 오렌지 알약 배지 (tags 표시용, v2) */
export const Badge = ({ className, children }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand px-3 py-1 text-xs font-medium tracking-wide text-brand-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
};
