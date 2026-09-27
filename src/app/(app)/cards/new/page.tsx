"use client";

import { useRef, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types/card";
import { parseSentence, wrapSelectionAsPhrase } from "@/lib/sentence";
import { useCreateCard } from "@/queries/useCards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function NewCardPage() {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("phrasal-verb");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createCard = useCreateCard();

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
    const parsed = parseSentence(text);
    if (!parsed) {
      setError("표현을 드래그해서 지정하거나 [ ]로 감싸 주세요.");
      return;
    }
    await createCard.mutateAsync({ ...parsed, category });
    setText("");
    setSaved(true);
  };

  const categoryLabel = CATEGORY_LABELS[category];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <label className="mb-2 block text-sm text-muted-foreground">
        문장 붙여넣기 또는 입력
      </label>
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        placeholder="예: I need to look into this issue before Friday."
        className="min-h-28 text-base"
      />

      <div className="mt-4 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              category === c
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleWrap}
        className="mt-4"
      >
        선택한 부분을 {categoryLabel}로 지정
      </Button>

      <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm leading-relaxed text-muted-foreground">
        {categoryLabel} 부분을 마우스로 드래그해서 선택한 다음 위 버튼을 누르면
        자동으로 대괄호가 씌워져요.
        <br />
        직접 [ ]로 감싸서 타이핑해도 됩니다. (예: I need to [look into] this
        issue.)
      </div>

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
