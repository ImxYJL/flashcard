"use client";

import { useState } from "react";
import { parseSentence } from "@/lib/sentence";
import { type Category } from "@/types/card";
import { useCreateCard } from "@/queries/useCards";
import { SentenceEditor } from "@/components/common/SentenceEditor";
import { Button } from "@/components/ui/button";

export default function NewCardPage() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("phrasal-verb");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const createCard = useCreateCard();

  const handleSubmit = async () => {
    setError(null);
    const parsed = parseSentence(text);
    if (!parsed) {
      setError("표현을 드래그해서 지정하거나 [ ]로 감싸 주세요.");
      return;
    }
    await createCard.mutateAsync({ ...parsed, category });
    setText("");
    setSaved(true);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <SentenceEditor
        value={text}
        onChange={(v) => {
          setText(v);
          setSaved(false);
        }}
        category={category}
        onCategoryChange={setCategory}
      />

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {saved && <p className="mt-3 text-sm text-muted-foreground">저장됐어요 ✓</p>}

      <Button
        onClick={handleSubmit}
        disabled={createCard.isPending}
        className="mt-4"
      >
        {createCard.isPending ? "추가 중…" : "카드 추가"}
      </Button>
    </div>
  );
}
