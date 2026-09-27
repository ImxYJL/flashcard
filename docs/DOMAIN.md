# 도메인 & 데이터 구조

구동사/단어를 문장 속 **클로즈(빈칸)** 로 만들어 Leitner 방식으로 주기 복습하는 앱의 도메인 규칙과 데이터 모델을 정리한다. 기능 범위(v1/v2)는 [ROADMAP](./ROADMAP.md), 앱 구조·인증은 [ARCHITECTURE](./ARCHITECTURE.md) 참고.

## 핵심 개념

- **카드(card)**: 한 문장 + 그 문장에서 빈칸 처리할 표현 하나. 문장은 `before` / `phrase` / `after` 3조각으로 저장되고, 복습 시 `phrase` 자리가 빈칸이 된다.
- **1문장 1표현**: 카드 하나에는 빈칸(표현)이 정확히 하나. 입력 단계(`wrapSelectionAsPhrase`)에서 강제한다.
- **Leitner 박스**: 카드마다 1~5의 박스를 가지며, 채점 결과에 따라 오르내리고 다음 복습 시점이 정해진다. 복잡한 SR 알고리즘(SM-2/FSRS)은 쓰지 않는다 — 박스 기반이 의도적 선택.

## 데이터 모델

### cards

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (pk) | |
| user_id | uuid (fk → auth.users.id) | RLS 매칭용, 단일 소유자 |
| before | text | 빈칸 앞 문장 조각 |
| phrase | text | 빈칸 처리할 표현 |
| after | text | 빈칸 뒤 문장 조각 |
| category | text | **배타적 단일 분류**. `'phrasal-verb'` \| `'vocab'` |
| tags | text[] (default `'{}'`) | **다중 성격 라벨** (아래 참고) |
| box | int (default 1) | Leitner 박스 1~5 |
| next_review | timestamptz | 다음 복습 시점 |
| created_at | timestamptz | |
| last_reviewed_at | timestamptz (nullable) | 마지막 채점 시각 |
| **[v2]** is_favorite | boolean (default false) | 즐겨찾기와 함께 도입 |
| **[v2]** status | text (default `'active'`) | `'active'` \| `'graduated'`. 졸업 기능과 함께 도입 |

원문은 `before + '[' + phrase + ']' + after` 로 언제든 재조립할 수 있다(수정 화면 등).

### review_events — **[v2, 잔디와 함께 도입]**

채점 로그. 카드 상태와 별개로 "언제 몇 번 복습했나"를 날짜 집계하기 위한 테이블.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (pk) | |
| card_id | uuid (fk → cards.id) | |
| reviewed_at | timestamptz | |
| result | text | `'know'` \| `'unsure'` |

> RLS(소유자 UID 고정)는 모든 테이블에 적용된다 — [ARCHITECTURE](./ARCHITECTURE.md) 참고. v2 컬럼/테이블은 기능을 붙일 때 `alter table` 한 줄로 추가하면 되고(기존 행은 default로 채워지고 RLS는 테이블 단위라 그대로 보호됨), 미리 만들어 두지 않는다. 예외적으로 `tags`만 곧 도입이 확정이라 컬럼을 v1부터 둔다.

## 분류: category vs tags

둘 다 카드를 묶는 라벨이지만 역할이 다르다.

|  | category | tags |
|---|---|---|
| 값의 출처 | 앱이 정한 고정 목록 | 정해진 목록에서 선택(확정 예정) |
| 카드당 개수 | **택1 (단일)** | **여러 개 (다중)** |
| 성격 | 배타적 큰 구조 축 (구동사냐 단어냐) | 한 카드가 동시에 띠는 여러 성격 |
| 저장 | `text` | `text[]` |
| 검증 | TS 상수 `CATEGORIES` | TS 상수(정해지면) — 저장 구조는 자유 입력과 동일 |

**확장 규칙**
- 새 **배타 분류**(예: `'idiom'`을 별도 축으로)가 오면 → `CATEGORIES` 문자열에 추가. `text` 컬럼이라 마이그레이션 0 (enum 타입은 쓰지 않는다).
- **겹치는/가로지르는 라벨**(한 카드가 여러 개 동시에)이 오면 → tags로 흡수.

```ts
// types/card.ts
export const CATEGORIES = ['phrasal-verb', 'vocab'] as const;
export type Category = (typeof CATEGORIES)[number];
```

## 복습(Leitner) 규칙

1. **복습 큐 노출**: `next_review <= now` 인 카드 (`isDue`). *(v2에서 졸업 도입 시 `status = 'active'` 조건 추가)*
2. **채점**: 클로즈 빈칸 클릭 → 정답 노출 → `'헷갈렸어요'`(`unsure`) / `'알고 있었어요'`(`know`).
3. **박스 갱신** (`grade`):
   - 정답(`know`): `box = min(box + 1, 5)`, `next_review = now + BOX_INTERVAL_DAYS[box]`
   - 오답(`unsure`): `box = 1`, `next_review = now` → **같은 세션에 다시 등장**(방금 틀린 카드를 한 번 더 강화)
   - 공통: `last_reviewed_at = now`
4. **박스별 간격(일)**: box2=3, box3=7, box4=16, box5=35. box1은 즉시 재등장이라 스케줄에 쓰이지 않는다.
5. **새 카드**: `box=1`, `next_review=now` → 생성 즉시 큐에 노출.

## 불변식 (invariants)

- 카드의 `phrase`는 비어 있지 않다. `[ ]` 안의 core가 공백뿐이면 카드 생성이 거부된다.
- 원문에 `[ ]`는 정확히 하나 (1문장 1표현).
- `box`는 항상 1~5. `grade`가 상한 5로 캡한다.
- `next_review`는 항상 존재한다(신규 카드는 `now`).

## 핵심 로직 (순수 TS 함수)

문장 파싱·대괄호 삽입·Leitner 계산은 부수효과 없는 순수 함수로 이미 뽑아 뒀다. `lib/`에 두고 훅/컴포넌트에서 재사용한다.

- `parseSentence(raw)` → 첫 `[...]`를 찾아 `{ before, phrase, after }`로 분리. 대괄호가 없거나 표현이 비면 `null`.
- `wrapSelectionAsPhrase(value, start, end)` → 선택 구간을 `[ ]`로 감싼 새 값 + 커서 위치 반환. 선택이 없거나 core가 비었거나 이미 대괄호가 있으면 `null`. **1문장 1표현 제약을 여기서 강제**하며, 선택 구간 앞뒤 공백은 보존하고 core에만 대괄호를 씌운다.
- `BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35]` — index = box(1~5), 0번은 미사용 자리.
- `grade(card, knew, now)` → 정답이면 box +1(최대 5) 후 `next_review = now + 간격`, 오답이면 `box=1` + `next_review = now`.
  - ⚠️ **원본 아티팩트는 오답도 `now + 간격`으로 계산**한다. 오답을 같은 세션에 재등장시키기로 결정했으므로, 오답 분기의 `next_review`를 `now`로 바꾸는 수정이 필요하다.
- `isDue(card, now)` → `next_review <= now` 여부. 복습 큐 필터에 사용.
