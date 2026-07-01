# Memory — Code review session: NestJS patterns alignment

Last updated: 2026-07-01

## What was built

- **`@CurrentUser()` decorator** — `src/common/decorators/current-user.decorator.ts`. A `createParamDecorator` that extracts `req.user` and throws `UnauthorizedException` if absent. Returns fully-typed `Express.User`.
- **`@Public()` decorator** — `src/common/decorators/public.decorator.ts`. Metadata flag for routes that bypass the global `AuthGuard`.
- **`AuthGuard`** — `src/common/guards/auth.guard.ts`. Global guard checks `req.user` exists, skips for `@Public()` routes. Registered via `APP_GUARD` with `useExisting`.

## What was fixed

| Issue | Files |
|---|---|
| Filter/interceptor instantiated with `new` in `main.ts` — outside DI | `main.ts`, `app.module.ts` |
| `ArcjetOptionalGuard` not overridable in tests (`useFactory`) | `arcjet.module.ts` |
| `req.user!` assertions and repeated `if (!user) throw` in controllers | All 3 feature controllers → `@CurrentUser()` |
| `UpdateCommentDto` hand-written instead of `PartialType` | `update-comment.dto.ts` |
| `Record<string, unknown>` instead of `Prisma.TaskWhereInput` | `task.service.ts` |
| Tests casting mock `Request` objects via `as unknown` | 3 controller specs — now pass user directly |
| `ValidationPipe` missing `transform: true` | `main.ts` |
| `mockUser.role` missing `as const` | `user.service.spec.ts` |

## Decisions made

- **`@CurrentUser()` over `@Req()`** — eliminates non-null assertions (`!`) and repeated null checks. One decorator handles the unauthorized case for every handler. TypeScript infers `Express.User`, not `Express.User | undefined`.
- **Global AuthGuard + controller-level `@CurrentUser()`** — guard is defense-in-depth + `@Public()` mechanism. Decorator is for TypeScript type narrowing. Both coexist without conflict.
- **`useExisting` for all `APP_*` providers** — keeps guards/filters/interceptors visible in DI for test overrides.

## Current state

- All 5 code review issues fixed per `/nestjs-patterns` and `/nestjs-jest-prisma-testing` skills
- 81/81 tests pass, build clean
- No `as any` anywhere in test files
- All controllers use `@CurrentUser()` instead of `req.user`

## Next session starts with

- `/remember restore` (required first action)

## Open questions

- None
