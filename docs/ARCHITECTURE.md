# 아키텍처

앱의 인증·데이터 접근·상태 관리·폴더 구조. 도메인 규칙은 [DOMAIN](./DOMAIN.md), 기능 범위는 [ROADMAP](./ROADMAP.md) 참고.

## 스택

- **Next.js (App Router)** — 전 라우트 클라이언트 컴포넌트(`'use client'`), SSR 미사용
- **TypeScript + Tailwind CSS v4** (CSS 기반 설정, `src/app/globals.css`의 `@theme`/토큰)
- **Supabase** (`@supabase/supabase-js`) — Postgres + Auth. 전 클라이언트라 브라우저 클라이언트만 사용(localStorage 세션). SSR 붙이면 그때 `@supabase/ssr` + `proxy.ts` 도입
- **React Query** (`@tanstack/react-query`) — 서버 상태
- **react-hook-form** — 폼 (검증이 가벼워 zod는 안 씀; `register` + 인라인 룰)
- **shadcn/ui** (radix-nova 스타일, radix + tailwind) — 컴포넌트를 `src/components/ui/`로 복사해 소유·restyle. `cn` 유틸(`src/lib/utils.ts`), 아이콘은 lucide
- **Vercel** 배포
- 레포: **public**

> shadcn `Form` 래퍼(FormField/FormMessage)는 도입하지 않는다 — 검증이 가벼워 rhf `register` + shadcn 프리미티브(input/select/textarea)를 직접 쓰는 편이 단순하다. phrase 입력 필드만 커서/대괄호 조작 때문에 controlled로 다룬다.

## 인증 & 접근 제어

- Supabase Auth의 **Google OAuth 하나만** 사용 (이메일/비번 없음). 로그인 안 하면 앱 접근 불가.
- 레포가 public이라 배포 URL이 사실상 공개된다고 가정 — **URL 비공개 전략에 의존하지 않는다.**
- **단일 소유자 전제**: 로그인 자체는 누구나 가능하지만, RLS 정책에서 소유자 UID를 하드코딩해 그 외 사용자는 읽기/쓰기 모두 차단한다.

```sql
-- 예시: cards 테이블 정책
create policy "owner only"
  on cards for all
  using (auth.uid() = 'OWNER_UUID_HERE')
  with check (auth.uid() = 'OWNER_UUID_HERE');
```

범용 멀티테넌트 정책(`auth.uid() = user_id`)이 아니라, 실제로 단일 사용자 앱이므로 소유자 UID 고정 방식으로 간다. 모든 테이블에 동일 정책을 적용한다.

### 클라이언트 구현

- `src/lib/supabase/client.ts` — `createClient`(supabase-js) 브라우저 싱글턴. `persistSession`(localStorage) + `detectSessionInUrl`로 OAuth 복귀를 자동 처리(콜백 라우트·proxy 불필요).
- `src/lib/supabase/auth.ts` — `signInWithGoogle()`(redirectTo `/`), `signOut()`.
- 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (공개값, `.env.local` / 템플릿은 `.env.example`).
- **소유자 UID 확보 절차**: 앱에서 구글 로그인 1회 → 홈 화면에 표시되는 `user.id`(또는 Supabase 대시보드 Users)를 복사 → RLS 정책의 `OWNER_UUID_HERE`에 넣는다.

## 데이터 접근 아키텍처

- 컴포넌트는 Supabase를 **직접 호출하지 않는다.** 커스텀 훅으로 감싸서 쓴다 (`useCards`, `useGradeCard`, v2의 `useFavoriteCard` 등).
- 내부적으로 **React Query + Supabase client SDK**.
- 이렇게 두면 추후 서버 로직(AI 연동 등)이 필요해질 때 **훅 내부만 교체**하면 되고 컴포넌트는 안 건드린다.

## 상태 관리

- 전역 상태 라이브러리 없음
- **서버 상태**: React Query
- **UI 상태**: 지역 `useState` 또는 URL 쿼리 파라미터 (필터 등)

## 디자인 시스템

레퍼런스: "everyday conversations" 카드덱 무드 — 크림 배경 + 웜 블랙 텍스트 + 파스텔 4색 + 오렌지 포인트, 큰 라운드/넉넉한 여백. 색은 **하드코딩하지 않고 토큰 뒤로 숨겨** 리팩토링에 열어둔다.

