# Memory — Swagger, Global Exception Filter, Negative Tests, Layer 3 cleanup

Last updated: 2026-06-30

## What was built

- **Swagger documentation** — `@nestjs/swagger@11.4.5` installed. `DocumentBuilder` + `SwaggerModule.setup("docs", ...)` in `main.ts`. `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth` on all 4 controllers. `@ApiProperty` / `@ApiPropertyOptional` on all DTOs. Bearer auth button in Swagger UI.
- **Barrel file for Prisma** — `src/common/prisma.ts` exports `Prisma` + `PrismaClient` from generated path. Used by the exception filter.
- **Global exception filter** — `src/common/filters/all-exceptions.filter.ts` with proper `instanceof Prisma.PrismaClientKnownRequestError` type guard. Handles HttpExceptions, Prisma P2002/P2025, validation error shapes, with `Logger` for unhandled errors.
- **Bearer auth plugin** — `bearer()` from `better-auth/plugins/bearer` added to `auth.config.ts`. Login now returns `set-auth-token` header for Swagger use.
- **Negative ownership tests** — `canAccessTask` test block added to `task.service.spec.ts` (4 tests: admin bypass, own task, other's task → ForbiddenException, missing → NotFoundException).
- **Layer 3 polish** — Removed unused `:userId` param from `unassign` route in `task.controller.ts`. Formatted long import line in `task.service.ts`.

## Decisions made

- **Swagger auth is Bearer, not cookie** — Better Auth's `bearer()` plugin enables `Authorization: Bearer <session_token>`. The token comes from `set-auth-token` header on login. Cookie auth for Swagger UI was unreliable with HttpOnly cookies.
- **Exception filter uses barrel import** — `src/common/prisma.ts` re-exports from the generated path to avoid fragile relative paths everywhere.
- **`canAccessTask` is the single access gate** — used by `CommentService` to check task access before allowing comment reads/writes. All negative edge cases (non-admin accessing other's task, missing task) are now tested directly.

## Problems solved

- Swagger Authorize button didn't work with cookies (HttpOnly). Switched to Bearer plugin — token from login response, paste into Swagger.
- Exception filter had type safety hole (`as PrismaClientError`) and no logging. Fixed with `instanceof Prisma.PrismaClientKnownRequestError` + `Logger`.
- `canAccessTask` was only tested through mocks in CommentService, never directly. Added 4 tests in TaskService spec.
- Unused route parameter `:userId` in `DELETE /:id/assign/:userId` confused the API surface.

## Current state

- All 7 modules built (User, Project, Task, Comment, Auth, Database, Arcjet)
- Swagger at `/docs` with full endpoint descriptions and DTOs
- Global exception filter handles all error shapes consistently
- `bearer()` plugin enabled — login returns `set-auth-token`
- 74/74 tests pass, build clean
- PLAN.md fully checked except `scope` items (no pagination, soft-delete, etc.)

## Next session starts with

- `/remember restore` (required first action)
- Nothing urgent — codebase is in a complete, tested state. Possible next steps: pagination, soft-delete, or deployment setup.

## Open questions

- None currently.
