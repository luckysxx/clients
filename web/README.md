# clients/web

Web client workspace for the Monorepo migration.

Current status:

- `user-platform` now lives in `apps/user-platform`.
- `go-note` now lives in `apps/go-note`.
- Shared capabilities have started moving into `packages/types`, `packages/shared`, `packages/request`, and `packages/auth`.
- Legacy directories `user-platform/view`, `go-note/view`, and `frontend_app` have been removed from the active workspace.

Planned next steps:

1. Continue consolidating existing auth and request flows.
2. Continue hardening the shared package boundaries.
3. Keep `go-chat` as a reserved scaffold until a real business requirement arrives.

Workspace commands:

```sh
pnpm install
pnpm dev:user-platform
pnpm dev:go-note
pnpm build
pnpm lint
pnpm type-check
```

Note:

- `dev:user-platform` and `dev:go-note` target the only active Web apps in this workspace.
- `go-chat` remains a reserved scaffold and is intentionally not part of the current migration focus.
