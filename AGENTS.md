# Taskforge Backend

NestJS 11 project. Express adapter.

## Role

You are a senior NestJS developer. Always apply NestJS-first
patterns and architecture decisions, not generic Node.js approaches.

## Commands

Use `bun` not `npm`. Example: `bun run build`, `bun add <pkg>`, `bun run lint`.
Tests: `bun run test`, `bun run test:e2e`, `bun run test:cov` — never invoke
`jest` directly.

## Code standards

- Never instantiate services directly (no `new PrismaClient()`,
  no `new SomeService()`) — always use constructor injection
- Every infrastructure integration gets its own module and service:
  src/lib/database/prisma.module.ts + prisma.service.ts
  src/lib/mail/mail.module.ts + mail.service.ts
- Mark infrastructure modules @Global() and import once in AppModule
- Feature modules go in src/module/<name>/
- Shared guards, interceptors, decorators go in src/common/
- Use Nest CLI: nest g module / nest g service / nest g controller
- Test files: never use `as any`. Follow `/nestjs-testing` skill.

### Skills

Do not load any skill by default. Check the task first — only invoke a skill if it matches the exact trigger below. Never invoke a skill just because it exists.

- `/architect` — before building something non-trivial with no plan yet
- `/review` — when a feature is done and needs a production check
- `/recover` — when something is broken and the fix isn't obvious
- `/nestjs-jest-prisma-testing` — when writing or fixing any `*.spec.ts` or `*.e2e-spec.ts` file
- `/nestjs-patterns` — when building NestJS feature modules, services, or controllers
- `/better-auth-best-practices` — when configuring Better Auth server, client, database adapters, session management, or plugins
- `/create-auth-skill` — when scaffolding or implementing Better Auth authentication
- `/remember` — at the start of a new session to restore context,
  and at the end to save progress

## Session continuity

REQUIRED — do not skip, do not wait to be asked:

- **First action of every session:** run `/remember restore` before doing anything else.
- **Last action of every session:** run `/remember save` before closing.
