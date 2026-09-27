/**
 * Leitner 박스 복습 계산 순수 로직.
 * 시간은 epoch ms로 다룬다(서비스 계층에서 timestamptz ↔ ms 변환).
 * 참고: docs/DOMAIN.md
 */

/** index = box(1~5), 0번은 미사용 자리. box1은 즉시 재등장이라 스케줄에 쓰이지 않음. */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35] as const;

const daysToMs = (days: number): number => days * 24 * 60 * 60 * 1000;

export type ReviewableCard = {
  box: number; // 1~5
  nextReview: number; // epoch ms
  lastReviewed: number | null;
};

/**
 * 채점 결과로 박스/다음 복습 시점을 갱신.
 * - 정답(knew): box +1(최대 5), nextReview = now + 해당 박스 간격
 * - 오답(!knew): box = 1, nextReview = now → 같은 세션에 다시 등장
 */
export const grade = (
  card: ReviewableCard,
  knew: boolean,
  now: number = Date.now(),
): ReviewableCard => {
  if (!knew) {
    return { ...card, box: 1, nextReview: now, lastReviewed: now };
  }

  const nextBox = Math.min(card.box + 1, 5);
  return {
    ...card,
    box: nextBox,
    nextReview: now + daysToMs(BOX_INTERVAL_DAYS[nextBox]),
    lastReviewed: now,
  };
};

/** 복습 큐 노출 여부. */
export const isDue = (
  card: Pick<ReviewableCard, "nextReview">,
  now: number = Date.now(),
): boolean => card.nextReview <= now;
