"use client";

import { useState } from "react";
import { useCards } from "@/queries/useCards";
import { CATEGORY_LABELS } from "@/types/card";
import { cn } from "@/lib/utils";
import { EditCardDialog } from "./_components/EditCardDialog";
import { DeleteCardButton } from "./_components/DeleteCardButton";
import { FavoriteButton } from "./_components/FavoriteButton";

export default function CardsPage() {
  const { data: cards, isLoading } = useCards();
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
        아직 카드가 없어요. 문장 추가 탭에서 만들어보세요.
      </div>
    );
  }

  const visible = favoritesOnly ? cards.filter((c) => c.isFavorite) : cards;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">전체 {cards.length}개</p>
        <button
          type="button"
          onClick={() => setFavoritesOnly((v) => !v)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            favoritesOnly
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          ★ 즐겨찾기만
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          즐겨찾기한 카드가 없어요.
        </div>
      ) : (
        visible.map((card) => (
          <div
            key={card.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex flex-1 items-start gap-2">
              <FavoriteButton card={card} />
              <div className="flex-1">
                <p className="leading-relaxed">
                  {card.before}
                  <span className="font-semibold underline decoration-2 underline-offset-2">
                    {card.phrase}
                  </span>
                  {card.after}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    {CATEGORY_LABELS[card.category]}
                  </span>
                  <span>Box {card.box}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <EditCardDialog card={card} />
              <DeleteCardButton card={card} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