### 2층 토큰 구조 (`src/app/globals.css`)

1. **전역 테마 층** (다크모드 같은 전체 커스텀) — shadcn CSS 변수(`--background`, `--foreground`, `--card` …)를 크림/웜블랙으로 재튜닝. 새 테마는 `[data-theme]`/`.dark` 블록 추가로 확장. 스위처 UI는 나중(v2), 지금은 토큰만 열어둠.
2. **카드 액센트 팔레트 층** — `--pastel-sage/-blue/-pink/-lavender`(카드 배경 4색) + `--brand`/`--brand-foreground`(오렌지 포인트). `@theme inline`으로 `bg-pastel-*`, `bg-brand`, `text-brand-foreground` 유틸 생성.

### 카드 색 선택 (`src/lib/card-color.ts`)

- `CARD_COLORS` / `pickCardColor()` — **기본 전략: 볼 때마다 랜덤**. 컴포넌트(`CardSurface`)는 마운트 시 1회만 뽑아 그 화면 동안 고정(리렌더 깜빡임 방지), 카드가 다시 나타나면 새 색.
- ⭐️ **교체 지점**: `pickCardColor` 본문만 바꾸면 "카드별 고정(id 해시)" 또는 "카테고리별" 로 전환 가능. 컴포넌트 불변.

### 공통 컴포넌트

- `components/ui/` — shadcn 프리미티브 (button/input/textarea/select/dialog/label)
- `components/common/CardSurface.tsx` — 파스텔 라운드 카드 서피스 (color prop 미지정 시 랜덤)
- `components/common/Badge.tsx` — 오렌지 알약 배지 (tags 표시용, v2)

## 폴더 구조

> App Router 기준. 라우트는 `src/app/`에 두고, 그 외 코드는 `src/` 하위 폴더로 분리한다(`@/*` → `src/*` alias). 라우트 전용 컴포넌트는 해당 route 폴더에 `_components/`로 콜로케이션(Next private folder — 언더스코어 폴더는 라우팅에서 제외됨). `[v2]` 표시는 해당 기능을 붙일 때 생기는 것.

```
src/
├── app/                   # Next App Router: 라우트 + 레이아웃 (routing 전용)
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈 진입
│   ├── globals.css        # Tailwind 진입 + 테마 토큰
│   ├── review/page.tsx    # 복습 큐 (클로즈 + 채점)
│   ├── cards/page.tsx     # 카드 리스트 (v1: 리스트/수정/삭제, v2: 필터)
│   ├── favorites/page.tsx # [v2] 즐겨찾기 모아보기
│   └── dashboard/page.tsx # [v2] 잔디 히트맵
│
├── types/                 # ⭐️ 순수 핵심 도메인 엔티티 타입
│   ├── card.ts            # Card, Category('phrasal-verb'|'vocab'), CardStatus
│   └── review.ts          # ReviewEvent, ReviewResult('know'|'unsure')
│
├── services/              # Supabase 접근 함수 + ⭐️ Req/Res 타입 같이 선언
│   ├── cardService.ts     # (GetCardsReq/Res, GradeCardReq 등 포함)
│   └── reviewService.ts   # review_events 기록 + 잔디 집계 RPC 호출
│
├── queries/               # TanStack Query 훅 모음 (컴포넌트는 Supabase 직접 호출 X)
│   ├── useCards.ts        # useCards / useGradeCard (v2: useFavoriteCard 등)
│   ├── useReviewHeatmap.ts  # [v2] 잔디
│   └── queryKeys.ts       # 쿼리키 상수화
│
├── components/            # UI
│   ├── ui/                # shadcn/ui 프리미티브 (button, dialog, input, select, textarea, label …)
│   ├── common/            # 프로젝트 공통 컴포넌트
│   └── layout/            # Header, Sidebar 등
│
└── lib/                   # utils.ts(cn), + sentence parsing(parseSentence/wrapSelectionAsPhrase),
                           # leitner(grade/isDue), supabase client 등
```

코드 컨벤션(네이밍, 타입, 훅 사용 규칙)은 [CONVENTIONS](./CONVENTIONS.md) 참고.
