# go-note Web 接口对接清单

本文档面向 `clients/web/apps/go-note` 前端应用，整理当前页面实际依赖的接口、鉴权约定、字段结构与未接入能力。

目标：

- 给前后端联调一个统一口径
- 区分前端实际请求路径、网关路径、下游服务路径
- 明确哪些能力已经接入，哪些还只是 UI 占位

## 1. 调用链路

浏览器侧的 `go-note` Web 应用不直接访问 `go-note` 服务，而是统一走 API Gateway。

调用链路如下：

1. 前端请求 `/api/v1/...`
2. Vite 或 Nginx 将 `/api` 代理到 `api-gateway`
3. `api-gateway` 做鉴权、转发和字段适配
4. `api-gateway` 再调用 `go-note` 或 `user-platform`

当前前端实际请求入口：

- 认证相关：`/api/v1/users/*`
- 笔记相关：`/api/v1/notes/*`

## 2. 通用约定

### 2.1 统一响应格式

当前前端请求层要求所有成功响应都符合：

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

说明：

- `code !== 200` 时，前端按失败处理
- `data === null` 时，前端也按失败处理
- 错误时通常返回 `msg` 作为提示文案

### 2.2 鉴权方式

前端通过 `Authorization: Bearer <access_token>` 访问受保护接口。

网关完成 JWT 校验后：

- 将用户身份注入到下游请求
- `go-note` 服务内部通过 `X-User-Id` 识别当前用户

### 2.3 Token 刷新

前端在收到 `401` 后会自动调用：

- `POST /api/v1/users/refresh`

注意字段约定：

- 前端传给网关的是 `refresh_token`
- 网关再把它映射成下游鉴权服务需要的字段

## 3. 当前前端实际需要的接口

### 3.1 登录

- 用途：登录页账号密码登录
- 前端请求：`POST /api/v1/users/login`
- 是否鉴权：否
- 页面入口：`src/views/AuthView.vue`

请求体：

```json
{
  "username": "alice",
  "password": "Password123",
  "app_code": "go-note",
  "device_id": "browser-device-uuid"
}
```

成功响应 `data`：

```json
{
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "user_id": 1001,
  "username": "alice"
}
```

前端实际依赖字段：

- `access_token` 或兼容字段 `token`
- `refresh_token`
- `user_id`
- `username`

备注：

- 当前 `email` 不是登录成功的必需字段
- `app_code` 固定为 `go-note`
- `device_id` 由浏览器本地生成并缓存

### 3.2 刷新 Token

- 用途：请求返回 `401` 后自动续期
- 前端请求：`POST /api/v1/users/refresh`
- 是否鉴权：否
- 触发位置：`src/utils/request.ts`

请求体：

```json
{
  "refresh_token": "refresh-token"
}
```

成功响应 `data`：

```json
{
  "access_token": "new-jwt-token",
  "refresh_token": "new-refresh-token"
}
```

前端实际依赖字段：

- `access_token`
- `refresh_token`

### 3.3 获取我的代码片段列表

- 用途：首页列表展示
- 前端请求：`GET /api/v1/notes/me/snippets`
- 是否鉴权：是
- 页面入口：`src/views/HomeView.vue`

网关转发：

- 网关路径：`GET /api/v1/notes/me/snippets`
- 下游路径：`GET /api/v1/me/snippets`

成功响应 `data`：

```json
[
  {
    "id": 1,
    "owner_id": 1001,
    "title": "JWT middleware",
    "content": "package main\n...",
    "language": "go",
    "created_at": "2026-03-31T10:00:00+08:00",
    "updated_at": "2026-03-31T11:00:00+08:00"
  }
]
```

前端实际依赖字段：

- `id`
- `title`
- `content`
- `language`
- `created_at`
- `updated_at`
- `owner_id`

补充：

- 首页会按 `updated_at` 倒序展示
- 当前前端只做本地标题搜索，没有后端搜索接口

### 3.4 获取代码片段详情

- 用途：详情页展示、编辑前回填
- 前端请求：`GET /api/v1/notes/snippets/:id`
- 是否鉴权：是
- 页面入口：`src/views/PasteView.vue`、`src/views/SnippetEditorView.vue`

网关转发：

- 网关路径：`GET /api/v1/notes/snippets/:id`
- 下游路径：`GET /api/v1/snippets/:id`

路径参数：

- `id`: 代码片段 ID，正整数

成功响应 `data`：

```json
{
  "id": 1,
  "owner_id": 1001,
  "title": "JWT middleware",
  "content": "package main\n...",
  "language": "go",
  "created_at": "2026-03-31T10:00:00+08:00",
  "updated_at": "2026-03-31T11:00:00+08:00"
}
```

前端实际依赖字段：

- `id`
- `title`
- `content`
- `language`
- `created_at`
- `updated_at`
- `owner_id`

补充：

- 详情页代码高亮依赖 `language`
- 是否显示“编辑片段”按钮会参考 `owner_id`
- 当前前端详情页路由需要登录，不支持匿名访问公开片段

### 3.5 创建代码片段

