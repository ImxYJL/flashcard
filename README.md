# 구동사/단어 클로즈 복습 앱

구동사·단어를 문장 속 **클로즈(빈칸)** 로 만들어 Leitner 방식으로 주기 복습하는, Anki보다 단순한 개인용 영어 학습 플래시카드 앱.

- 문장을 붙여넣고 표현을 드래그하면 자동으로 빈칸 카드가 된다 (1문장 1표현).
- Leitner 5박스로 복습 간격을 관리한다 — 복잡한 SR 알고리즘은 쓰지 않는다.
- 단일 소유자 전제. Supabase Google OAuth + RLS로 본인만 읽고 쓴다.

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · React Query · Vercel

## 시작하기

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

Supabase 연결 등 환경 변수 설정이 별도로 필요하다.

## 문서

| 문서 | 내용 |
|---|---|
| [docs/DOMAIN.md](./docs/DOMAIN.md) | 도메인·데이터 모델, category/tags, Leitner 복습 규칙, 핵심 로직, 불변식 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 인증/RLS, 데이터 접근 아키텍처, 상태 관리, 폴더 구조 |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | 기능 범위 (v1 / v2 / 장기 백로그) |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | 코드 컨벤션 (네이밍, 타입, 훅) |
