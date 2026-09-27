"use client";

import { useState } from "react";
import type { Card } from "@/types/card";
import { useDeleteCard } from "@/queries/useCards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const DeleteCardButton = ({ card }: { card: Card }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteCard = useDeleteCard();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setError(null);
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteCard.mutateAsync(card.id);
      setOpen(false);
    } catch {
      setError("삭제에 실패했어요. 네트워크를 확인해 주세요.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카드를 삭제할까요?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">이 작업은 되돌릴 수 없어요.</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCard.isPending}
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
