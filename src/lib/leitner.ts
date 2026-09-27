/**
 * Leitner 박스 복습 계산 순수 로직.
 * 시간은 epoch ms로 다룬다(서비스 계층에서 timestamptz ↔ ms 변환).
 * 참고: docs/DOMAIN.md
 */

/** index = box(1~5), 0번은 미사용 자리. box1은 즉시 재등장이라 스케줄에 쓰이지 않음. */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35] as const;

/** 하루 경계: 새벽 2시 (자정은 빡세니 살짝 늦춤). 이 시각 기준으로 "복습 하루"가 바뀐다. */
export const DAY_START_HOUR = 2;

const daysToMs = (days: number): number => days * 24 * 60 * 60 * 1000;

/** now가 속한 복습 하루의 시작(가장 최근 새벽 2시) epoch ms. 로컬 타임존 기준. */
const startOfReviewDay = (now: number): number => {
  const anchor = new Date(now);
  anchor.setHours(DAY_START_HOUR, 0, 0, 0);
  if (now < anchor.getTime()) anchor.setDate(anchor.getDate() - 1);
  return anchor.getTime();
};

export type ReviewableCard = {
  box: number; // 1~5
  nextReview: number; // epoch ms
  lastReviewed: number | null;
};

/**
 * 채점 결과로 박스/다음 복습 시점을 갱신.
 * - 정답(knew): box +1(최대 5), nextReview = 복습 하루 시작(새벽 2시) + 해당 박스 간격
 *   → 캘린더 날짜로 N일 뒤 새벽 2시에 due (그날 아침에 열면 뜬다)
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
    nextReview: startOfReviewDay(now) + daysToMs(BOX_INTERVAL_DAYS[nextBox]),
    lastReviewed: now,
  };
};

/** 복습 큐 노출 여부. */
export const isDue = (
  card: Pick<ReviewableCard, "nextReview">,
  now: number = Date.now(),
): boolean => card.nextReview <= now;
