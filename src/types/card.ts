/** 카드 도메인 타입. 참고: docs/DOMAIN.md */

export const CATEGORIES = ["phrasal-verb", "vocab"] as const;
export type Category = (typeof CATEGORIES)[number];

/** category → 표시 라벨 (새 분류 추가 시 여기에 한 줄) */
export const CATEGORY_LABELS: Record<Category, string> = {
  "phrasal-verb": "구동사",
  vocab: "단어",
};

export type Card = {
  id: string;
  before: string;
  phrase: string;
  after: string;
  category: Category;
  tags: string[];
  box: number; // 1~5
  nextReview: string; // ISO timestamptz
  createdAt: string; // ISO timestamptz
  lastReviewedAt: string | null;
};
