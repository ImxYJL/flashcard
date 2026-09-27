"use client";

import { useRef } from "react";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types/card";
import { wrapSelectionAsPhrase } from "@/lib/sentence";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SentenceEditorProps = {
  value: string;
  onChange: (value: string) => void;
  category: Category;
  onCategoryChange: (category: Category) => void;
};

/** 문장 입력 + 드래그→대괄호 지정 + 카테고리 칩. 카드 추가/수정이 공유. */
export const SentenceEditor = ({
  value,
  onChange,
  category,
  onCategoryChange,
}: SentenceEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const categoryLabel = CATEGORY_LABELS[category];

  const handleWrap = () => {
    const el = textareaRef.current;
    if (!el) return;
    const result = wrapSelectionAsPhrase(value, el.selectionStart, el.selectionEnd);
    if (!result) return; // 선택 없음 or 이미 지정됨
    onChange(result.newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.newCursor, result.newCursor);
    });
  };

  return (
    <div>
      <label className="mb-2 block text-sm text-muted-foreground">
        문장 붙여넣기 또는 입력
      </label>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="예: I need to look into this issue before Friday."
        className="min-h-28 text-base"
      />

      <div className="mt-4 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
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
    </div>
  );
};
