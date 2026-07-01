# Task & Project Management API

A backend-only REST API for managing projects, tasks, and comments. Built
with NestJS — no frontend included; consume it via Swagger/Postman or
your own client.

## Domain model

```
User
 └── owns many Projects
      └── has many Tasks
           ├── assigned to a User
           └── has many Comments
                └── written by a User
```

- **Project** — name, description, owned by a User
- **Task** — title, description, status (`TODO` | `PENDING` | `DONE`),
  priority (`low` | `medium` | `high`), belongs to a Project, optionally
  assigned to a User
- **Comment** — content, belongs to a Task, written by a User

## Tech stack

- [NestJS](https://nestjs.com/) — Node.js framework, Express adapter
- [Prisma](https://www.prisma.io/) — ORM
- [PostgreSQL](https://www.postgresql.org/) — database
- [Better Auth](https://www.better-auth.com/) — authentication
  (email + password, session-based)
- [Arcjet](https://arcjet.com/) — rate limiting / bot protection / security
- [Biome](https://biomejs.dev/) — linting and formatting
- Husky + commitlint — git hooks, conventional commit enforcement

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A running PostgreSQL instance

### Setup

```bash
bun install
cp .env.example .env   # fill in DATABASE_URL and auth secret
bunx prisma migrate dev
bun run start:dev
```

The API will be available at `http://localhost:3000`.

### Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `bun run start:dev`  | Start in watch mode              |
| `bun run build`      | Compile to `dist/`               |
| `bun run start:prod` | Run the compiled build           |
| `bun run lint`       | Check lint/format issues (Biome) |
| `bun run lint:fix`   | Auto-fix lint/format issues      |
| `bun run test`       | Run unit tests                   |
| `bun run test:e2e`   | Run end-to-end tests             |
| `bun run typecheck`  | Type-check without emitting      |

## Deployment

> Full steps in [`DEPLOYMENT.md`](./DEPLOYMENT.md)

Push to `main` → GitHub Actions builds the Docker image, pushes to GHCR, then triggers Render to pull and deploy.

### Live Demo

- **API**: [taskforge-api-9i9h.onrender.com](https://taskforge-api-9i9h.onrender.com)
- **Swagger Docs**: [taskforge-api-9i9h.onrender.com/docs](https://taskforge-api-9i9h.onrender.com/docs)

> **Note:** Hosted on Render's free tier — the service sleeps after 15 minutes of inactivity. If the first request hangs, it's waking up (~30 seconds). Just wait and retry.

## API documentation

Swagger UI is available at `/docs` once the server is running.

## License

MIT — see [LICENSE](LICENSE).
