"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CARD_COLOR_CLASS,
  pickCardColor,
  type CardColor,
} from "@/lib/card-color";

type CardSurfaceProps = {
  /** 지정하지 않으면 마운트 시 랜덤 1회 선택 → 그 화면 동안 고정 */
  color?: CardColor;
  className?: string;
  children: ReactNode;
};

export const CardSurface = ({ color, className, children }: CardSurfaceProps) => {
  const [picked] = useState<CardColor>(() => color ?? pickCardColor());

  return (
    <div
      className={cn(
        "rounded-3xl border border-black/5 p-7 text-foreground shadow-sm",
        CARD_COLOR_CLASS[picked],
        className,
      )}
    >
      {children}
    </div>
  );
};
