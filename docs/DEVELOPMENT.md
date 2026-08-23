# UzMarket Development Rules

## Core principles

- Strong foundation.
- Simple interface.
- User trust.
- Do not overcomplicate early, but do not choose solutions that block future growth.
- Paid tools are allowed when useful, but critical architecture must remain replaceable.

## Development workflow

1. Start each stage from the latest `main`.
2. Use a dedicated branch for each stage or hardening task.
3. Inspect existing code before creating a new module, service, DTO, endpoint, table, or helper.
4. Do not duplicate existing or unfinished functionality.
5. If work is intentionally postponed, record it in `docs/DEFERRED-WORK.md`.
6. Do not develop directly on `main`.
7. Before commit and merge, run:
   - typecheck
   - lint
   - tests
   - build
   - migration checks when schema changes
8. Review the final diff before commit.
9. Push the stage branch and merge through a Pull Request only after CI passes.
10. After merge, update local `main` with `git fetch` and `git pull --ff-only`.

## Architecture rules

- Backend API must serve both web and mobile clients.
- Business rules and ownership checks belong on the server.
- Client input must not control protected fields such as ownership or lifecycle state.
- Prefer explicit, stable API contracts over exposing persistence internals.
- External providers should sit behind replaceable interfaces where lock-in would be costly.
- Do not introduce distributed infrastructure, queues, search engines, caches, or microservices before there is a real need.
- Design module boundaries so heavy parts can be extracted later without rewriting the whole marketplace.
- Prefer evolutionary replacement over full-system rewrites.

## Project memory

Before starting a new major stage:

1. Check the current code.
2. Check previous architectural decisions.
3. Check `docs/DEFERRED-WORK.md`.
4. Check whether the same functionality already exists or was started earlier.
5. Decide whether the deferred work is now due.

A stage is not complete only because the code compiles. It is complete when the intended behavior, tests, security rules, CI, and recorded deferred work are all in a consistent state.
