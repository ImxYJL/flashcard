"use client";

import type { Card } from "@/types/card";
import { useSetFavorite } from "@/queries/useCards";
import { cn } from "@/lib/utils";

export const FavoriteButton = ({ card }: { card: Card }) => {
  const setFavorite = useSetFavorite();

  return (
    <button
      type="button"
      onClick={() =>
        setFavorite.mutate({ id: card.id, isFavorite: !card.isFavorite })
      }
      disabled={setFavorite.isPending}
      aria-label={card.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
      className={cn(
        "text-lg leading-none transition-colors",
        card.isFavorite
          ? "text-brand"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {card.isFavorite ? "★" : "☆"}
    </button>
  );
};
