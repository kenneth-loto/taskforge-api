# PLAN

### 0. Project setup

- [x] `nest new` project scaffolded, Express adapter confirmed
- [x] Bun installed, replacing npm as the package manager
- [x] Biome installed, replacing ESLint/Prettier
- [x] Husky + commitlint configured
- [x] GitHub Actions: CI (lint/typecheck/test), CodeQL, auto-target-develop

### 1. Database setup (`src/lib/database/`)

- [ ] Prisma installed and connected to a local Postgres DB
- [ ] `prisma.module.ts` + `prisma.service.ts` created, marked `@Global()`,
      imported once in `AppModule`
- [ ] `.env` + `ConfigModule` wired for DB connection string, auth secret

### 2. Auth module (`src/module/auth/`) — Better Auth

- [ ] `better-auth` + `@thallesp/nestjs-better-auth` installed
- [ ] Better Auth config (`auth.config.ts`) — Prisma adapter, email+password
      enabled
- [ ] `npx @better-auth/cli generate` run — user/session/account/
      verification models added to `schema.prisma`
- [ ] `AuthModule.forRoot({ auth })` registered in `AppModule`
- [ ] `bodyParser: false` set in `main.ts` (required by Better Auth)
- [ ] Public routes marked with `@Public()` / `@AllowAnonymous()` as needed
- [ ] `@Session()` used to pull current user off request — no custom
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

- [ ] Global exception filter in `src/common/` — consistent error shape
- [ ] Global validation pipe (`whitelist: true`, `forbidNonWhitelisted: true`)
- [ ] Arcjet wired in for rate limiting / bot protection
- [ ] Response interceptor (if needed) for consistent envelope shape
- [ ] Swagger fully describes every DTO, every endpoint, every response

### 7. Before calling it done

- [ ] Every endpoint manually tested via Swagger UI
- [ ] Every ownership check has a negative test (user A cannot touch user B's data)
- [ ] `/review` run against the finished feature set
