# AGENTS.md

## Project
Go 1.27 web service for file sharing (gin + pgx + postgres + JWT). Early-stage: only auth (register/login) is wired end-to-end; file/share handlers aren't registered yet. Active branch: `dev` (working default, PRs target it).

## Build & verify
- No Makefile. `go build ./...` and `go vet ./...` are the verification commands.
- No tests exist anywhere (`**/*_test.go` is empty). Don't assume a test framework.

## Architecture (port-adapter/clean layering)
- `internal/domain/` — entities + repository interfaces + sentinel errors (`user.ErrNotFound`, `ErrConflict`).
- `internal/application/` — use cases depending on domain interfaces only.
- `internal/infrastructure/` — postgres repos + security (bcrypt, JWT).
- `internal/delivery/http/` — gin router, handlers, middleware.
- `cmd/main.go` — manual wiring (constructor injection) of every layer. There is NO DI framework/wire tool; new use cases must be constructed by hand in main.go.
- Domain entities/responses use the Go stdlib `uuid.UUID`.

## Gotchas an agent will hit
- `import "uuid"` is the **Go 1.27 standard library** package, NOT a third-party dep (it's not in `go.mod`). Do not add `github.com/google/uuid` or a replace directive.
- The login handler AND its route both use the typo `Loign` (compiles consistently). Don't "fix" to `Login` unless also updating both.
- `config/load.go` logs `"No ..env file found"` (typo, cosmetic only).
- `UserRepository.FindByUsername` and `Create` can return a non-nil value/error inconsistently in edge cases (e.g. `return err` path); sentinel errors are compared with `errors.Is`.

## Database / env
- Postgres + migrations run via `docker-compose.yml` (`postgres` and `migrate` services using the `migrate/migrate` image). Start with `docker compose up`.
- `.env` is gitignored and required to run. `.env.example` is **stale**: it only lists POSTGRES vars, but the real `.env` also needs `POSTGRES_HOST`, `POSTGRES_SSLMODE`, `JWT_SECRET`, `JWT_EXPIRE` (parsed via `caarlos0/env` with `envPrefix` in `internal/config`). Mistmatch here = runtime parse/ping failures.
- Server hardcodes `router.Run("localhost:8080")` in main.go.

## Current WIP
- `migrations/000002` & `000003` have uncommitted changes on `dev` (files/shares tables + FKs/indexes). Don't assume they're settled.
