"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types/card";
import { parseSentence, wrapSelectionAsPhrase } from "@/lib/sentence";
import { useCreateCard } from "@/queries/useCards";
import { useUser } from "@/lib/supabase/useUser";
import { CardSurface } from "@/components/common/CardSurface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewCardPage() {
  const { user, loading } = useUser();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createCard = useCreateCard();

  const parsed = parseSentence(text);

  const handleWrap = () => {
    const el = textareaRef.current;
    if (!el) return;
    const result = wrapSelectionAsPhrase(text, el.selectionStart, el.selectionEnd);
    if (!result) return; // 선택 없음 or 이미 지정됨
    setText(result.newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.newCursor, result.newCursor);
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!parsed) {
      setError("표현을 드래그해서 [ ]로 지정해 주세요.");
      return;
    }
    if (!category) {
      setError("카테고리를 선택해 주세요.");
      return;
    }
    await createCard.mutateAsync({ ...parsed, category });
    setText("");
    setCategory("");
    setSaved(true);
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center text-muted-foreground">
        불러오는 중…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <p>로그인이 필요합니다.</p>
        <Link href="/" className="underline">
          홈으로
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">카드 만들기</h1>
        <Link href="/" className="text-sm text-muted-foreground underline">
          홈
        </Link>
      </div>

      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        placeholder="문장을 붙여넣고, 빈칸으로 만들 표현을 드래그한 뒤 '표현 지정'을 누르세요."
        className="min-h-32 text-base"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={handleWrap}>
          표현 지정 [ ]
        </Button>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as Category)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {parsed && (
        <CardSurface className="text-lg leading-relaxed">
          {parsed.before}
          <span className="mx-1 rounded px-2 underline decoration-2 underline-offset-4">
            {parsed.phrase}
          </span>
          {parsed.after}
        </CardSurface>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-muted-foreground">저장됐어요 ✓</p>}

      <Button
        onClick={handleSubmit}
        disabled={createCard.isPending}
        className="self-start"
      >
        {createCard.isPending ? "저장 중…" : "저장"}
      </Button>
    </main>
  );
}
