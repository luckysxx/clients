# @clients/app-user-platform

`user-platform` 的 Web 前端应用，运行在 `clients/web` workspace 内。

当前职责：

- 提供注册、登录、账户相关页面
- 承载 SSO 入口与回跳前端逻辑
- 对接 `user-platform` 后端 API

---

## 依赖关系

主要依赖这些共享包：

- `@clients/auth`
- `@clients/request`
- `@clients/shared`
- `@clients/types`

运行时主要依赖：

- `vue`
- `vue-router`
- `pinia`

---

## 本地开发

在 `clients/web` 目录执行：

```sh
pnpm dev:user-platform
```

如果只在当前 app 目录下执行，也可以用：

```sh
pnpm dev
```

常用命令：

```sh
pnpm build
pnpm lint
pnpm type-check
```

---

## 主要路由

当前注册 / 登录相关页面包括：

- `/register`（兼容 `/`）
- `/login`

这个 app 适合作为统一账号体系、SSO 入口、用户资料相关页面的前端承载层。

---

## SSO 接入说明

注册接入示例：

```text
https://your-sso-domain/register?client_id=app_a&redirect_uri=https%3A%2F%2Fapp-a.com%2Fauth%2Fcallback&state=random_string
```

登录接入示例：

```text
https://your-sso-domain/login?client_id=app_a&redirect_uri=https%3A%2F%2Fapp-a.com%2Fauth%2Fcallback&state=random_string
```

常见参数：

- `client_id`：接入应用标识
- `redirect_uri`：成功后的回跳地址
- `state`：接入方自定义随机串

登录成功后，前端会把认证结果和 token 带回接入方。

---

## 后端对接

本地开发默认通过 Vite 代理把 `/api` 转发到：

- `http://localhost:8081`

如果要切到其他环境，可以通过 `.env` 中的 `VITE_API_BASE_URL` 覆盖。

---

## 维护建议

1. 用户中心自己的页面和视图逻辑，留在本 app 内
2. SSO、token、共享存储、通用类型等跨 app 能力，优先放进 `clients/web/packages/*`
3. 每次 SSO 流程、路由入口或 API 对接方式变化时，同步更新本 README
