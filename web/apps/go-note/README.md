# @clients/app-go-note

`go-note` 的 Web 前端应用，运行在 `clients/web` workspace 内。

当前职责：

- 提供笔记相关页面和交互
- 复用 workspace 里的共享鉴权、请求层和类型定义
- 通过前端路由承载登录后用户侧页面
- 接口对接说明见 [API.md](./API.md)
- 待做事项见 [TODO.md](./TODO.md)

---

## 依赖关系

主要依赖这些共享包：

- `@clients/auth`
- `@clients/request`
- `@clients/shared`
- `@clients/types`

UI 层当前还直接使用：

- `vue`
- `vue-router`
- `pinia`
- `element-plus`
- `highlight.js`

---

## 本地开发

在 `clients/web` 目录执行：

```sh
pnpm dev:go-note
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

## 当前定位

这个 app 是 `go-note` 业务在 Web 端的承载层。

适合放在这里的内容：

- 页面组件
- 路由组织
- 只服务于 `go-note` 的状态管理
- 只服务于 `go-note` 的视图逻辑

不适合直接堆在这里的内容：

- 多个 app 共用的 token 管理
- 通用请求封装
- 跨应用共享类型
- 通用 SSO / 登录态逻辑

这类内容应优先抽到 `clients/web/packages/*`。

---

## 维护建议

1. 只有 `go-note` 自己使用的逻辑，优先留在 app 内
2. 出现第二个 app 也要复用时，再考虑抽到 shared package
3. 每次页面结构或启动方式有明显变化时，同步更新本 README
