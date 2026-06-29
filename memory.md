# Memory — Config & Schema Refactor

Last updated: 2026-06-29

## What was built

- **Prisma multi-file schema**: Split `prisma/schema.prisma` into `prisma/models/{user,project,task,comment,auth}.prisma`.
  `schema.prisma` now holds only `generator` + `datasource` blocks. Updated `prisma.config.ts` to point `schema: "prisma/"`.
- **Env validation**: Created `src/lib/config/env.config.ts` with Joi schema for `DATABASE_URL`, `ARCJET_KEY`,
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `PORT`. Wired via `ConfigModule.forRoot({ validationSchema })`.
- **Arcjet async config**: Migrated from `ArcjetModule.forRoot({ key: process.env.ARCJET_KEY! })` to
  `ArcjetModule.forRootAsync({ useFactory, inject: [ConfigService] })`.
- **Auth async config**: Migrated from `AuthModule.forRoot({ auth })` (module-level instance) to
  `AuthModule.forRootAsync({ useFactory, inject: [PrismaService] })`. Refactored `auth.config.ts` from
  module-level `betterAuth()` call to `createAuth(prisma)` factory function.
- **ConfigService everywhere**: `PrismaService` now injects `ConfigService` for `DATABASE_URL`.
  `main.ts` uses `app.get(ConfigService)` for `PORT`. Zero `process.env` in `src/`.

## Decisions made

- **Joi over class-validator**: NestJS docs present Joi as the primary approach (`validationSchema` property).
  class-validator + custom `validate()` is the alternative. Stuck with Joi for doc-alignment.
- **forRootAsync over forRoot**: Both `@arcjet/nest` and `@thallesp/nestjs-better-auth` support `forRootAsync`,
  allowing config to flow through DI instead of `process.env`.
- **Shared PrismaClient**: `createAuth` accepts a `PrismaClient` argument instead of creating its own.
  Injects `PrismaService` (which `extends PrismaClient`) — one connection pool, not two.
- **getOrThrow + Joi**: Intentional defense in depth. Joi catches at boot, `getOrThrow` is runtime backstop.

## Problems solved

- **Double PrismaClient**: Auth module was creating its own `PrismaPg` adapter + `PrismaClient`, separate from
  `PrismaService`. Now shares the same instance via `inject: [PrismaService]`.
- **process.env in module definitions**: Arcjet and Auth modules required config at import time before DI
  existed. Both have `forRootAsync` — migrated both to the async pattern.
- **Env validation**: Previously using `class-validator` with a custom `validate()` function (alternative
  approach per NestJS docs). Replaced with Joi `validationSchema` (primary approach).

## Current state

- Schema split + validated. Config flows through DI. Zero `process.env` in application code.
- Arcjet and Auth modules use async factory patterns. All bootstrap-time DI constraints resolved.
- Next work items are feature modules: Projects, Tasks, Comments.

## Next session starts with

- `/remember restore` (required first action)
- Build Project module (`nest g module projects` in `src/module/`, then controller/service/DTOs)
- Or `/architect` if not yet clear on the approach

## Open questions

- None
