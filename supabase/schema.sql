-- flashcard 스키마 (v1)
-- Supabase SQL Editor에서 실행. 소유자 UID 고정 RLS.
-- 참고: docs/DOMAIN.md, docs/ARCHITECTURE.md

-- cards 테이블
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
  last_reviewed_at timestamptz
);

-- RLS: 소유자 UID 고정
alter table public.cards enable row level security;

create policy "owner only"
  on public.cards for all
  using (auth.uid() = 'ff9e60da-106c-45f8-9c21-681c99480dfa')
  with check (auth.uid() = 'ff9e60da-106c-45f8-9c21-681c99480dfa');

-- [v2] review_events (잔디) — 잔디 기능 붙일 때 추가
-- create table public.review_events ( ... );
