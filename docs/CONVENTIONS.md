# Code Conventions

## TypeScript

- Prefer `type` over `interface` unless extending or declaration merging is explicitly needed
- Avoid `any`; use `unknown` and narrow the type explicitly

## Functions & Variables

- Prefer arrow functions for components and utility functions
- Use `const` by default; use `let` only when reassignment is necessary
- Non-primitive or module-level fixed constants should be declared in `UPPER_SNAKE_CASE`

## Naming

- Use camelCase for variables, functions, and object keys
- Arrays in JS/TS: use plural with `-s` suffix (e.g. `users`, `items`)
- Arrays as React components: use `List` suffix (e.g. `UserList`, `ItemList`)
- Literal constants (magic numbers, fixed config values): use `UPPER_SNAKE_CASE` (e.g. `TIMER_COUNT`, `MAX_RETRY`)
- Avoid abbreviations unless universally understood (e.g. `id`, `url`)
- API 요청/응답 타입 접미사는 `Req`/`Res` 약어를 쓴다 (`GetAppraisalsRes`) — 위 약어 규칙의 예외
- 배열 아이템 타입은 따로 구분해야 할 때만 `-Item` 접미사나 `도메인[]`으로 잡는다. 이미 이름이 있는 응답 타입을 그대로 쓸 수 있으면 굳이 만들지 않음
- 백엔드 스키마명의 `Admin` 접두사는 떼고 쓴다 — 이 레포는 관리자 API만 사용해 충돌이 없음 (`AdminAppraisalResponse` → `AppraisalRes`)
- Custom boolean flags: prefix with `is`/`has` (e.g. `isCurrent`, `isVisible`, `hasError`). Exception: props that mirror a native HTML/React attribute (`disabled`, `loading`, `checked`, `readOnly` 등)는 관용적으로 접두사 없이 그대로 사용

## React & Hooks

- Avoid unnecessary `useCallback` or `useMemo` wrappers
- Apply `useCallback` / `useMemo` only for expensive computations, dependencies of other hooks, or performance-critical props passed to `React.memo` components
- Use named exports for components (`export const Button = ...`), not `export default`. Keeps renames/refactors traceable and works cleanly with barrel (`index.ts`) re-exports.