# PLAN

### 0. Project setup

- [x] `nest new` project scaffolded, Express adapter confirmed
- [x] Bun installed, replacing npm as the package manager
- [x] Biome installed, replacing ESLint/Prettier
- [x] Husky + commitlint configured
- [x] GitHub Actions: CI (lint/typecheck/test), CodeQL, auto-target-develop

### 1. Database setup (`src/lib/database/`)

- [x] Prisma installed and connected to a local Postgres DB
- [x] `prisma.module.ts` + `prisma.service.ts` created, marked `@Global()`,
      imported once in `AppModule`
- [x] `.env` + `ConfigModule` wired for DB connection string, auth secret
- [x] Prisma schema split into multi-file structure (`prisma/models/`)
- [x] Joi validation schema in `src/lib/config/env.config.ts` — validates all
      env vars at boot with clear error messages

### 2. Auth module (`src/module/auth/`) — Better Auth

- [x] `better-auth` + `@thallesp/nestjs-better-auth` installed
- [x] Better Auth config (`auth.config.ts`) — Prisma adapter, email+password
      enabled
- [x] `npx @better-auth/cli generate` run — user/session/account/
      verification models added to `schema.prisma`
- [x] `AuthModule.forRoot({ auth })` registered in `AppModule`
- [x] `bodyParser: false` set in `main.ts` (required by Better Auth)
- [x] Public routes marked with `@Public()` / `@AllowAnonymous()` as needed
- [x] `@Session()` used to pull current user off request — no custom
      `@CurrentUser()` decorator needed, Better Auth provides this

### 3. Project module (`src/module/projects/`)

- [ ] `POST /projects` — creates project owned by current user
- [ ] `GET /projects` — lists only the current user's projects, paginated
- [ ] `GET /projects/:id` — ownership check before returning
- [ ] `PATCH /projects/:id` — ownership check before updating
- [ ] `DELETE /projects/:id` — ownership check before deleting

### 4. Task module (`src/module/tasks/`)

- [ ] `POST /projects/:id/tasks` — creates task under a project the user owns
- [ ] `GET /projects/:id/tasks` — paginated, filterable by `status`,
      `priority`, `assigneeId`
- [ ] `GET /tasks/:id` — ownership/assignment check before returning
- [ ] `PATCH /tasks/:id` — ownership/assignment check before updating
- [ ] `DELETE /tasks/:id` — ownership check before deleting
- [ ] Status and priority validated against enums, not free-text

### 5. Comment module (`src/module/comments/`)

- [ ] `POST /tasks/:id/comments` — author is always the current user
- [ ] `GET /tasks/:id/comments` — paginated
- [ ] `DELETE /comments/:id` — only the author (or task/project owner) can
      delete

### 6. Cross-cutting

- [x] Arcjet wired in for rate limiting / bot protection
- [x] Zero `process.env` references in `src/` — all config resolved through
      `ConfigService` with constructor injection
- [x] Global exception filter in `src/common/` — consistent error shape
- [x] Global validation pipe (`whitelist: true`, `forbidNonWhitelisted: true`)
- [x] Response interceptor (if needed) for consistent envelope shape
- [ ] Swagger fully describes every DTO, every endpoint, every response

### 7. Before calling it done

- [ ] Every endpoint manually tested via Swagger UI
- [ ] Every ownership check has a negative test (user A cannot touch user B's data)
- [ ] `/review` run against the finished feature set

---

## Infrastructure notes (decisions locked)

- **Env validation**: Joi with `validationSchema` in `ConfigModule.forRoot` (NestJS docs primary approach).
  Validates at boot, throws clear error on missing/invalid vars.
- **Config access**: `ConfigService` from `@nestjs/config` injected via constructor — never
  `process.env` in application code. Exceptions: none remaining.
- **Arcjet**: `ArcjetModule.forRootAsync` with `useFactory` + `inject: [ConfigService]`.
- **Better Auth**: `AuthModule.forRootAsync` with `useFactory` + `inject: [PrismaService]`.
  Shares the same PrismaClient instance as the app — no double connection pool.
- **Prisma schema**: Multi-file in `prisma/models/` — `user.prisma`, `project.prisma`,
  `task.prisma`, `comment.prisma`, `auth.prisma`.
- **Schema config**: `prisma.config.ts` sets `schema: "prisma/"` so CLI discovers all
  `.prisma` files including subdirectories.
