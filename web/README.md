# clients/web

Web client workspace for the active frontend apps.

Current status:

- `auth` lives in `apps/auth` and owns login, register, and SSO authorization pages.
- `go-note` lives in `apps/go-note`.
- `go-chat` lives in `apps/go-chat` and now只负责聊天业务界面。
- Shared capabilities are maintained in `packages/types`, `packages/shared`, `packages/request`, and `packages/auth`.
- Legacy directories `user-platform/view`, `go-note/view`, and `frontend_app` have been removed from the active workspace.

Workspace commands:

```sh
pnpm install
pnpm dev:auth
pnpm dev:go-note
pnpm dev:go-chat
pnpm build
pnpm lint
pnpm type-check
```

Note:

- `dev:auth`, `dev:go-note`, and `dev:go-chat` are the active Web app entry points.
- Cross-app runtime URLs are provided by `api-gateway` through `/api/v1/config/client`.
