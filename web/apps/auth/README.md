# @clients/app-auth

GoChat 统一认证前端应用。

当前状态：

- 承接登录页、注册页和 SSO 授权页
- 对外仍保持 GoChat 品牌语义
- 生产环境部署名为 `auth-web`，挂载在 `app.luckys-dev.com/auth/*`
- 通过 `@clients/shared` 读取 `api-gateway` 下发的运行时配置

本地开发：

```sh
pnpm dev:auth
```

当前包含的主要能力：

- 账号密码登录
- 注册并自动登录
- SSO popup / iframe 授权页
- 登录后跳回 `go-chat` 业务前端
