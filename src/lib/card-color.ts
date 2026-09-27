/**
 * 카드 액센트 색 선택 로직.
 *
 * ⭐️ 전략 교체 지점: 지금 기본값은 "볼 때마다 랜덤"이다.
 * - 카드별 고정으로 바꾸려면: card.id를 해시해서 CARD_COLORS 인덱스로 매핑
 * - 카테고리별로 바꾸려면: card.category → 색 매핑 테이블
 * 이 파일의 pickCardColor 본문만 바꾸면 되고, 컴포넌트는 안 건드린다.
 */

export const CARD_COLORS = ["sage", "blue", "pink", "lavender"] as const;
export type CardColor = (typeof CARD_COLORS)[number];

/** CardColor → Tailwind 배경 유틸 클래스 (globals.css의 --color-pastel-* 토큰) */
export const CARD_COLOR_CLASS: Record<CardColor, string> = {
  sage: "bg-pastel-sage",
  blue: "bg-pastel-blue",
  pink: "bg-pastel-pink",
  lavender: "bg-pastel-lavender",
};

export const pickCardColor = (): CardColor =>
  CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
