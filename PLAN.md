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
      enabled, `bearer()` plugin for Bearer token support
- [x] `npx @better-auth/cli generate` run — user/session/account/
      verification models added to `schema.prisma`
- [x] `AuthModule.forRoot({ auth })` registered in `AppModule`
- [x] `bodyParser: false` set in `main.ts` (required by Better Auth)
- [x] Public routes marked with `@AllowAnonymous()` as needed
- [x] `@Session()` used to pull current user off request
- [x] `AuthGuard` registered globally by the module — all routes protected by default

### 3. Project module (`src/module/project/`)

- [x] `POST /projects` — admin only, creates project owned by current user
- [x] `GET /projects` — all authenticated users can list
- [x] `GET /projects/:id` — all authenticated users can read
- [x] `PATCH /projects/:id` — admin only
- [x] `DELETE /projects/:id` — admin only
- [x] Route-level `RolesGuard` + `@Roles("ADMIN")` on write operations
- [x] 70 tests pass across all modules

### 4. Task module (`src/module/task/`)

- [x] `POST /projects/:projectId/tasks` — admin only
- [x] `GET /projects/:projectId/tasks` — scoped: admin sees all, member sees only assigned
- [x] `GET /projects/:projectId/tasks/:id` — scoped: admin sees any, member sees only own
- [x] `PATCH /projects/:projectId/tasks/:id` — admin only
- [x] `DELETE /projects/:projectId/tasks/:id` — admin only
- [x] `POST /projects/:projectId/tasks/:id/assign/:userId` — admin only
- [x] `DELETE /projects/:projectId/tasks/:id/assign/:userId` — admin only
- [x] `ConflictException` on assign if task already has an assignee
- [x] Service-level `canAccessTask()` helper exported for cross-module use
- [x] Status and priority validated against enums (`TaskStatus`, `TaskPriority`)

### 5. Comment module (`src/module/comment/`)

- [x] `POST /projects/:projectId/tasks/:taskId/comments` — any user who can access the task
- [x] `GET /projects/:projectId/tasks/:taskId/comments` — scoped by task access
- [x] `GET /projects/:projectId/tasks/:taskId/comments/:id` — scoped by task access
- [x] `PATCH /projects/:projectId/tasks/:taskId/comments/:id` — author only
- [x] `DELETE /projects/:projectId/tasks/:taskId/comments/:id` — author or admin
- [x] No role guards on comment routes — authorization is service-level
- [x] Injects `TaskService` for `canAccessTask()` — one-way dependency, no cycle

### 6. Cross-cutting

- [x] Arcjet wired in for rate limiting / bot protection
- [x] Zero `process.env` references in `src/` — all config resolved through
      `ConfigService` with constructor injection
- [x] Global exception filter in `src/common/` — consistent error shape
- [x] Global validation pipe (`whitelist: true`, `forbidNonWhitelisted: true`)
- [x] Transform interceptor for consistent `{ statusCode, message, data }` envelope
- [x] Swagger fully describes every DTO, every endpoint, with Bearer auth

### 7. Before calling it done

- [x] Every endpoint manually tested via Swagger UI
- [x] Every ownership check has a negative test (user A cannot touch user B's data)
- [x] `/review` run against the finished feature set

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
- **Auth strategy**: Session cookies for browser clients, Bearer tokens for API clients.
  `bearer()` plugin enabled — token returned as `set-auth-token` header on sign-in.
- **Swagger**: Available at `/docs`. Click "Authorize" → paste Bearer token from login.
