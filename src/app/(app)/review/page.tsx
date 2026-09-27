"use client";

import { useEffect, useState } from "react";
import { useCards, useGradeCard } from "@/queries/useCards";
import { isDue } from "@/lib/leitner";
import type { Card } from "@/types/card";
import { CardSurface } from "@/components/common/CardSurface";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";

export default function ReviewPage() {
  const { data: cards, isLoading } = useCards();
  const gradeCard = useGradeCard();

  const [queue, setQueue] = useState<Card[] | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // due 카드를 세션 큐로 1회 스냅샷 (채점 후 refetch로 큐가 재빌드되지 않게)
  useEffect(() => {
    if (cards && queue === null) {
      const due = cards.filter((c) =>
        isDue({ nextReview: Date.parse(c.nextReview) }),
      );
      setQueue(due);
      setTodayCount(due.length);
    }
  }, [cards, queue]);

  const total = cards?.length ?? 0;
  const masterCount = cards?.filter((c) => c.box === 5).length ?? 0;

  const handleGrade = async (knew: boolean) => {
    const card = queue![index];
    setRevealed(false);
    // 오답: 같은 세션에 다시 (큐 끝에 추가)
    if (!knew) setQueue((q) => (q ? [...q, card] : q));
    setIndex((i) => i + 1);
    await gradeCard.mutateAsync({ card, knew });
  };

  const header = (
    <div>
      <h1 className="text-2xl font-semibold">복습</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        오늘 복습 <b className="text-foreground">{todayCount}</b>개 · 전체{" "}
        <b className="text-foreground">{total}</b>개 · 마스터{" "}
        <b className="text-foreground">{masterCount}</b>개
      </p>
    </div>
  );

  if (isLoading || queue === null) {
    return (
      <>
        {header}
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          불러오는 중…
        </div>
      </>
    );
  }

  if (queue.length === 0) {
    return (
      <>
        {header}
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          복습할 카드가 없어요. 문장 추가 탭에서 카드를 만들어보세요.
        </div>
      </>
    );
  }

  if (index >= queue.length) {
    return (
      <>
        {header}
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          오늘 복습 끝! 🎉
        </div>
      </>
    );
  }

  const current = queue[index];
  const remaining = queue.length - index;

  return (
    <>
      {header}
      <CardSurface key={current.id} className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground/60">남은 카드 {remaining}개</span>
          <Badge>Box {current.box}</Badge>
        </div>

        <p className="text-2xl leading-relaxed tracking-tight">
          {current.before}
          {revealed ? (
            <span className="font-semibold underline decoration-2 underline-offset-4">
              {current.phrase}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mx-1 inline-block h-[1.1em] w-24 translate-y-1 border-b-2 border-foreground"
              aria-label="빈칸 정답 보기"
            />
          )}
          {current.after}
        </p>

        {revealed ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={gradeCard.isPending}
              onClick={() => handleGrade(false)}
            >
              헷갈렸어요
            </Button>
            <Button
              className="flex-1"
              disabled={gradeCard.isPending}
              onClick={() => handleGrade(true)}
            >
              알고 있었어요
            </Button>
          </div>
        ) : (
          <p className="text-sm text-foreground/60">빈칸을 눌러서 확인하세요</p>
        )}
      </CardSurface>
    </>
  );
}
