"use client";

import { useState } from "react";
import { parseSentence } from "@/lib/sentence";
import type { Card, Category } from "@/types/card";
import { useUpdateCard } from "@/queries/useCards";
import { SentenceEditor } from "@/components/common/SentenceEditor";
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

const toText = (card: Card) => `${card.before}[${card.phrase}]${card.after}`;

export const EditCardDialog = ({ card }: { card: Card }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => toText(card));
  const [category, setCategory] = useState<Category>(card.category);
  const [error, setError] = useState<string | null>(null);
  const updateCard = useUpdateCard();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      // 열 때 현재 카드 값으로 리셋
      setText(toText(card));
      setCategory(card.category);
      setError(null);
    }
  };

  const handleSave = async () => {
    setError(null);
    const parsed = parseSentence(text);
    if (!parsed) {
      setError("표현을 [ ]로 지정해 주세요.");
      return;
    }
    try {
      await updateCard.mutateAsync({ id: card.id, ...parsed, category });
      setOpen(false);
    } catch {
      setError("저장에 실패했어요. 네트워크를 확인해 주세요.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          수정
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카드 수정</DialogTitle>
        </DialogHeader>

        <SentenceEditor
          value={text}
          onChange={setText}
          category={category}
          onCategoryChange={setCategory}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateCard.isPending}>
            {updateCard.isPending ? "저장 중…" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