- 用途：新建片段
- 前端请求：`POST /api/v1/notes/snippets`
- 是否鉴权：是
- 页面入口：`src/views/SnippetEditorView.vue`

网关转发：

- 网关路径：`POST /api/v1/notes/snippets`
- 下游路径：`POST /api/v1/snippets`

请求体：

```json
{
  "title": "JWT middleware",
  "content": "package main\n...",
  "language": "go"
}
```

字段要求：

- `title`: 必填
- `content`: 必填
- `language`: 必填

成功响应 `data`：

```json
{
  "id": 1,
  "owner_id": 1001,
  "title": "JWT middleware",
  "content": "package main\n...",
  "language": "go",
  "created_at": "2026-03-31T10:00:00+08:00",
  "updated_at": "2026-03-31T10:00:00+08:00"
}
```

前端保存成功后会跳转到：

- `/snippets/{id}`

### 3.6 更新代码片段

- 用途：编辑已有片段
- 前端请求：`PUT /api/v1/notes/snippets/:id`
- 是否鉴权：是
- 页面入口：`src/views/SnippetEditorView.vue`

网关转发：

- 网关路径：`PUT /api/v1/notes/snippets/:id`
- 下游路径：`PUT /api/v1/snippets/:id`

路径参数：

- `id`: 代码片段 ID，正整数

请求体：

```json
{
  "title": "JWT middleware v2",
  "content": "package main\n...",
  "language": "go"
}
```

成功响应 `data`：

```json
{
  "id": 1,
  "owner_id": 1001,
  "title": "JWT middleware v2",
  "content": "package main\n...",
  "language": "go",
  "created_at": "2026-03-31T10:00:00+08:00",
  "updated_at": "2026-03-31T12:00:00+08:00"
}
```

补充：

- 非本人更新会返回无权限错误
- 前端保存成功后会跳回详情页

## 4. 前端使用的 Snippet 字段模型

当前前端内部归一化后的模型如下：

```ts
interface Snippet {
  id: string | number
  title: string
  content: string
  language: string
  created_at: string
  updated_at: string
  owner_id?: number
}
```

说明：

- `id` 当前前端兼容 `string | number`
- `owner_id` 用于判断当前用户是否可编辑

## 5. SSO 弹窗授权约定

除了 HTTP API，`go-note` 前端还依赖 GoChat 统一认证前端提供的 SSO 弹窗授权流程。

### 5.1 打开 SSO 授权页

前端会以内嵌 iframe 的形式打开：

```text
{SSO_LOGIN_URL去掉末尾/login后的路径前缀}/sso?app_code=go-note&embed=1&opener_origin={当前页面origin}
```

注册流程则打开：

```text
{SSO_LOGIN_URL去掉末尾/login后的路径前缀}/register?app_code=go-note&embed=1&opener_origin={当前页面origin}
```

### 5.2 登录成功后的回传方式

GoChat 统一认证页登录或注册成功后，不再跳回 `/auth/callback`，而是通过 `postMessage` 将认证结果发回调用页。

消息体：

- `type = "sso:auth_result"`
- `payload.accessToken`
- `payload.refreshToken`
- `payload.userId`
- `payload.username`

前端收到消息后会完成：

1. 校验消息来源 origin/source
2. 写入本地登录态
3. 跳回原始 `redirect` 页面

## 6. 当前前端未接入的接口能力

下面这些功能在 UI 中仍然是占位或本地假逻辑，当前没有真实后端接口依赖：

- 删除片段
- 搜索接口
- 收藏
- 最近访问
- 与我共享
- 自定义分组
- 标签体系
- 上传本地文件
- 模板库
- 公开链接访问页
- 匿名访问公开片段
- 片段列表分页
- 片段列表筛选和排序接口
- 登出接口

## 7. 联调时建议重点确认

### 7.1 必须保持稳定的字段

这些字段一旦变化，前端页面会直接受影响：

- 登录：`access_token`、`refresh_token`、`user_id`、`username`
- 片段：`id`、`title`、`content`、`language`、`created_at`、`updated_at`

### 7.2 当前最好不要改的约定

- 网关前缀继续保持 `/api/v1/notes/*`
- 统一响应格式继续保持 `{ code, msg, data }`
- 刷新 token 接口对前端继续接收 `refresh_token`
- 片段可见性继续使用 `private | public`

### 7.3 可以后续扩展但前端还没消费的字段

- 更完整的用户信息
- 标签、分组、收藏状态
- 分页字段，如 `total`、`page`、`has_more`

## 8. 对应代码位置

前端：

- `src/api/snippet.ts`
- `src/api/user.ts`
- `src/utils/request.ts`
- `src/views/HomeView.vue`
- `src/views/PasteView.vue`
- `src/views/SnippetEditorView.vue`
- `src/views/AuthView.vue`

网关：

- `api-gateway/internal/handler/auth_handler.go`
- `api-gateway/internal/handler/note_handler.go`

下游服务：

- `go-note/internal/transport/http/router/router.go`
- `go-note/internal/transport/http/handler/paste_handler.go`
- `user-platform/internal/transport/http/handler/user_handler.go`
