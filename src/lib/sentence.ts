/**
 * 문장 파싱/편집 순수 로직.
 * - parseSentence: `[phrase]` 표기를 before/phrase/after로 분리
 * - wrapSelectionAsPhrase: 드래그 선택 구간에 대괄호 자동 삽입 (1문장 1표현 강제)
 * 참고: docs/DOMAIN.md
 */

export type ParsedSentence = {
  before: string;
  phrase: string;
  after: string;
};

/** 첫 `[...]`를 찾아 분리. 대괄호가 없거나 표현이 비면 null. */
export const parseSentence = (raw: string): ParsedSentence | null => {
  const match = raw.match(/\[([^\]]+)\]/);
  if (!match) return null;

  const phrase = match[1].trim();
  if (!phrase) return null;

  return {
    before: raw.slice(0, match.index),
    phrase,
    after: raw.slice((match.index ?? 0) + match[0].length),
  };
};

/**
 * textarea의 선택 구간을 `[ ]`로 감싼 새 값 + 커서 위치를 반환.
 * 선택이 없거나 core가 비었거나 이미 대괄호가 있으면 null (1문장 1표현 제약).
 * 선택 구간 앞뒤 공백은 보존하고 core 텍스트에만 대괄호를 씌운다.
 */
export const wrapSelectionAsPhrase = (
  value: string,
  selectionStart: number,
  selectionEnd: number,
): { newValue: string; newCursor: number } | null => {
  if (selectionStart === selectionEnd) return null; // 선택 안 함

  const sel = value.slice(selectionStart, selectionEnd);
  const leadWS = sel.match(/^\s*/)?.[0] ?? "";
  const trailWS = sel.match(/\s*$/)?.[0] ?? "";
  const core = sel.slice(leadWS.length, sel.length - trailWS.length);
  if (!core) return null;

  if (value.includes("[") || value.includes("]")) return null; // 이미 지정됨

  const newValue =
    value.slice(0, selectionStart) +
    leadWS +
    "[" +
    core +
    "]" +
    trailWS +
    value.slice(selectionEnd);

  const newCursor =
    selectionStart + leadWS.length + core.length + 2 + trailWS.length;
  return { newValue, newCursor };
};
