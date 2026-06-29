# Memory — User Module + Common Infrastructure + Arcjet Extraction

Last updated: 2026-06-29

## What was built

- **User module** — `src/module/user/` with controller, service, module.
  `GET /user/all` with `@Roles('ADMIN')`, `GET /user/:id` with `NotFoundException`.
  Uses custom `RolesGuard` + `@Roles()` decorator from `src/common/`.

- **Common infrastructure** — `src/common/` per AGENTS.md standard:
  - `decorators/roles.decorator.ts` — custom `@Roles(...)` decorator
  - `decorators/response-message.decorator.ts` — `@ResponseMessage()` for interceptors
  - `guards/roles.guard.ts` — reads `'roles'` metadata from reflector, checks `req.user.role`
  - `interceptors/transform.interceptor.ts` — wraps responses in `{ statusCode, message, data }`
  - `types/express.d.ts` — augments `Express.User` and `Express.Request`

- **Arcjet security module** — extracted from inline `AppModule` to `src/lib/security/arcjet.module.ts`.
  Uses `forRootAsync` with `ConfigService` (no `process.env` assertions).

## Changes from original

| Area | Before | After |
|------|--------|-------|
| `src/module/` | Did not exist | `user/` module with 2 endpoints |
| `src/common/` | Did not exist | Decorators, guards, interceptors, types |
| `src/app.module.ts` | Inline Arcjet config, bodyParser in Auth, ArcjetGuard APP_GUARD | Arcjet extracted to own module, no bodyParser, no ArcjetGuard in AppModule |
| `src/lib/security/` | Did not exist | `arcjet.module.ts` with forRootAsync |
| `src/main.ts` | Simple bootstrap, no pipes/interceptors | Global TransformInterceptor, ValidationPipe with `{ message, errors }` format |
| `prisma.service.ts` | ConfigService injection, no OnModuleDestroy | ConfigService.getOrThrow, OnModuleDestroy with Logger, startup/shutdown logs |
| `prisma.config.ts` | `process.env.DATABASE_URL` with `!` | Runtime guard with explicit throw |
| `env.config.ts` | PORT default 3000 | PORT default 8080 |
| `tsconfig.json` | Basic | Added `resolvePackageJsonExports`, `isolatedModules` |
| `nest-cli.json` | deleteOutDir only | Unchanged (back to tsc) |

## Decisions made

- **No path aliases** — `nest build` uses `tsc` which doesn't transform `paths` in JS output.
  All imports use relative paths with `.js` extensions (required by `module: nodenext`).
- **Custom RolesGuard over library** — Built `RolesGuard` in `common/` instead of relying on
  `@thallesp/nestjs-better-auth`'s `AuthGuard` for role checking. The global `AuthGuard`
  (registered as `APP_GUARD` by `AuthModule.forRootAsync`) handles authentication only.
- **Arcjet with forRootAsync** — Uses `ConfigService.getOrThrow` instead of `process.env` assertions.
- **Prisma with ConfigService** — Injects `ConfigService` for `DATABASE_URL`, no `!` assertions.

## Current state

- User module works with RolesGuard + custom @Roles for admin protection
- Arcjet module extracted and using DI for config
- Global TransformInterceptor wraps all responses
- ValidationPipe catches NestJS controller validation (whitelist, forbidNonWhitelisted)
- `@nestjs/mapped-types`, `@swc/cli`, `@swc/core` removed (no longer needed)
- DTOs removed (no create/update endpoints yet)
- All imports are relative with .js extensions

## Next session starts with

- `/remember restore` (required first action)
- Add create/update/delete user endpoints with DTOs, or
- Start on Project module per the original backlog

## Open questions

- Better-auth signup validation error format (`[body.email]` prefix) is baked into better-call's validator and can't be customized without the now-removed middleware approach
