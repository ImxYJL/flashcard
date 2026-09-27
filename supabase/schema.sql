-- flashcard 스키마
-- Supabase SQL Editor에서 실행. 소유자 UID 고정 RLS.
-- 참고: docs/DOMAIN.md, docs/ARCHITECTURE.md
-- ⚠️ 아래 OWNER_UUID_HERE를 본인 auth.uid()로 바꿔서 실행하세요.

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  before text not null default '',
  phrase text not null check (length(btrim(phrase)) > 0),  -- 불변식: 표현은 비지 않음
  after text not null default '',
  category text not null,                 -- 'phrasal-verb' | 'vocab' (검증은 앱 TS 상수 → DB check 없음)
  tags text[] not null default '{}',      -- 다중 성격 라벨 (UI는 v2)
  box int not null default 1 check (box between 1 and 5),
  next_review timestamptz not null default now(),
  created_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  is_favorite boolean not null default false
);

-- RLS: 소유자 UID 고정
alter table public.cards enable row level security;

create policy "owner only"
  on public.cards for all
  using (auth.uid() = 'OWNER_UUID_HERE')
  with check (auth.uid() = 'OWNER_UUID_HERE');

-- ── 기존 테이블에 나중에 컬럼 추가할 때 ──
-- 즐겨찾기: alter table public.cards add column is_favorite boolean not null default false;

-- [v2] review_events (잔디) — 잔디 기능 붙일 때 추가
-- create table public.review_events ( ... );
